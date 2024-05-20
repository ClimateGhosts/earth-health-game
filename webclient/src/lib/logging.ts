import { Operators } from "../types/earth-health-game";
import { DisasterBuffer, State } from "../types/state";

export type Log = { time: number; message: string };

export const logMessageForOperator = (
  operator: ServerToClientEvents["operator_applied"]["operator"],
  player: string,
  state: State,
) => {
  let message = `${player} has `;

  switch (operator.op_no) {
    case Operators.UP:
    case Operators.DOWN:
    case Operators.FOREIGN_AID:
    case Operators.RENAME_REGION:
      const region = state!.world.regions[operator.params![0]];

      switch (operator.op_no) {
        case Operators.UP:
          message += `exploited ${region.name}.`;
          break;
        case Operators.DOWN:
          message += `healed ${region.name}.`;
          break;
        case Operators.FOREIGN_AID:
          message += `sent foreign aid to ${region.name}.`;
          break;
        case Operators.RENAME_REGION:
          message += `renamed ${region.name} to ${operator.params![1]}.`;
          break;
      }

      break;
    case Operators.CLIMATE_GHOST:
      message += "has tipped the scales from beyond the grave.";
      break;
    case Operators.END_TURN:
      message += "ended their turn.";
      break;
  }

  return message;
};

export const logsForTransitions = (
  prevState: State | undefined,
  newState: State,
) => {
  const newLogs = [] as Log[];

  if (!prevState || prevState.time === newState.time) {
    return newLogs;
  }

  for (let disaster of newState.current_disasters as DisasterBuffer[]) {
    newLogs.push({
      time: newState.time,
      message: `${disaster.disaster._value_} in ${disaster.region} (${disaster.damage} damage)`,
    });
  }

  for (let region of newState.world.regions) {
    if (
      region.health <= 0 &&
      (prevState?.world.regions[region.id].health ?? 0) > 0
    ) {
      newLogs.push({
        time: newState.time,
        message: `${region.name} was destroyed!`,
      });
    }
  }

  return newLogs;
};
