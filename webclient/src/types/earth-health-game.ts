export enum RegionType {
  OCEAN = "Ocean",
  MOUNTAIN = "Mountain",
  PLAINS = "Plains",
  WOODS = "Woods",
  MESA = "Mesa",
}

export const RegionEmoji = {
  [RegionType.OCEAN]: "🌊",
  [RegionType.MOUNTAIN]: "⛰️",
  [RegionType.PLAINS]: "🌾",
  [RegionType.WOODS]: "🌲",
  [RegionType.MESA]: "🏜️",
} as const satisfies Record<RegionType, string>;

export enum DisasterType {
  EARTHQUAKE = "Earthquake",
  FIRE = "Fire",
  FLOOD = "Flood",
  WINDSTORM = "Windstorm",
}

export type GameOptions = {
  players: number;
};

export enum Operators {
  UP = 0,
  DOWN = 1,
  FOREIGN_AID = 2,
  CLIMATE_GHOST = 3,
  END_TURN = 4,
}
