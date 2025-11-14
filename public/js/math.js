import { presets } from "./presets.js";

export function calculateMix({ waterVolume, sprayRate, treatment }) {
  const preset = presets[treatment];
  if (!preset) {
    throw new Error(`Preset for treatment "${treatment}" not found.`);
  }

// When water volume provided, calculate area
const areaSize = waterVolume * 1000 * sprayRate;

// Calculate chemical amounts
const results = preset.map((chem) => {
  return {
    chemical: chem.chemical,
    ratePer1000: chem.rate,
    totalAmount: chem.rate * waterVolume,
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
