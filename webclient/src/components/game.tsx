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
import { useList } from "react-use";
import SelectedRegionPanel from "./panels/selected-region-panel";
import EndTurnPanel from "./panels/end-turn-panel";
import StateInfoPanel from "./panels/state-info-panel";
import VisualOptionsPanel, { ColorMode } from "./panels/visual-options-panel";
import TransitionsModel from "./panels/transitions-model";
import GameMap from "./map/game-map";
import { logForOperator } from "../lib/logging";

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
};

export const GameContext = createContext<GameContext>(
  undefined as unknown as GameContext,
);

export default () => {
  const { socket, currentRoom, roleInfo, myRoles } = useContext(SocketContext);

  const [state, setState] = useState<State | undefined>(undefined);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(-1);
  const [transitions, transitionList] = useList([] as string[]);
  const [gameLogs, gameLog] = useList([] as string[]);

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

  useEffect(() => {
    if (!socket) return;

    socket.on("game_started", (event) => {
      if (!event.state) return;
      setState(JSON.parse(event.state));
      gameLogs.push("The game has started!");
    });

    socket.on("operators_available", (event) => {
      setOperators(event.operators);
    });

    socket.on("operator_applied", (event) => {
      if (!event.state) return;

      gameLogs.push(
        logForOperator(event, nameForPlayer(state!.current_player), state!),
      );

      setState(JSON.parse(event.state));
    });

    socket.on("transition", ({ message }) => {
      transitionList.push(message);
    });

    socket.on("game_ended", ({ message }) => {
      transitionList.push(message);
      setGameOver(true);
    });
  }, [socket]);

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
            options: {
              colorMode,
              setColorMode,
            },
          }}
        >
          <div className={"overflow-hidden position-relative d-flex"}>
            <div id={"map"}>
              <GameMap />
            </div>
            <div
              id={"ui"}
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
                className={"position-absolute bottom-0 start-0 m-4 "}
              />
              <TransitionsModel
                text={transitions.length > 0 ? transitions[0] : undefined}
                title={gameOver ? "Game Over!" : "Transition"}
                onHide={() => {
                  transitionList.removeAt(0);
                  if (gameOver) {
                    window.location.reload();
                  }
                }}
              />
            </div>
          </div>
        </GameContext.Provider>
      )}
    </div>
  );
};
