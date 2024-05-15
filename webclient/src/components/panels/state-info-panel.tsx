import { Card, Col, Row } from "react-bootstrap";
import { playerColors } from "../../lib/colors";
import React, { useContext } from "react";
import { displayMoney, displayTime, GameContext } from "../game";
import cx from "classnames";
import { RegionEmoji } from "../../types/earth-health-game";

export default ({ className }: { className?: string }) => {
  const { state, nameForPlayer } = useContext(GameContext);

  return (
    <Card
      className={cx(
        "shadow-lg w-25 p-3 overflow-y-auto pointer-events-auto",
        className,
      )}
      style={{ maxHeight: "80vh" }}
    >
      <h3 className={"text-center"}>State Info</h3>
      <Row className={"row-cols-1 g-2"}>
        <Col>Time: {displayTime(state.time)}</Col>
        <Col>Climate Badness {state.global_badness}</Col>
      </Row>
      <h3 className={"text-center my-3"}>Player Info</h3>
      <Row className={"row-cols-1 g-3"}>
        {state.players.map((player, i) => (
          <Col key={i}>
            <Row
              className={"row-cols-1 p-2 g-2 rounded-2"}
              style={{ border: `.5rem ${playerColors[i]} solid` }}
            >
              <Col>
                {nameForPlayer(i)}: {displayMoney(player.money)}
              </Col>
              {Object.values(state.world.regions)
                .filter((region) => region.current_player === player.player_id)
                .map((region, i) => (
                  <Col key={i} className={"ms-4"}>
                    {region.name} ({region.region_type._value_}
                    {RegionEmoji[region.region_type._value_]}, {region.health}
                    ❤️)
                  </Col>
                ))}
            </Row>
          </Col>
        ))}
      </Row>
    </Card>
  );
};
