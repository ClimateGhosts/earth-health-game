import React, { useContext, useEffect, useMemo, useState } from "react";
import { State } from "../types/state";
import { SocketContext } from "./socketio-common";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Operator } from "../types/soluzion-types-extra";
import { ansiToHtml, regionColors } from "../lib/colors";
import { geoCentroid } from "d3-geo";
import { interpolateRgb } from "d3-interpolate";
import _ from "lodash";
import { RegionType } from "../types/earth-health-game";
import { use100vh } from "react-div-100vh";

export default () => {
  const { socket, currentRoom, roleInfo } = useContext(SocketContext);

  const [state, setState] = useState<State | undefined>(undefined);
  const [operators, setOperators] = useState<Operator[]>([]);

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

  const selectedRegion = state?.current_region;

  const regionFromGeo = (geo: { rsmKey: string }) => {
    const id = parseInt(geo.rsmKey.replace("geo-", ""));
    return state!.world.regions[id];
  };

  const [transitionText, setTransitionText] = useState("");

  const height = use100vh() || 1000;

  return (
    <div className={"h-auto"}>
      {state && (
        <div className={"overflow-hidden position-relative d-flex"}>
          <ComposableMap
            style={{
              background: regionColors[RegionType.OCEAN],
              height: height,
              width: "100%",
            }}
            onClick={() => {
              // setSelectedRegion("");
            }}
          >
            <ZoomableGroup center={[0, 0]} zoom={2} minZoom={1.5}>
              <Geographies
                geography={
                  (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/map.geo.json"
                }
              >
                {({ geographies }) => {
                  const geos = _.chain(geographies)
                    .filter((_, i) => i < state.world.region_count)
                    .orderBy((geo) => regionFromGeo(geo).id === selectedRegion)
                    .value();

                  return geos
                    .map((geo) => {
                      const region = regionFromGeo(geo);
                      let color = regionColors[region.region_type._value_];
                      if (region.health <= 0) {
                        color = "#666";
                      }
                      const selected = selectedRegion === region.id;

                      return (
                        <Geography
                          key={region.name}
                          geography={geo}
                          fill={color}
                          style={{
                            default: {
                              stroke: selected ? "#FFF" : "#666",
                              strokeWidth: 1,
                              outline: "none",
                            },
                            hover: {
                              stroke: selected ? "#FFF" : "#666",
                              strokeWidth: 1,
                              fill: interpolateRgb(color, "#FFF")(0.2),
                              outline: "none",
                            },
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            // setSelectedRegion(selected ? "" : region.name);
                          }}
                        />
                      );
                    })
                    .concat(
                      geos.map((geo) => {
                        const region = regionFromGeo(geo);
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
                                <>{region.health}❤️</>
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
              <Row className={"row-cols-1 g-2"}>
                {state.players.map((player, i) => (
                  <Col key={i}>
                    <Row className={"row-cols-1 g-2"}>
                      <Col>
                        Player {i} ({namesByRole[i]}): ${player.money}M
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
            <Card
              className={"position-absolute shadow-lg w-25 mt-4 me-4 p-3 end-0"}
            >
              <h3 className={"text-center"}>
                Player {state.current_player} (
                {namesByRole[state.current_player]}) choosing for{" "}
                <u>{state.world.regions[state.current_region]?.name}</u>
              </h3>
            </Card>
            <Card
              className={
                "position-absolute absolute-centered-x bottom-0 mb-4 shadow-lg w-auto p-3 "
              }
            >
              <h3 className={"text-center"}>
                {operators.length > 0 ? "Operators" : "Waiting for Others"}
              </h3>
              <Row className={"row-cols-1 g-2 mb-2  pointer-events-auto"}>
                {operators.map(({ op_no, name }) => (
                  <Col key={op_no} className={"d-flex justify-content-center"}>
                    <Button
                      onClick={() =>
                        socket!.emit("operator_chosen", {
                          op_no,
                          params: null,
                        })
                      }
                    >
                      ({op_no}) {name}
                    </Button>
                  </Col>
                ))}
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
