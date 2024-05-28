import { Devastation, State } from "../types/state";
import { gameData } from "./game";
import React from "react";
import { colorForDamage } from "./panels/selected-region-panel";

/**
 * Pass in the game state to have it say the region target / nameForPlayer to also say player name
 */
export default ({
  disaster,
  state,
  nameForPlayer,
}: {
  disaster: Devastation;
  state?: State;
  nameForPlayer?: (id: number) => string;
}) => {
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
          {region.health <= 0 && " (DESTROYED💀)"}
          {nameForPlayer && <> for {nameForPlayer(disaster.current_owner)}</>}
        </>
      )}
    </>
  );
};
