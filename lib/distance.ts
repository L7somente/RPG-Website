export type DistanceUnit = "ft" | "m";
export const METERS_PER_FOOT = 0.3048;
export function displayDistance(feet: number, unit: DistanceUnit): number {
  return Number((unit === "m" ? feet * METERS_PER_FOOT : feet).toFixed(4));
}
export function distanceInFeet(value: number, unit: DistanceUnit): number {
  return Number((unit === "m" ? value / METERS_PER_FOOT : value).toFixed(8));
}
