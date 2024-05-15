import { Card, Col, Row } from "react-bootstrap";
import { playerColors } from "../../lib/colors";
import React, { useContext } from "react";
import { SocketContext } from "../socketio-common";
import { GameContext } from "../game";
import cx from "classnames";

export default ({ className }: { className?: string }) => {
  const { socket, myRoles, roleInfo, isConnected, serverUrl, currentRoom } =
    useContext(SocketContext);
  const {
    state,
    namesByRole,
    currentRegion,
    selectedRegion,
    currentPlayer,
    myTurn,
    operators,
    nameForPlayer,
  } = useContext(GameContext);

  return (
    <Card className={cx("shadow-lg w-25 p-3", className)}>
      <h3 className={"text-center"}>Player Info</h3>
      <Row className={"row-cols-1 g-3"}>
        {state.players.map((player, i) => (
          <Col key={i}>
            <Row
              className={"row-cols-1 p-2 g-2 rounded-2"}
              style={{ border: `.5rem ${playerColors[i]} solid` }}
            >
              <Col>
                {nameForPlayer(i)}: ${player.money}M
              </Col>
              {Object.values(state.world.regions)
                .filter((region) => region.current_player === player.player_id)
                .map((region, i) => (
                  <Col key={i} className={"ms-4"}>
                    {region.name} ({region.region_type._value_}, {region.health}
                    ❤️)
                  </Col>
                ))}
            </Row>
          </Col>
        ))}
      </Row>
      <h3 className={"text-center mt-3"}>State Info</h3>
      <Row className={"row-cols-1 g-2"}>
        <Col>Time: {state.time}</Col>
        <Col>Climate Badness {state.global_badness}</Col>
      </Row>
    </Card>
  );
};
