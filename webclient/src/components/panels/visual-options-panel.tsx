import {
  Card,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";
import React, { useContext } from "react";
import cx from "classnames";
import { GameContext } from "../game";

export enum ColorMode {
  ByOwner = "By Owner",
  ByBiome = "By Biome",
  ByHealth = "By Health",
}
export default ({ className }: { className?: string }) => {
  const {
    options: { colorMode, setColorMode },
  } = useContext(GameContext);

  return (
    <Card className={cx("position-absolute shadow-lg w-auto p-3", className)}>
      <Row className={"row-cols-1 g-3 pointer-events-auto"}>
        <Col className={"d-flex flex-row align-items-center"}>
          <span className={"me-3"}>Region Color Mode</span>
          <Dropdown>
            <DropdownToggle size={"sm"}>{colorMode}</DropdownToggle>
            <DropdownMenu>
              {Object.values(ColorMode).map((mode) => (
                <DropdownItem
                  key={mode}
                  active={mode === colorMode}
                  onClick={() => setColorMode(mode)}
                >
                  {mode}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </Col>
      </Row>
    </Card>
  );
};
