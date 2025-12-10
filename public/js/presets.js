//check resonse ok
try {
  let response = await fetch("/api/presets");
  if (!response.ok) {
    throw new Error("Failed to load presets");
  }

  let responseData = await response.json();
  let presets = responseData;
} catch (err) {
  console.error("Error loading presets.");
}

export { presets };
