export function calculateMix( waterVolume, sprayRate, treatment, presets ) {
    
  // Validate water volume
  if (waterVolume === undefined || waterVolume === null || isNaN(waterVolume) || waterVolume <= 0) {
    throw new Error("Please enter a valid number for water volume.");
  }

  //Validate presets
  if (!presets) throw new Error("Presets required");

  const preset = presets[treatment];
  if (!preset)  throw new Error(`Preset for ${treatment} not found.`);
  

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
