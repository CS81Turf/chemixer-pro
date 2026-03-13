# **CheMixer Pro — Chemical Mixing Calculator App**

CheMixer Pro is a full-stack web application built for lawn care teams and companies to accurately calculate chemical mixes, track fertilizer usage, and monitor employee activity — all tied to individual user accounts. Users log in, enter a target spray rate and water volume, select a treatment, and the app instantly calculates exact chemical amounts. Mix results and fertilizer logs are saved to a MongoDB Atlas database. The app also integrates EPA pesticide data, allowing users to search product names and view selected data from the EPA API endpoint. CheMixer Pro is deployed on Render and is actively used by my current employer in day-to-day lawn care operations.

| Mix Calculator with Results | Log Fertilizer Usage | Activity Calendar | Day Detail View |
| -------------- | --------------- | -------------- | -------------- |
| ![Mix Calculator Screenshot](/images/Screenshot1.png) | ![Log Fertilizer Usage](/images/Screenshot2.png) | ![Activity Calendar and Mix History](/images/Screenshot3.png) | ![Day Detail View](/images/Screenshot4.png) |

## Included Features

### 1. User Authentication

CheMixer Pro includes a login system that ties all mix and fertilizer data to individual user accounts. Each employee logs in to their own account, and their activity is tracked and displayed separately, making it easy for teams to see how much each person is using on any given day.

### 2. Data Analysis from Arrays/Objects

The app processes chemical rates stored in an array of objects and analyzes it to calculate total chemical amounts based on the user's spray rate and water volume. Results are dynamically calculated and displayed in a clean, formatted table.

### 3. Fertilizer Usage Tracking

Users can log fertilizer usage directly from the home screen by selecting the fertilizer type and entering the number of bags used. This makes it easy to monitor product consumption across the team throughout the fertilizing season.

### 4. Activity Calendar & History

The History page features an interactive calendar that displays daily activity at a glance — showing how many bags of fertilizer were applied and how many mixes were completed on each day. Clicking a day opens a detailed breakdown by employee, including fertilizer type, bags used, treatment applied, and area covered.

### 5. Create a Node/Express Web Server

The backend is built with Node.js and Express.js. The server handles static files, JSON parsing, CORS, and custom routes, and connects to a MongoDB Atlas database via Mongoose for persistent data storage.

### 6. Custom API with GET & POST

A RESTful API handles mix calculations and fertilizer logs:

- POST /api/mixes saves a new mix to the database
- GET /api/mixes returns all saved mixes for the logged-in user
- POST /api/fertilizer saves a new fertilizer log entry
- GET /api/fertilizer returns fertilizer usage history

### 7. Custom Function with Multiple Parameters

A `calculateMix()` function takes multiple inputs (spray rate, water volume, treatment) and returns a table of results including area size and chemical totals. The function maps over the selected presets array, computes values (like rate per 1,000 sq.ft. and total gallons and ounces needed for each chemical) based on user inputs, and returns a new array of results.

## How to Run the Project

### Required Software

- Node.js v22.22.0 or later
- Any modern browser
- A MongoDB Atlas account and cluster (free tier works fine)

### Installation

1. Clone or download this project

   ```bash
   git clone https://github.com/CS81Turf/chemixer-pro
   ```

2. Open the project folder in VSCode or your preferred editor.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root of the project and add your MongoDB connection string:

   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   ```

5. Start the Express server:

   ```bash
   npm run dev
   ```

6. Open your browser and go to:

   ```
   http://localhost:3000
   ```

### Dependencies Used

| Package | Purpose |
|---------|---------|
| express | Web server |
| cors | Allow frontend → backend communication |
| mongoose | MongoDB connection and data modeling |
| dotenv | Manage environment variables securely |
| nodemon *(dev)* | Auto-restart server during development |

This project **DOES NOT** require an API key for the EPA label lookup feature.

## Deployment

CheMixer Pro is live and deployed on [Render](https://render.com). It is actively used by my current employer as a real-world tool in their lawn care operations — tracking chemical mixes, fertilizer usage, and employee activity on a day-to-day basis.

## AI Usage

I used ChatGPT and the chat assistant in VSCode throughout this project to help debug Express routes, set up the MongoDB/Mongoose connection, and troubleshoot persistent issues as they came up.