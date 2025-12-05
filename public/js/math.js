import { presets } from "./presets.js"; //Change this to ..src/presets.json? or just eliminate?

export function calculateMix( waterVolume, sprayRate, treatment ) {
    // Validate water volume
  if (waterVolume === undefined || waterVolume === null || isNaN(waterVolume) || waterVolume <= 0) {
    throw new Error("Please enter a valid number for water volume.");
  }
  
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
    totalAmount: chem.rate * areaSize / 1000,
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
