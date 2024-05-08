import { DisasterType, RegionType } from "../types/earth-health-game";

enum Color {
  RED = "#C0392B", // A deep red
  GREEN = "#27AE60", // A rich green
  YELLOW = "#F1C40F", // A muted gold
  BLUE = "#2980B9", // A strong blue
  MAGENTA = "#8E44AD", // A muted magenta
  CYAN = "#16A085", // A sea green
  WHITE = "#ECF0F1", // A soft white
  ORANGE = "#E67E22", // A deep orange
  PURPLE = "#9B59B6", // A subdued purple
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

const ansiColors = {
  "91": Color.RED,
  "92": Color.GREEN,
  "93": Color.YELLOW,
  "94": Color.BLUE,
  "95": Color.MAGENTA,
  "96": Color.CYAN,
  "97": Color.WHITE,
  "33": Color.ORANGE,
  "105": Color.PURPLE,
};

export const ansiToHtml = (text: string) => {
  // Replace ANSI color codes with HTML span elements
  text = text.replace(/\x1b\[(\d+)m/g, (match, p1) => {
    const color = ansiColors[p1];
    if (color) {
      return `<span style="color:${color}">`;
    } else if (p1 === "0") {
      return "</span>";
    }
    return match; // Return original string if no match found
  });

  // Replace newlines with HTML line breaks
  text = text.replace(/\n/g, "<br><br>");

  // Handle unclosed span tags if the input text does not reset color at the end
  return `<div>${text}</div>`;
};
