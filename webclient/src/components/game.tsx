import React, { useContext, useEffect, useMemo, useState } from "react";
import { State } from "../types/state";
import { SocketContext } from "./socketio-common";
import {
  Button,
  Card,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  Row,
} from "react-bootstrap";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Operator } from "../types/soluzion-types-extra";
import { ansiToHtml, Color, playerColors, regionColors } from "../lib/colors";
import { geoCentroid } from "d3-geo";
import { interpolateHsl, interpolateRgb } from "d3-interpolate";
import _ from "lodash";
import { Operators, RegionEmoji, RegionType } from "../types/earth-health-game";
import { use100vh } from "react-div-100vh";
import { PencilFill } from "react-bootstrap-icons";

enum ColorMode {
  ByOwner = "By Owner",
  ByRegionType = "By Region Type",
  ByHealth = "By Health",
}

export default () => {
  const { socket, currentRoom, roleInfo, myRoles } = useContext(SocketContext);
  const [state, setState] = useState<State | undefined>(undefined);
  const [operators, setOperators] = useState<Operator[]>([]);
  const height = use100vh() || 1000;

  const namesByRole = useMemo(
    () =>
      currentRoom && roleInfo
        ? roleInfo.map(
            (role, i) =>
              currentRoom.players.find((player) => player.roles.includes(i))
                ?.name || "Unknown",
          )
        : [],
    [currentRoom, roleInfo],
  );

  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("game_started", (event) => {
      if (!event.state) return;
      setState(JSON.parse(event.state));
    });

    socket.on("operators_available", (event) => {
      setOperators(event.operators);
    });

    socket.on("operator_applied", (event) => {
      if (!event.state) return;

      setState(JSON.parse(event.state));
    });

    socket.on("transition", ({ message }) => {
      setTransitionText(message);
    });

    socket.on("game_ended", ({ message }) => {
      setTransitionText(message);
      setGameOver(true);
    });
  }, [socket]);

  const [selectedRegion, setSelectedRegion] = useState(-1);
  const currentRegion =
    selectedRegion < 0 || !state
      ? undefined
      : state.world.regions[selectedRegion];
  const currentPlayer = state?.players[state?.current_player];
  const myTurn = !!state && myRoles.includes(state.current_player);

  const regionForGeo = (geo: { rsmKey: string }) => {
    const id = parseInt(geo.rsmKey.replace("geo-", ""));
    return state!.world.regions[id];
  };
  const nameForPlayer = (playerId: number) =>
    `${roleInfo?.[playerId]?.name} (${namesByRole[playerId]})`;

  const [transitionText, setTransitionText] = useState("");

  const [colorMode, setColorMode] = useState(ColorMode.ByOwner);

  return (
    <div className={"h-auto user-select-none"}>
      {state && (
        <div className={"overflow-hidden position-relative d-flex"}>
          <ComposableMap
            height={1000}
            width={2000}
            style={{
              background: regionColors[RegionType.OCEAN],
              height: height,
              width: "100%",
            }}
            onClick={() => {
              setSelectedRegion(-1);
            }}
          >
            <ZoomableGroup center={[0, 0]} zoom={4} minZoom={3}>
              <Geographies
                geography={
                  (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/map.geo.json"
                }
              >
                {({ geographies }) => {
                  // Selected region goes to end of draw list so its border is fully visible
                  const geos = _.chain(geographies)
                    .filter((_, i) => i < state.world.region_count)
                    .orderBy([
                      (geo) => regionForGeo(geo).id === selectedRegion,
                      (geo) =>
                        regionForGeo(geo).current_player ===
                        state!.current_player,
                      (geo) =>
                        !(
                          regionForGeo(geo).id in currentPlayer!.current_actions
                        ),
                    ])
                    .value();

                  return geos
                    .map((geo) => {
                      const region = regionForGeo(geo);
                      let color = "#666";
                      if (region.health > 0) {
                        switch (colorMode) {
                          case ColorMode.ByRegionType:
                            color = regionColors[region.region_type._value_];
                            break;
                          case ColorMode.ByOwner:
                            color = playerColors[region.current_player];
                            break;
                          case ColorMode.ByHealth:
                            color = interpolateHsl(
                              Color.RED,
                              Color.GREEN,
                            )(region.health / 10);
                            break;
                        }
                      }
                      const selected = region.id === selectedRegion;
                      const has_actions =
                        myTurn &&
                        region.current_player === state!.current_player &&
                        !(region.id in currentPlayer!.current_actions);

                      return (
                        <Geography
                          key={region.name}
                          geography={geo}
                          fill={color}
                          style={{
                            default: {
                              stroke: selected
                                ? "#FFF"
                                : has_actions
                                  ? "#0F0"
                                  : "#666",
                              strokeWidth: 1,
                              outline: "none",
                            },
                            hover: {
                              stroke: selected
                                ? "#FFF"
                                : has_actions
                                  ? "#0F0"
                                  : "#666",
                              strokeWidth: 1,
                              fill: interpolateRgb(color, "#FFF")(0.2),
                              outline: "none",
                            },
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRegion(selected ? -1 : region.id);
                          }}
                        />
                      );
                    })
                    .concat(
                      geos.map((geo) => {
                        const region = regionForGeo(geo);
                        const centroid = geoCentroid(geo);

                        return (
                          <Marker
                            key={geo.rsmKey}
                            coordinates={centroid}
                            className={"pointer-events-none"}
                          >
                            <text
                              textAnchor="middle"
                              y={-2}
                              style={{
                                fontFamily: "system-ui",
                                fontWeight: "bold",
                                fontSize: 5,
                                fill: "#000",
                              }}
                              stroke={"#FFF"}
                              strokeWidth={0.2}
                            >
                              {region.name}
                            </text>
                            <text
                              textAnchor="middle"
                              y={4}
                              style={{
                                fontFamily: "system-ui",
                                fontWeight: "bold",
                                fontSize: 5,
                                fill: "#000",
                              }}
                              stroke={"#FFF"}
                              strokeWidth={0.2}
                            >
                              {region.health > 0 ? (
                                <>
                                  {region.health}❤️
                                  {RegionEmoji[region.region_type._value_]}
                                </>
                              ) : (
                                <>💀</>
                              )}
                            </text>
                          </Marker>
                        );
                      }),
                    );
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          <div className={"position-absolute w-100 h-100 pointer-events-none"}>
            <Card className={"position-absolute shadow-lg w-25 ms-4 mt-4 p-3"}>
              <h3 className={"text-center"}>Player Info</h3>
              <Row className={"row-cols-1 g-3"}>
                {state.players.map((player, i) => (
                  <Col key={i}>
                    <Row
                      className={"row-cols-1 p-2 g-2 rounded-2"}
                      style={{ border: `.5rem ${playerColors[i]} solid` }}
                    >
                      <Col>
                        {nameForPlayer(i)}: ${player.money}M
                      </Col>
                      {Object.values(state.world.regions)
                        .filter(
                          (region) =>
                            region.current_player === player.player_id,
                        )
                        .map((region, i) => (
                          <Col key={i} className={"ms-4"}>
                            {region.name} ({region.region_type._value_},{" "}
                            {region.health}❤️)
                          </Col>
                        ))}
                    </Row>
                  </Col>
                ))}
              </Row>
              <h3 className={"text-center mt-3"}>State Info</h3>
              <Row className={"row-cols-1 g-2"}>
                <Col>Time: {state.time}</Col>
                <Col>Climate Badness {state.global_badness}</Col>
              </Row>
            </Card>
            {currentRegion && (
              <Card
                className={
                  "position-absolute shadow-lg w-25 mt-4 me-4 p-3 end-0 pointer-events-auto"
                }
              >
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
                          socket!.emit("operator_chosen", {
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
                  <Col>
                    {currentRegion.health > 0 &&
                      `Owned by ${nameForPlayer(currentRegion.current_player)}`}
                  </Col>
                  <Col>
                    Region Type: {currentRegion.region_type._value_}
                    {RegionEmoji[currentRegion.region_type._value_]}
                  </Col>
                  <Col>
                    Health:{" "}
                    {currentRegion.health > 0
                      ? `${currentRegion.health}❤️`
                      : `💀`}
                  </Col>
                </Row>
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
                            case Operators.UP:
                            case Operators.DOWN:
                              return (
                                currentRegion.current_player ==
                                state.current_player
                              );
                            case Operators.FOREIGN_AID:
                              return (
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
                              onClick={() =>
                                socket!.emit("operator_chosen", {
                                  op_no: operator.op_no,
                                  params: [selectedRegion],
                                })
                              }
                            >
                              {operator.name}
                            </Button>
                          </Col>
                        ))}
                    </>
                  )}
                </Row>
              </Card>
            )}
            <Card
              className={
                "position-absolute bottom-0 end-0 m-4 shadow-lg w-auto p-3"
              }
            >
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
                        socket!.emit("operator_chosen", {
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
            <Card
              className={
                "position-absolute bottom-0 start-0 m-4 shadow-lg w-auto p-3"
              }
            >
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
          </div>
        </div>
      )}
      <Modal
        size={"lg"}
        show={!!transitionText}
        onHide={() => {
          setTransitionText("");
          if (gameOver) {
            window.location.reload();
          }
        }}
        backdrop={"static"}
        className={"user-select-none"}
      >
        <Modal.Header closeButton>
          <Modal.Title>{gameOver ? "Game Over!" : "Transition"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p dangerouslySetInnerHTML={{ __html: ansiToHtml(transitionText) }} />
        </Modal.Body>
      </Modal>
    </div>
  );
};
