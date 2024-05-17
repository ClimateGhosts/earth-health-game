import { interpolateHsl, interpolateRgb } from "d3-interpolate";
import { Geography } from "react-simple-maps";
import React, { useContext } from "react";
import { ColorMode } from "../panels/visual-options-panel";
import { Color, playerColors, regionColors } from "../../lib/colors";
import { regionForGeo } from "./game-map";
import { GameContext } from "../game";

export default ({ geo }: { geo: any }) => {
  const {
    state,
    selectedRegion,
    setSelectedRegion,
    myTurn,
    currentPlayer,
    options: { colorMode },
  } = useContext(GameContext);
  const region = regionForGeo(geo, state);

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
        color = interpolateHsl(Color.RED, Color.GREEN)(region.health / 10);
        break;
    }
  }
  const selected = region.id === selectedRegion;
  const has_actions =
    myTurn &&
    region.current_player === state!.current_player &&
    !(region.id in currentPlayer!.current_actions) &&
    region.health > 0;

  return (
    <Geography
      geography={geo}
      fill={color}
      style={{
        default: {
          stroke: selected ? "#FFF" : has_actions ? "#0F0" : "#666",
          strokeWidth: 1,
          outline: "none",
        },
        hover: {
          stroke: selected ? "#FFF" : has_actions ? "#0F0" : "#666",
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
};
