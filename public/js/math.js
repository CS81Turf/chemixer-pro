import { presets } from "./presets.js";

export function calculateMix({ areaSize, waterVolume, sprayRate, treatment }) {
  const preset = presets[treatment];
  if (!preset) {
    throw new Error(`Preset for treatment "${treatment}" not found.`);
  }


// If area size provided, calculate water volume needed
if (areaSize && !waterVolume) {
  waterVolume = areaSize / (1000 * sprayRate); // in gallons
}

// If water volume provided, calculate area
if (waterVolume && !areaSize) {
  areaSize = waterVolume * 1000 * sprayRate; // in sq ft
}

// Calculate chemical amounts
const results = preset.map((chem) => {
  const amount = chem.rate * (areaSize / 1000); // in ounces
  return {
    chemical: chem.chemical,
    ratePer1000: chem.rate,
    totalAmount: amount,
  };
});

return {
  areaSize,
  waterVolume,
  sprayRate,
  treatment,
  results,
};
}
