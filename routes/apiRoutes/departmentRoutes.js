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
router.post("/department", async ({ body }, res) => {
  const data = await inquirer.prompt([
    {
      type: "input",
      name: "department_name",
      message: "What department would you like too add?",
    },
  ]);
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

// Delete a department
router.post("/deletedepartment", async (req, res) => {
  const depts = req.body.listdepts;

  //Prompt for employee data to delete
  const data = await inquirer.prompt([
    {
      type: "list",
      name: "deldept",
      message: "Please choose the department to delete",
      choices: () => {
        let dep = depts.map((d) => d.name);
        dep = [...new Set(dep)];
        return dep;
      },
    },
  ]);

  //Filter the chosen department to delete
  let dept_id;
  depts.filter((d) => {
    if (d.name === data.deldept) {
      dept_id = d.id;
    }
  });

  const sql = `DELETE FROM department WHERE id = ?`;
  const params = dept_id;

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
        message: "department not found",
      });
    } else {
      res.json({
        message: "deleted",
        changes: result.affectedRows,
        id: params,
      });
    }
  });
});

// Get Budget per Department
router.get("/departmentbudget", (req, res) => {
  const sql = `SELECT d.*, SUM(r.salary) AS Budget
                FROM department d
                LEFT JOIN role r
                ON d.id = r.department_id
                GROUP BY(d.id)
                `;

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

// View Employees by Department
router.post("/employeesdepartment", async (req, res) => {
  const depts = req.body.listdepts;

  //Prompt for employee data to delete
  const data = await inquirer.prompt([
    {
      type: "list",
      name: "deldept",
      message: "Please choose the department",
      choices: () => {
        let dep = depts.map((d) => d.name);
        dep = [...new Set(dep)];
        return dep;
      },
    },
  ]);

  //Filter the chosen department to delete
  let dept_id;
  depts.filter((d) => {
    if (d.name === data.deldept) {
      dept_id = d.id;
    }
  });

  const sql = `SELECT e.id, e.first_name, e.last_name, r.title AS role_name, CONCAT(m.first_name, ' ', m.last_name) AS manager 
  FROM employee e
  LEFT JOIN role r
  ON e.role_id = r.id
  LEFT JOIN employee m
  ON m.id = e.manager_id
  WHERE r.department_id = ?`;
  
  const params = [dept_id];

  db.query(sql, params, (err, rows) => {
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

module.exports = router;
