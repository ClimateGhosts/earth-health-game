import { DisasterType, RegionType } from "../types/earth-health-game";

enum Color {
  RED = "#C0392B", // A deep red
  GREEN = "#27AE60", // A rich green
  YELLOW = "#F1C40F", // A muted gold
  BLUE = "#2980B9", // A strong blue
  MAGENTA = "#8E44AD", // A muted magenta
  CYAN = "#16A085", // A sea green
  WHITE = "#ECF0F1", // A soft white
}

export const regionColors = {
  [RegionType.MESA]: Color.RED,
  [RegionType.MOUNTAIN]: Color.CYAN,
  [RegionType.OCEAN]: Color.BLUE,
  [RegionType.PLAINS]: Color.YELLOW,
  [RegionType.WOODS]: Color.GREEN,
} as const satisfies Record<RegionType, string>;

export const disasterColors = {
  [DisasterType.EARTHQUAKE]: Color.GREEN,
  [DisasterType.FIRE]: Color.RED,
  [DisasterType.FLOOD]: Color.BLUE,
  [DisasterType.WINDSTORM]: Color.YELLOW,
} as const satisfies Record<DisasterType, string>;
