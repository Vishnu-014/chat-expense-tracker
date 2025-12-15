// lib/pastel-color.ts

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function generatePastelColor(key: string): string {
  const hash = hashString(key);

  // Soft modern palette range
  const hueRanges = [
    [200, 220], // soft blue
    [130, 150], // mint green
    [35, 45],   // peach
    [260, 280], // lavender
    [160, 180], // aqua
  ];

  const range = hueRanges[hash % hueRanges.length];

  const hue =
    range[0] + (hash % (range[1] - range[0]));
  const saturation = 32 + (hash % 6); // 32–38%
  const lightness = 87 + (hash % 5);  // 87–91%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
