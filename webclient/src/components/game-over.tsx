import { State } from "../types/state";
import React, { Fragment } from "react";
import { displayMoney, GameContext, gameData } from "./game";
import { SocketContext } from "./socketio-common";
import { orderBy } from "lodash";
import { Col, Row } from "react-bootstrap";
import { Simulate } from "react-dom/test-utils";
import play = Simulate.play;

export default ({
  state,
  gameContext,
  socketContext,
}: {
  state: State;
  socketContext: SocketContext;
  gameContext: GameContext;
}) => {
  const { nameForPlayer } = gameContext;
  const { myRoles } = socketContext;

  const alivePlayers = state.players.filter((player) => player.regions_owned > 0);

  return (
    <>
      <h4 className={"mb-4"}>Total Remaining Players: {alivePlayers.length}</h4>
      <Row className={"row-cols-1 g-3"}>
        {orderBy(state.players, (player) => !myRoles.includes(player.player_id)).map((player) =>
          player.regions_owned > 0 ? (
            <>
              <Col>
                {nameForPlayer(player.player_id)} had {displayMoney(player.money)} and{" "}
                {player.regions_owned} remaining region(s)
              </Col>
              {Object.values(state.world.regions)
                .filter((region) => region.current_player === player.player_id)
                .map((region, i) => (
                  <Col key={i} className={"ms-4"}>
                    {region.name} ({region.biome}
                    {gameData.biome[region.biome].emoji}, {region.health}
                    ❤️)
                  </Col>
                ))}
            </>
          ) : (
            <Col>
              {nameForPlayer(player.player_id)} had {player.regions_owned} remaining regions
            </Col>
          ),
        )}
      </Row>
    </>
  );
};
