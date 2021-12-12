const express = require("express");
const router = express.Router();
const db = require("../../db/connection");
const inputCheck = require("../../utils/inputCheck");

const inquirer = require("inquirer");

// Get all roles
router.get("/role", (req, res) => {
  const sql = `SELECT r.id, r.title, r.salary, d.name AS department_name 
  FROM role r
  LEFT JOIN department d
  ON r.department_id = d.id`;

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

// Get single role
router.get("/role/:id", (req, res) => {
  const sql = `SELECT r.id, r.title, r.salary, d.name AS department_name
  FROM role r
  LEFT JOIN department d
  ON r.department_id = d.id
  WHERE r.id = ?`;
  
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

