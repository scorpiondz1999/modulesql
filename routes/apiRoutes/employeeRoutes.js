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

// Create an employee
router.post("/employee", async(req, res) => {
  const roles = req.body.roles;
  const employees = req.body.employees;

  //Prompt for employee data to add
  const data = await inquirer.prompt([
    {
      type: "input",
      name: "emp_first_name",
      message: "What is their first name?",
    },
    {
      type: "input",
      name: "emp_last_name",
      message: "What is their last name?",
    },
    {
      type: "list",
      name: "emp_role",
      message: "What is their role?",
      choices: () => {
        let rol = roles.map((role) => role.title);
        rol = [...new Set(rol)];
        return rol;
      },
    },
    {
      type: "confirm",
      name: "has_manager",
      message: "Will this employee be managed?",
    },
    {
      type: "list",
      name: "manager",
      message: "Please choose their manager",
      when: (answers) => answers.has_manager,
      choices: () => {
        let mng = employees.map((manager) => manager.first_name + " " + manager.last_name);
        mng = [...new Set(mng)];
        return mng;
      },
    },
  ]);


  
  //Filter the chosen role to get its role_id
  let role_id;
  roles.filter((role) => {
    if (role.title === data.emp_role) {
      role_id = role.id;
    }
  });
  //Filter the chosen manger and assign manager_id
  let manager_id;
  employees.filter((emp) => {
    if (emp.first_name + " " + emp.last_name === data.manager) {
      manager_id = emp.id;
    }
  });

  const errors = inputCheck(data, "emp_first_name", "emp_last_name");
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
  const params = [
    data.emp_first_name,
    data.emp_last_name,
    role_id,
    manager_id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data,
    });
  });
});

// Update a role of an employee
router.put("/employee/:id", (req, res) => {
  const sql = `UPDATE employee SET role_id = ? 
               WHERE id = ?`;

  const params = [req.body.role_id, req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.affectedRows) {
      res.json({
        message: "Employee not found",
      });
    } else {
      res.json({
        message: "success",
        data: req.body,
        changes: result.affectedRows,
      });
    }
  });
});

// Delete an employee
router.delete("/employee/:id", (req, res) => {
  const sql = `DELETE FROM employee WHERE id = ?`;

  const params = req.params.id;

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
        message: "employee not found",
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

module.exports = router;
