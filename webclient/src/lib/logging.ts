import { Operators } from "../types/earth-health-game";
import { State } from "../types/state";

export const logForOperator = (
  event: ServerToClientEvents["operator_applied"],
  player: string,
  state: State,
) => {
  let message = `${player} has `;

  switch (event.operator.op_no) {
    case Operators.UP:
    case Operators.DOWN:
    case Operators.FOREIGN_AID:
    case Operators.RENAME_REGION:
      const region = state!.world.regions[event.operator.params![0]];

      switch (event.operator.op_no) {
        case Operators.UP:
          message += `exploited ${region.name}`;
          break;
        case Operators.DOWN:
          message += `healed ${region.name}`;
          break;
        case Operators.FOREIGN_AID:
          message += `sent foreign aid to ${region.name}`;
          break;
        case Operators.RENAME_REGION:
          message += `renamed ${region.name} to ${event.operator.params![1]}`;
          break;
      }

      break;
    case Operators.CLIMATE_GHOST:
      message += "has tipped the scales from beyond the grave";
      break;
    case Operators.END_TURN:
      message += "ended their turn";
      break;
  }

  return message;
};
