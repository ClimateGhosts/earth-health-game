export enum RegionType {
  OCEAN = "Ocean",
  MOUNTAIN = "Mountain",
  PLAINS = "Plains",
  WOODS = "Woods",
  MESA = "Mesa",
}

export enum DisasterType {
  EARTHQUAKE = "Earthquake",
  FIRE = "Fire",
  FLOOD = "Flood",
  WINDSTORM = "Windstorm",
}

export type GameOptions = {
  players: number;
};
