let fertPresetsCache = null;

/**
 * Load fertilizer presets from the server or return cached version.
 * @returns {Promise<Object|null>} Presets grouped by round or null if error.
 */
async function loadFertPresets() {
  // Return cached presets if already loaded
  if (fertPresetsCache) return fertPresetsCache;

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not logged in");

    const response = await fetch("/api/fertPresets", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load fertilizer presets");

    const data = await response.json();
    fertPresetsCache = data; // cache the presets
    return fertPresetsCache;
  } catch (err) {
    console.error("Error loading fertilizer presets:", err);
    return null;
  }
}

/**
 * Get the cached presets without fetching.
 * @returns {Object|null} Cached presets or null if not loaded yet.
 */
function getFertPresets() {
  return fertPresetsCache;
}

export { loadFertPresets, getFertPresets };