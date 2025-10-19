import { TeamColor } from '@/models/Team';

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Lighten a hex color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  
  // Calculate lighter color
  const newR = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));

  return rgbToHex(newR, newG, newB);
}

/**
 * Darken a hex color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  
  // Calculate darker color
  const newR = Math.max(0, Math.round(r * (1 - percent / 100)));
  const newG = Math.max(0, Math.round(g * (1 - percent / 100)));
  const newB = Math.max(0, Math.round(b * (1 - percent / 100)));

  return rgbToHex(newR, newG, newB);
}

/**
 * Generate secondary color from primary color (lighter version)
 */
export function generateSecondaryColor(primaryColor: string, lightenPercent: number = 80): string {
  return lightenColor(primaryColor, lightenPercent);
}

/**
 * Create a team color object from a primary color
 */
export function createTeamColor(primaryColor: string): TeamColor {
  return {
    primary: primaryColor,
    secondary: generateSecondaryColor(primaryColor)
  };
}

/**
 * Validate if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Get contrast color (black or white) for text on a background
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const { r, g, b } = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Predefined color palettes for teams
 */
export const TEAM_COLOR_PALETTES = [
  { name: 'Blue', primary: '#3B82F6', secondary: '#DBEAFE' },
  { name: 'Green', primary: '#10B981', secondary: '#D1FAE5' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#EDE9FE' },
  { name: 'Orange', primary: '#F59E0B', secondary: '#FEF3C7' },
  { name: 'Red', primary: '#EF4444', secondary: '#FEE2E2' },
  { name: 'Indigo', primary: '#6366F1', secondary: '#E0E7FF' },
  { name: 'Pink', primary: '#EC4899', secondary: '#FCE7F3' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#CCFBF1' },
  { name: 'Emerald', primary: '#059669', secondary: '#D1FAE5' },
  { name: 'Violet', primary: '#7C3AED', secondary: '#EDE9FE' },
  { name: 'Amber', primary: '#D97706', secondary: '#FEF3C7' },
  { name: 'Rose', primary: '#E11D48', secondary: '#FEE2E2' }
];

/**
 * Get default team color
 */
export function getDefaultTeamColor(): TeamColor {
  return createTeamColor('#3B82F6'); // Blue
}

/**
 * Generate a random team color from the palette
 */
export function getRandomTeamColor(): TeamColor {
  const randomPalette = TEAM_COLOR_PALETTES[Math.floor(Math.random() * TEAM_COLOR_PALETTES.length)];
  return createTeamColor(randomPalette.primary);
}
