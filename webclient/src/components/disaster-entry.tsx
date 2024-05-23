import { Devastation, State } from "../types/state";
import { gameData } from "./game";
import React from "react";
import { colorForDamage } from "./panels/selected-region-panel";

/**
 * Pass in the game state to have it say the region target
 */
export default ({ disaster, state }: { disaster: Devastation; state?: State }) => {
  const region = state?.world.regions[disaster.region_id];
  return (
    <>
      {gameData.disaster[disaster.disaster].emoji}
      {disaster.disaster}
      {disaster.damage && (
        <>
          {" "}
          dealt{" "}
          <span style={{ color: colorForDamage(disaster.damage) }}>{disaster.damage} damage</span>
        </>
      )}
      {region && (
        <>
          {" "}
          in {gameData.biome[region.biome].emoji}
          {region.name}
        </>
      )}
    </>
  );
};
