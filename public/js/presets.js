let response = await fetch('/api/presets')

//check resonse ok




let responseData = await response.json()
let presets = responseData;

export { presets };