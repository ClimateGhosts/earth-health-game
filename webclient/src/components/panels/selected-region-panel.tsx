import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Operators } from "../../types/earth-health-game";
import { PencilFill, QuestionCircle } from "react-bootstrap-icons";
import React, { Fragment, useContext } from "react";
import { displayTime, GameContext, gameData } from "../game";
import { SocketContext } from "../socketio-common";
import cx from "classnames";
import useSound from "use-sound";
import { interpolateRgb } from "d3-interpolate";
import DisasterEntry from "../disaster-entry";

export const colorForDamage = (damage: number) => {
  const fraction = Math.min((1 + Math.abs(4 - damage)) / 3, 1);
  const endPoint = damage > 4 ? "red" : "green";

  return interpolateRgb("black", endPoint)(fraction);
};

const s = (num: number) => `${num >= 0 ? "+" : ""}${num}`;

export default ({ className }: { className?: string }) => {
  const { socket, myRoles } = useContext(SocketContext);
  const {
    state,
    currentRegion,
    selectedRegion,
    currentPlayer,
    myTurn,
    operators,
    nameForPlayer,
    gameOver,
  } = useContext(GameContext);

  const [playExploit] = useSound(
    (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/audio/EarthHealthExploit.mp3",
  );

  const [playHeal] = useSound(
    (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/audio/EarthHealthHeal.mp3",
  );

  const biome = gameData.biome[currentRegion?.biome ?? ""];
  const allDevastations = Object.values(currentRegion?.devastation_history ?? {}).flat();

  return (
    currentRegion && (
      <Card className={cx("shadow-lg w-25 p-3 pointer-events-auto", className)}>
        <Row className={"row-cols-1 g-3"}>
          <Col className={"text-center"}>
            <h2 className={"mb-3"}>
              {currentRegion.name}
              {myRoles.includes(currentRegion.current_player) && (
                <Button
                  size={"sm"}
                  variant={"outline-primary"}
                  className={"border-0"}
                  onClick={() => {
                    const newName = prompt(
                      "Choose a new name for this region",
                      currentRegion!.name,
                    );
                    if (newName && newName !== currentRegion!.name) {
                      socket.emit("operator_chosen", {
                        op_no: Operators.RENAME_REGION,
                        params: [currentRegion!.id, newName],
                      });
                    }
                  }}
                >
                  <PencilFill />
                </Button>
              )}
            </h2>
            <Row className={"fs-5 g-2 row-cols-2"}>
              {currentRegion.health > 0 && (
                <Col>Owned by: {nameForPlayer(currentRegion.current_player)}</Col>
              )}
              <Col>
                Biome: {currentRegion.biome}
                {gameData.biome[currentRegion.biome].emoji}
              </Col>
              <Col>Health: {currentRegion.health > 0 ? `${currentRegion.health}❤️` : `💀`}</Col>
            </Row>
          </Col>
          <Col className={"text-center"}>
            <h3 className={"mb-3"}>Disaster History</h3>
            <Row className={"row-cols-1 g-3 justify-content-center"}>
              {allDevastations.length > 0 ? (
                Object.entries(currentRegion.devastation_history).map(([time, disasters]) => (
                  <Fragment key={time}>
                    {disasters.map((disaster, i) => (
                      <Col key={i}>
                        {displayTime(parseInt(time))}: <DisasterEntry disaster={disaster} />
                      </Col>
                    ))}
                  </Fragment>
                ))
              ) : (
                <Col>No disasters have hit this region yet.</Col>
              )}
            </Row>
          </Col>
          {currentRegion.current_player >= 0 && (
            <Col className={"text-center"}>
              <h3 className={"mb-3"}>Disaster Affinity</h3>
              <Row className={"row-cols-2 g-2"}>
                {gameData.disasters.map((disaster) => {
                  let damage = disaster.damage;
                  const explanation = [`${damage} base damage`];

                  const biomeModifier = biome.disaster_matrix[disaster.name] ?? 0;
                  damage += biomeModifier;
                  explanation.push(`${s(biomeModifier)} from ${biome.emoji}${biome.name}`);

                  for (const devastation of allDevastations) {
                    const oldDisaster = gameData.disaster[devastation.disaster];
                    const disasterModifier = oldDisaster.disaster_matrix?.[disaster.name] ?? 0;
                    damage += disasterModifier;
                    if (disasterModifier !== 0) {
                      explanation.push(
                        `${s(disasterModifier)} from prior ${oldDisaster.emoji}${oldDisaster.name}`,
                      );
                    }
                  }

                  explanation.push(`= ${damage} total damage`);

                  return (
                    <Col
                      key={disaster.name}
                      className={"d-flex flex-row justify-content-center align-items-center"}
                    >
                      {disaster.emoji}
                      {disaster.name}:
                      <span className={"mx-1"} style={{ color: colorForDamage(damage) }}>
                        {damage} damage
                      </span>
                      <OverlayTrigger
                        overlay={
                          <Tooltip>
                            {explanation.map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </Tooltip>
                        }
                      >
                        <QuestionCircle className={"text-muted"} />
                      </OverlayTrigger>
                    </Col>
                  );
                })}
              </Row>
            </Col>
          )}
          {!gameOver && currentRegion.current_player >= 0 && (
            <Col>
              <h3 className={"text-center mb-3"}>Actions</h3>
              <Row className={"row-cols-1 g-3 justify-content-center"}>
                {!myTurn && <Col>Not your turn.</Col>}
                {currentRegion.id in currentPlayer!.current_actions ? (
                  <Col>Already taken action this turn.</Col>
                ) : (
                  <>
                    {operators
                      .filter((operator) => {
                        switch (operator.op_no) {
                          case Operators.EXPLOIT:
                          case Operators.HEAL:
                            return currentRegion.current_player == state.current_player;
                          case Operators.FOREIGN_AID:
                            return (
                              currentRegion.health > 0 &&
                              currentRegion.current_player !== state.current_player
                            );
                          default:
                            return false;
                        }
                      })
                      .map((operator) => (
                        <Col xs={"auto"}>
                          <Button
                            onClick={() => {
                              socket.emit("operator_chosen", {
                                op_no: operator.op_no,
                                params: [selectedRegion],
                              });

                              switch (operator.op_no) {
                                case Operators.HEAL:
                                  playHeal();
                                  break;
                                case Operators.EXPLOIT:
                                  playExploit();
                                  break;
                              }
                            }}
                          >
                            {operator.name}
                          </Button>
                        </Col>
                      ))}
                  </>
                )}
              </Row>
            </Col>
          )}
        </Row>
      </Card>
    )
  );
};
