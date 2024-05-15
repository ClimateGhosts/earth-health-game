import { RegionEmoji } from "../../types/earth-health-game";
import { Marker } from "react-simple-maps";
import React, { useContext } from "react";
import { geoCentroid } from "d3-geo";
import { regionForGeo } from "./game-map";
import { GameContext } from "../game";

export default ({ geo }: { geo: any }) => {
  const { state } = useContext(GameContext);
  const region = regionForGeo(geo, state);
  const centroid = geoCentroid(geo);

  return (
    <Marker coordinates={centroid} className={"pointer-events-none"}>
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
};
