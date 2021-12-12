const express = require("express");
const router = express.Router();
const db = require("../../db/connection");
const inputCheck = require("../../utils/inputCheck");

const inquirer = require("inquirer");

// Get the total departments for all the employees
router.get("/department", (req, res) => {
  const sql = `SELECT d.* 
                FROM department d`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// Create a department record
router.post("/department", async({ body }, res) => {
  const data = await inquirer.prompt(
    [  
        {
            type: 'input',
            name: 'department_name',
            message: 'What department would you like too add?'
        }
    ]
);
  // Data validation
  const errors = inputCheck(data, "department_name");
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  } 

  const sql = `INSERT INTO department (name) VALUES (?)`;
  const params = [data.department_name];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data,
      changes: result.affectedRows,
    });
  });
});

module.exports = router;
