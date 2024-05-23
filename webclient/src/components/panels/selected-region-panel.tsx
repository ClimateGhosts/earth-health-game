import { Button, Card, Col, Row } from "react-bootstrap";
import { Operators } from "../../types/earth-health-game";
import { PencilFill } from "react-bootstrap-icons";
import React, { useContext } from "react";
import { GameContext, gameData } from "../game";
import { SocketContext } from "../socketio-common";
import cx from "classnames";
import useSound from "use-sound";

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

  return (
    currentRegion && (
      <Card className={cx("shadow-lg w-25 p-3 pointer-events-auto", className)}>
        <h2 className={"text-center"}>
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
          <Col>
            Health:{" "}
            {currentRegion.health > 0 ? `${currentRegion.health}❤️` : `💀`}
          </Col>
        </Row>
        {!gameOver && (
          <>
            <h3 className={"text-center"}>Actions</h3>
            <Row className={"row-cols-1 g-2 justify-content-center"}>
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
                          return (
                            currentRegion.current_player == state.current_player
                          );
                        case Operators.FOREIGN_AID:
                          return (
                            currentRegion.health > 0 &&
                            currentRegion.current_player !==
                              state.current_player
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
          </>
        )}
      </Card>
    )
  );
};
