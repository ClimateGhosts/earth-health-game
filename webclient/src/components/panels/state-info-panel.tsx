import { Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import React, { useContext } from "react";
import { displayMoney, displayTime, GameContext, gameData } from "../game";
import cx from "classnames";
import { SocketContext } from "../socketio-common";
import { playerColor } from "../../lib/colors";
import { orderBy } from "lodash";
import DisasterEntry from "../disaster-entry";
import { State } from "../../types/state";
import { QuestionCircle } from "react-bootstrap-icons";

const ClimateBadness = ({ state }: { state: State }) => {
  const disastersPerRound =
    state.base_disasters + state.global_badness * state.disasters_per_badness;

  let message = "Moderate";
  if (disastersPerRound >= 5) message = "Bad";
  if (disastersPerRound >= 7) message = "Terrible";
  if (disastersPerRound >= 9) message = "Apocalyptic";

  return (
    <>
      Climate Severity: {message}
      <OverlayTrigger
        overlay={<Tooltip>Disasters Per Round: ~{disastersPerRound.toFixed(1)}</Tooltip>}
      >
        <QuestionCircle className={"text-muted mb-1 ms-1"} />
      </OverlayTrigger>
    </>
  );
};

export default ({ className }: { className?: string }) => {
  const { myRoles } = useContext(SocketContext);
  const { state, nameForPlayer } = useContext(GameContext);

  return (
    <Card
      className={cx("shadow-lg w-25 p-3 overflow-y-auto pointer-events-auto", className)}
      style={{ maxHeight: "80vh" }}
    >
      <h3 className={"text-center"}>State Info</h3>
      <Row className={"row-cols-1 g-2"}>
        <Col>
          Time: {displayTime(state.time)} (playing until {displayTime(state.final_turn)})
        </Col>
        <Col>
          <ClimateBadness state={state} />
        </Col>
      </Row>
      {state.players.some(
        (player) => myRoles.includes(player.player_id) && player.regions_owned <= 0,
      ) && (
        <>
          <h3 className={"text-center my-3"}>Next Possible Disasters</h3>
          <Row className={"row-cols-1 g-3"}>
            {state.disaster_buffer.map((disaster, i) => (
              <Col key={i}>
                <DisasterEntry disaster={disaster} state={state} nameForPlayer={nameForPlayer} />
              </Col>
            ))}
          </Row>
        </>
      )}
      <h3 className={"text-center my-3"}>Player Info</h3>
      <Row className={"row-cols-1 g-3"}>
        {orderBy(state.players, (player) => !myRoles.includes(player.player_id)).map((player) => (
          <Col key={player.player_id}>
            <Row
              className={"row-cols-1 p-2 g-2 rounded-2"}
              style={{ border: `.5rem ${playerColor(player.player_id)} solid` }}
            >
              {player.regions_owned > 0 ? (
                <>
                  <Col>
                    {nameForPlayer(player.player_id)}: {displayMoney(player.money)}
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
                <>{nameForPlayer(player.player_id)} 👻</>
              )}
            </Row>
          </Col>
        ))}
      </Row>
    </Card>
  );
};
