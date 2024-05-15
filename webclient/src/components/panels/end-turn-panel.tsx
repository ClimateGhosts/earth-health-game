import { Button, Card } from "react-bootstrap";
import { Operators } from "../../types/earth-health-game";
import React, { useContext } from "react";
import { SocketContext } from "../socketio-common";
import { GameContext } from "../game";
import cx from "classnames";

export default ({ className }: { className?: string }) => {
  const { socket } = useContext(SocketContext);
  const { state, currentPlayer, operators, nameForPlayer } =
    useContext(GameContext);

  return (
    <Card className={cx("shadow-lg w-auto p-3", className)}>
      <h3 className={"text-center pointer-events-auto"}>
        {operators.length > 0 ? (
          <>
            <div>It is your turn</div>
            <Button
              className={"mt-3 w-100"}
              variant={
                state!.world.regions.some(
                  (region) =>
                    region.current_player === state.current_player &&
                    !(region.id in currentPlayer!.current_actions),
                )
                  ? "primary"
                  : "success"
              }
              onClick={() =>
                socket.emit("operator_chosen", {
                  op_no: Operators.END_TURN,
                  params: null,
                })
              }
            >
              End Turn
            </Button>
          </>
        ) : (
          `${nameForPlayer(state!.current_player)} is acting`
        )}
      </h3>
    </Card>
  );
};
