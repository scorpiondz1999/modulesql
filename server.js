const express = require("express");
const axios = require("axios");
const db = require("./db/connection");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Default response for request (Not Found)
app.use((req, res) => {
        res.status(404).end();
      });
      
      // Start server when DB connected 
      db.connect((err) => {
        if (err) return console.log(err);
        console.log("Database connected.");
        
      });
      
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });