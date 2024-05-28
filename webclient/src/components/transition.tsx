import { State } from "../types/state";
import React, { Fragment } from "react";
import { displayMoney, displayTime, GameContext } from "./game";
import { SocketContext } from "./socketio-common";
import { difference } from "lodash";
import DisasterEntry from "./disaster-entry";

export default ({
  prevState,
  newState,
  gameContext,
  socketContext,
}: {
  prevState: State;
  newState: State;
  socketContext: SocketContext;
  gameContext: GameContext;
}) => {
  const { nameForPlayer } = gameContext;
  const { myRoles } = socketContext;

  const myDisasters = newState.devastations.filter((d) =>
    myRoles.includes(prevState.world.regions[d.region_id].current_player),
  );
  const otherDisasters = difference(newState.devastations, myDisasters);

  return (
    <>
      <h4 className={"mb-3"}>
        Time has progressed from {displayTime(prevState.time)} to {displayTime(newState.time)}
      </h4>

      <h5 className={"mb-3"}>You have spent {displayMoney(10)} on upkeep</h5>

      {newState.devastations.length === 0 ? (
        <h5 className={"mb-3"}>No Disasters Have Occurred!</h5>
      ) : (
        <>
          <h5 className={"mb-3"}>Total Disasters: {newState.devastations.length}</h5>
          <h5 className={"mb-3"}>{myDisasters.length} hit in your regions</h5>
          {myDisasters.map((disaster) => (
            <p>
              <DisasterEntry disaster={disaster} state={newState} />
            </p>
          ))}
          <h5 className={"mb-3"}>{otherDisasters.length} hit in other regions</h5>
          {otherDisasters.map((disaster) => (
            <p>
              <DisasterEntry disaster={disaster} state={newState} nameForPlayer={nameForPlayer} />
            </p>
          ))}
        </>
      )}
    </>
  );
};
