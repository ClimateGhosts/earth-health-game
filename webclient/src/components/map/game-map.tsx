import { regionColors } from "../../lib/colors";
import { RegionType } from "../../types/earth-health-game";
import { ComposableMap, Geographies, ZoomableGroup } from "react-simple-maps";
import React, { useContext } from "react";
import { use100vh } from "react-div-100vh";
import { GameContext } from "../game";
import { State } from "../../types/state";
import _ from "lodash";
import RegionGeography from "./region-geography";
import RegionMarker from "./region-marker";

export const regionForGeo = (geo: { rsmKey: string }, state: State) => {
  const id = parseInt(geo.rsmKey.replace("geo-", ""));
  return state!.world.regions[id];
};

export default () => {
  const height = use100vh() || 1000;
  const { state, currentPlayer, selectedRegion, setSelectedRegion } =
    useContext(GameContext);

  // Selected region goes to end of draw list so its border is fully visible
  const reorderGeos = (geographies: any[]) =>
    _.chain(geographies)
      .filter((_, i) => i < state.world.region_count)
      .orderBy([
        (geo) => regionForGeo(geo, state).id === selectedRegion,
        (geo) =>
          regionForGeo(geo, state).current_player === state!.current_player,
        (geo) =>
          !(regionForGeo(geo, state).id in currentPlayer!.current_actions),
      ])
      .value();

  return (
    <ComposableMap
      height={1000}
      width={2000}
      style={{
        background: regionColors[RegionType.OCEAN],
        height: height,
        width: "100%",
      }}
      onClick={() => setSelectedRegion(-1)}
    >
      <ZoomableGroup
        zoom={4}
        minZoom={3}
        translateExtent={[
          [600, 300],
          [1300, 700],
        ]}
      >
        <Geographies
          geography={
            (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/map.geo.json"
          }
        >
          {({ geographies }) => {
            const geos = reorderGeos(geographies);

            return geos
              .map((geo) => (
                <RegionGeography key={geo.rsmKey + "Geography"} geo={geo} />
              ))
              .concat(
                geos.map((geo) => (
                  <RegionMarker key={geo.rsmKey + "Marker"} geo={geo} />
                )),
              );
          }}
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
};
