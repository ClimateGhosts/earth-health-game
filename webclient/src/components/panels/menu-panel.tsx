import React, { useContext } from "react";
import cx from "classnames";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import { SocketContext } from "../socketio-common";

export default ({ className }: { className?: string }) => {
  const { leaveGame } = useContext(SocketContext);

  return (
    <div className={cx(className)}>
      <Dropdown drop={"down-centered"} className={"pointer-events-auto"}>
        <DropdownToggle
          variant={"outline-dark"}
          className={"border-0 fs-4 d-flex align-items-center"}
        >
          Menu
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to leave? This will end the game for other players.",
                )
              ) {
                leaveGame?.();
              }
            }}
          >
            Leave Game
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
