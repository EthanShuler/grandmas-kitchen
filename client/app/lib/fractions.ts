/**
 * Convert a decimal number to a mixed fraction string
 * Examples: 1.5 -> "1 1/2", 0.25 -> "1/4", 2.75 -> "2 3/4"
 */
export function decimalToFraction(decimal: number | null | undefined): string {
  if (decimal === null || decimal === undefined || decimal === 0) {
    return '';
  }

  const tolerance = 1.0e-6;
  let numerator = 1;
  let denominator = 1;
  let fractionPart = Math.abs(decimal) % 1;
  const wholePart = Math.floor(Math.abs(decimal));

  // Common fractions for cooking
  const commonFractions = [
    [1, 2], [1, 3], [2, 3], [1, 4], [3, 4],
    [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 6], [5, 6]
  ];

  // Check if it matches a common fraction
  let found = false;
  for (const [n, d] of commonFractions) {
    if (Math.abs(fractionPart - n / d) < tolerance) {
      numerator = n;
      denominator = d;
      found = true;
      break;
    }
  }

  // If not a common fraction, use continued fractions algorithm
  if (!found && fractionPart > tolerance) {
    let a = fractionPart;
    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;

    for (let i = 0; i < 20; i++) {
      const b = Math.floor(a);
      const h = b * h1 + h2;
      const k = b * k1 + k2;

      if (Math.abs(fractionPart - h / k) < tolerance || k > 16) {
        numerator = h;
        denominator = k;
        break;
      }

      h2 = h1; h1 = h;
      k2 = k1; k1 = k;
      a = 1 / (a - b);
    }
  }

  // Build the result string
  if (fractionPart < tolerance) {
    // Just a whole number
    return wholePart.toString();
  } else if (wholePart === 0) {
    // Just a fraction
    return `${numerator}/${denominator}`;
  } else {
    // Mixed number
    return `${wholePart} ${numerator}/${denominator}`;
  }
}

/**
 * Parse a fraction string (like "1 1/2" or "3/4") to a decimal
 * Supports: "1/2", "1 1/2", "2", "0.5"
 */
export function fractionToDecimal(input: string): number | undefined {
  if (!input || input.trim() === '') {
    return undefined;
  }

  const trimmed = input.trim();

  // Handle plain decimals
  if (/^[\d.]+$/.test(trimmed)) {
    const num = parseFloat(trimmed);
    return isNaN(num) ? undefined : num;
  }

  // Handle fractions: "1/2" or "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    if (denominator === 0) return undefined;
    return whole + numerator / denominator;
  }

  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    if (denominator === 0) return undefined;
    return numerator / denominator;
  }

  return undefined;
}

/**
 * Common fraction presets for a dropdown/quick select
 */
export const COMMON_FRACTIONS = [
  { label: '1/4', value: 0.25 },
  { label: '1/3', value: 0.333333 },
  { label: '1/2', value: 0.5 },
  { label: '2/3', value: 0.666667 },
  { label: '3/4', value: 0.75 },
  { label: '1', value: 1 },
  { label: '1 1/4', value: 1.25 },
  { label: '1 1/3', value: 1.333333 },
  { label: '1 1/2', value: 1.5 },
  { label: '1 2/3', value: 1.666667 },
  { label: '1 3/4', value: 1.75 },
  { label: '2', value: 2 },
  { label: '2 1/2', value: 2.5 },
  { label: '3', value: 3 },
];
