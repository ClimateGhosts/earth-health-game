import React, { useContext, useEffect, useMemo, useState } from "react";
import { State } from "../types/state";
import { SocketContext } from "./socketio-common";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Operator } from "../types/soluzion-types-extra";
import { regionColors } from "../lib/colors";
import { geoCentroid } from "d3-geo";
import { interpolateRgb } from "d3-interpolate";
import _, { repeat } from "lodash";
import { RegionType } from "../types/earth-health-game";

const mapWidth = 800;
const mapHeight = 600;

export default () => {
  const { socket, url, isConnected } = useContext(SocketContext);
  const [roles, setRoles] = useState<number[]>([0, 1, 2, 3]);
  const [gameStarted, setGameStarted] = useState(false);

  const [state, setState] = useState<State | undefined>(undefined);
  const [operators, setOperators] = useState<Operator[]>([]);

  const [namesByRole, setNamesByRole] = useState([
    "Client",
    "Client",
    "Client",
    "Client",
  ]);

  useEffect(() => {
    if (!socket) return;

    socket.on("game_started", (event) => {
      if (!event.state) return;
      setGameStarted(true);
      setState(JSON.parse(event.state));
    });

    socket.on("operators_available", (event) => {
      setOperators(event.operators);
    });

    socket.on("operator_applied", (event) => {
      if (!event.state) return;

      setState(JSON.parse(event.state));
    });

    return () => {
      socket.off("game_started");
      socket.off("operators_available");
      socket.off("operator_applied");
    };
  }, [socket]);

  const currentTurn = !!state && roles.includes(state.current_player);

  // const [selectedRegion, setSelectedRegion] = useState("");

  const selectedRegion = useMemo(() => state?.current_region, [state]);

  const regionFromGeo = (geo: { rsmKey: string }) => {
    const id = parseInt(geo.rsmKey.replace("geo-", ""));
    const regionName = state!.world.map[id];

    return state!.world.regions[regionName];
  };

  return (
    <Container className={"h-auto"}>
      {state && (
        <div className={"m-2"}>
          <Card className={"rounded-4 overflow-hidden position-relative"}>
            <ComposableMap
              width={mapWidth}
              height={mapHeight}
              style={{ background: regionColors[RegionType.OCEAN] }}
              onClick={() => {
                // setSelectedRegion("");
              }}
            >
              <ZoomableGroup
                center={[0, 0]}
                zoom={2}
                minZoom={1.5}
                translateExtent={[
                  [0, -mapHeight],
                  [mapWidth, mapHeight],
                ]}
              >
                <Geographies
                  geography={
                    (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/map.geo.json"
                  }
                >
                  {({ geographies }) => {
                    const geos = _.chain(geographies)
                      .filter((_, i) => i < state.world.region_count)
                      .orderBy(
                        (geo) => regionFromGeo(geo).name === selectedRegion,
                      )
                      .value();

                    return geos
                      .map((geo) => {
                        const region = regionFromGeo(geo);
                        let color = regionColors[region.region_type._value_];
                        if (region.health <= 0) {
                          color = "#666";
                        }
                        const selected = selectedRegion === region.name;

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
                              <circle
                                r={0.5}
                                fill="#FF5533"
                                stroke="#FFFFFF"
                                strokeWidth={2}
                              />
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
                                  fontSize: 3,
                                  letterSpacing: -0.3,
                                }}
                              >
                                {repeat("❤️", region.health)}
                              </text>
                            </Marker>
                          );
                        }),
                      );
                  }}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            <div
              className={"position-absolute w-100 h-100 pointer-events-none"}
            >
              <Card
                className={"position-absolute shadow-lg w-25 ms-4 mt-4 p-3"}
              >
                <h3 className={"text-center"}>Player Info</h3>
                <Row className={"row-cols-1 g-2"}>
                  {state.players.map((player, i) => (
                    <Col key={i}>
                      Player {i} ({namesByRole[i]}): ${player.money}M
                    </Col>
                  ))}
                </Row>
              </Card>
              <Card
                className={
                  "position-absolute shadow-lg w-25 mt-4 me-4 p-3 end-0"
                }
              >
                <h3 className={"text-center"}>
                  Player {state.current_player} (
                  {namesByRole[state.current_player]}) choosing for{" "}
                  <u>{state.current_region}</u>
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
                    <Col
                      key={op_no}
                      className={"d-flex justify-content-center"}
                    >
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
          </Card>
        </div>
      )}
    </Container>
  );
};
