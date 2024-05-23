import React, {
  createContext,
  Dispatch,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Player, Region, State } from "../types/state";
import { SocketContext } from "./socketio-common";
import { Operator } from "../types/soluzion-types-extra";
import { useList, usePrevious } from "react-use";
import SelectedRegionPanel from "./panels/selected-region-panel";
import EndTurnPanel from "./panels/end-turn-panel";
import StateInfoPanel from "./panels/state-info-panel";
import VisualOptionsPanel, { ColorMode } from "./panels/visual-options-panel";
import TransitionsModel from "./panels/transitions-model";
import GameMap from "./map/game-map";
import { Log, logMessageForOperator, logsForTransitions } from "../lib/logging";
import GameLogPanel from "./panels/game-log-panel";
import useSound from "use-sound";
import gamedata from "../../../shared/gamedata.json";
import { GameData } from "../types/game-data";
import { keyBy } from "lodash";
import MenuPanel from "./panels/menu-panel";

type GameContext = {
  state: State;
  operators: Operator[];
  namesByRole: string[];
  selectedRegion: number;
  setSelectedRegion: Dispatch<number>;
  currentRegion: Region | undefined;
  currentPlayer: Player | undefined;
  myTurn: boolean;
  nameForPlayer: (id: number) => string;
  options: {
    colorMode: ColorMode;
    setColorMode: Dispatch<ColorMode>;
  };
  gameOver: boolean;
};

export const displayTime = (time: number) => 2050 + time * 10;
export const displayMoney = (money: number) => `$${money}M`;

export const GameContext = createContext<GameContext>(
  undefined as unknown as GameContext,
);

export const gameData = {
  ...(gamedata as GameData),
  biome: keyBy(gamedata.biomes, (b) => b.name),
  disaster: keyBy(gamedata.disasters, (d) => d.name),
  disasterCombo: keyBy(gamedata.disaster_combos, (d) => d.name),
};

export default () => {
  const { socket, currentRoom, roleInfo, myRoles } = useContext(SocketContext);

  const [state, setState] = useState<State | undefined>(undefined);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(-1);
  const [transitions, transitionList] = useList([] as string[]);
  const [gameLogs, gameLog] = useList([] as Log[]);
  const [lastOperator, setLastOperator] = useState<
    | (ServerToClientEvents["operator_applied"]["operator"] & {
        player: number;
        time: number;
      })
    | undefined
  >(undefined);

  const [colorMode, setColorMode] = useState(ColorMode.ByOwner);

  const namesByRole = useMemo(
    () =>
      currentRoom && roleInfo
        ? roleInfo.map(
            (role, i) =>
              currentRoom.players.find((player) => player.roles.includes(i))
                ?.name || "Unknown",
          )
        : [],
    [currentRoom, roleInfo],
  );

  const currentRegion =
    selectedRegion < 0 || !state
      ? undefined
      : state.world.regions[selectedRegion];
  const currentPlayer = state?.players[state?.current_player];
  const myTurn = !!state && myRoles.includes(state.current_player);

  const nameForPlayer = (playerId: number) =>
    `${roleInfo?.[playerId]?.name} (${namesByRole[playerId]})`;

  const [playMyTurnSound] = useSound(
    (process.env.NEXT_PUBLIC_BASE_PATH || "") +
      "/audio/EarthHealthTurnStart.mp3",
  );

  const previousState = usePrevious(state);

  useEffect(() => {
    if (
      state &&
      previousState?.current_player !== state.current_player &&
      myRoles.includes(state.current_player)
    ) {
      playMyTurnSound();
    }
  }, [state, myRoles]);

  useEffect(() => {
    if (!socket) return;

    socket.on("game_started", (event) => {
      if (!event.state) return;
      setState(JSON.parse(event.state) as State);
      gameLogs.push({ time: 0, message: "The game has started!" });
    });

    socket.on("operators_available", (event) => {
      setOperators(event.operators);
    });

    socket.on("operator_applied", (event) => {
      if (!event.state) return;

      setState((prevState) => {
        setLastOperator({
          ...event.operator,
          player: prevState?.current_player ?? 0,
          time: prevState?.time ?? 0,
        });

        const newState = JSON.parse(event.state!) as State;

        gameLog.push(...logsForTransitions(prevState, newState));

        return newState;
      });
    });

    socket.on("transition", ({ message }) => {
      transitionList.push(message);
    });

    socket.on("disconnect", () => {
      if (!state) return;
      alert("You have been disconnected from the server");
      window.location.reload();
    });

    socket.on("room_left", ({ username }) => {
      if (!state) return;
      setGameOver(true);
      transitionList.push(
        `${username} has left the game! Reconnection has not yet been implemented, so unfortunately the game must end.`,
      );
    });
  }, [socket]);

  useEffect(() => {
    if (lastOperator) {
      gameLog.push({
        time: lastOperator.time,
        message: logMessageForOperator(
          lastOperator,
          nameForPlayer(lastOperator.player),
          state!,
        ),
      });
    }
  }, [lastOperator]);

  useEffect(() => {
    if (!currentRoom) {
      setState(undefined);
    }
  }, [currentRoom]);

  return (
    <div className={"h-auto user-select-none"}>
      {state && (
        <GameContext.Provider
          value={{
            state,
            operators,
            namesByRole,
            selectedRegion,
            setSelectedRegion,
            currentRegion,
            currentPlayer,
            myTurn,
            nameForPlayer,
            gameOver,
            options: {
              colorMode,
              setColorMode,
            },
          }}
        >
          <div className={"overflow-hidden position-relative d-flex"}>
            <GameMap />
            <div
              className={"position-absolute w-100 h-100 pointer-events-none"}
            >
              <StateInfoPanel
                className={"position-absolute top-0 start-0 m-4"}
              />
              <SelectedRegionPanel
                className={"position-absolute top-0 end-0 m-4"}
              />
              <EndTurnPanel
                className={"position-absolute bottom-0 end-0 m-4"}
              />
              <VisualOptionsPanel
                className={"position-absolute bottom-0 start-0 m-4"}
              />
              <GameLogPanel
                className={"position-absolute bottom-0 absolute-centered-x m-4"}
                gameLogs={gameLogs}
              />
              <MenuPanel
                className={"position-absolute top-0 absolute-centered-x m-4"}
              />
              <TransitionsModel
                text={transitions.length > 0 ? transitions[0] : undefined}
                title={gameOver ? "Game Over!" : "Transition"}
                onHide={() => {
                  transitionList.removeAt(0);
                }}
              />
            </div>
          </div>
        </GameContext.Provider>
      )}
    </div>
  );
};
