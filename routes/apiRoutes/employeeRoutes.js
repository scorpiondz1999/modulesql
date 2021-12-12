const express = require("express");
const router = express.Router();
const db = require("../../db/connection");
const inputCheck = require("../../utils/inputCheck");

const inquirer = require("inquirer");

// Get all employees and their role
router.get("/employees", (req, res) => {
  const sql = `SELECT e.id, e.first_name, e.last_name, r.title AS role_name, CONCAT(m.first_name, ' ', m.last_name) AS manager 
                FROM employee e
                LEFT JOIN role r
                ON e.role_id = r.id
                LEFT JOIN employee m
                ON m.id = e.manager_id
                ORDER BY e.first_name ASC`;

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

// Get single employee
router.get("/employee/:id", (req, res) => {
  const sql = `SELECT e.id, e.first_name, e.last_name, r.title AS role_name, CONCAT(m.first_name, ' ', m.last_name) AS manager
               FROM employee e 
               LEFT JOIN role r
               ON e.role_id = r.id
               LEFT JOIN employee m
               ON m.id = e.manager_id
               WHERE e.id = ?`;

  const params = [req.params.id];

  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

