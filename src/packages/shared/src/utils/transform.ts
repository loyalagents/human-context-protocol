/**
 * Transforms string values to boolean values for query parameters
 * @param value - The value to transform
 * @returns Boolean value or original value if not a boolean string
 */
export function stringToBoolean(value: any): any {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}