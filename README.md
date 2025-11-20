# **CheMixer Pro --- Chemical Mixing Calculator App**

CheMixer Pro is a web application that helps lawn care technicians accurately calculate chemical mixes based on spray rate(default set to 4), water volume, and chemical treatment selection. The user enters a target spray rate and water volume, selects the treatment, and the app calculates exact chemical amounts. Results are displayed instantly and automatically saved to a JSON file on the backend using a custom API. It also integrates EPA pesticide data, allowing the user to search product names and view selected data from the EPA API endpoint. This project is built with HTML, CSS, JavaScript, and a Node/Express backend.

## Included Features

### 1. Data Analysis from Arrays/Objects

The app processes chemical rates stored in an array of objects and analyzes it to calculate total chemical amounts based on the user's spray rate and water volume. These results are dynamically displayed to the user in a formatted table. (SCREENSHOT)

### 2. Create a Node/Express Web Server

I built a Node.js backend using Express.js. The server handles static file delivery, JSON parsing, CORS, and custom routes. The backend serves the web app and manages data storage used by the project.

### 3. Custom API with GET & POST

I created an API with `/api/mixes` to store and retrieve mix calculations:

- POST /api/mixes saves a new mix to `mixes.json`
- GET /api/mixes returns all saved mixes
- The backend reads and writes to a JSON file, acting as a simple database.

### 4. Custom Function with Multiple Parameters

A `calculateMix()` function takes multiple inputs(spray rate, water volume, treatment) and returns a table of results, including area size and chemical totals. The function maps over the selected presets array, computes values(like rate per 1,000 sq.ft. and total gallons and ounces needed for each chemical) based off the user inputs, and returns a new array of results.

## How to run the Project

### Required Software

- Node.js v18 or higher
- Any browser

### Installation

1. Clone or download this project
2. Open the project folder in VSCode or your preferred editor.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the Express server

    ```bash
    node src/server.js
    ```

5. Open your browser and go to:

   ```bash
   http://localhost:3000
   ```

### Dependencies Used

| Package | Purpose |
|---------|---------|
| express | Web Server |
| cors    | Allow frontend -> backend communication |
| fs (built-in) | Read/write simple JSON database |
| path | File path utilities |

This project **DOES NOT** require an API key.

(There is also an EPA label lookup API call that also doesn't require a key.)

## AI Usage

I used ChatGPT and the chat in VSCode in this project to help me debug Express routes and to explain setting up the database on the backend.
