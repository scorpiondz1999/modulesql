const express = require("express");
const axios = require("axios");
const db = require("./db/connection");
const apiRoutes = require("./routes/apiRoutes");

const PORT = process.env.PORT || 3001;
const app = express();
const inquirer = require("inquirer");
// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use apiRoutes
app.use("/api", apiRoutes);

// Default response for request (Not Found)
app.use((req, res) => {
        res.status(404).end();
      });
      
      // Start server when DB connected 
      db.connect((err) => {
        if (err) return console.log(err);
        console.log("Database connected.");
        firstPrompt();
      });
      
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });

      // function for action to take
const firstPrompt = async () => {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "WHAT do you like to do?",
      choices: [
        "View all Departments",
        "View all Roles",
        "View all Employees",
        "Add a Department",
        "Add a Role",
        "Add an Employee",
        "Update an Employee Role",
        "Remove an Employee",
        "Remove a Role",
        "Quit",
      ],
    })
    .then(function ({ task }) {
      let url = "";
      switch (task) {
        case "View all Departments":
          url = "http://localhost:3001/api/department";
          axios({
            method: "GET",
            url,
            body: {},
          })
            .then((response) => {
              console.log(response.data);
              firstPrompt();
            })
            .catch((err) => console.log(err));
          break;
        case "View all Roles":
          url = "http://localhost:3001/api/role";
          axios({
            method: "GET",
            url,
            body: {},
          })
            .then((response) => {
              console.log(response.data);
              firstPrompt();
            })
            .catch((err) => console.log(err));
          break;
        case "View all Employees":
          url = "http://localhost:3001/api/employees";
          axios({
            method: "GET",
            url,
            body: {},
          })
            .then((response) => {
              console.log(response.data);
              firstPrompt();
            })
            .catch((err) => console.log(err));
          break;
        case "Add a Department":
          url = "http://localhost:3001/api/department";
          axios({
            method: "POST",
            url,
            body: {},
          })
            .then((response) => {
              console.log(response.data);
              firstPrompt();
            })
            .catch((err) => console.log(err));
          break;
        case "Add a Role":
          url = "http://localhost:3001/api/department";
          axios({
            method: "GET",
            url,
            body: {},
          })
            .then((response) => {
              url = "http://localhost:3001/api/role";
              axios({
                method: "POST",
                url,
                data: { dept: response.data.data },
              })
                .then((response) => {
                  console.log(response.data);
                  firstPrompt();
                })
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
          break;
        case "Add an Employee":
          url = "http://localhost:3001/api/role";
          axios({
            method: "GET",
            url,
            body: {},
          })
            .then((roles) => {
              url = "http://localhost:3001/api/employees";
              axios({
                method: "GET",
                url,
                body: {},
              })
                .then((emps) => {
                  url = "http://localhost:3001/api/employee";
                  axios({
                    method: "POST",
                    url,
                    data: { roles: roles.data.data, employees: emps.data.data },
                  })
                    .then((response) => {
                      console.log(response.data);
                      firstPrompt();
                    })
                    .catch((err) => console.log(err));
                })
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
          break;
        case "Update an Employee Role":
          break;
        case "Remove an Employee":
          break;
        case "Remove a Role":
          break;
        case "Quit":
          db.end();
          break;
      }
    });
};
