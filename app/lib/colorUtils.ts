export function rgbToColorName(r: number, g: number, b: number): string {
  // Black/white detection
  if (r < 60 && g < 60 && b < 60) return "Black";
  if (r > 210 && g > 210 && b > 210) return "White";

  // Grey scale detection
  const rg = Math.abs(r - g);
  const gb = Math.abs(g - b);
  const rb = Math.abs(r - b);

  if (rg < 18 && gb < 18 && rb < 18) {
    if (r > 180) return "Light Grey";
    if (r > 130) return "Grey";
    if (r > 90) return "Dark Grey";
    return "Charcoal";
  }

  // Main dominant detection
  if (b > r && b > g) return "Blue";
  if (r > g && r > b) return "Red";
  if (g > r && g > b) return "Green";

  // Mixed detection
  if (r > 160 && g > 120 && b < 90) return "Brown";
  if (r > 200 && g > 180 && b < 140) return "Beige";

  // fallback
  return "Dark";
}
