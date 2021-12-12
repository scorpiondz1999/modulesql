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

// Add a role
router.post("/role", async(req, res) => {
  const depts = req.body.dept
  const data = await inquirer.prompt(
    [
        {
            type: 'input',
            name: 'role_title',
            message: 'What role would you like too add?',
        }, 
        {
            type: 'input',
            name: 'salary_role',
            message: 'What is this roles salary?',
            validate: (value) => {
                const pass = value.match(/^[0-9]*$/);
                return pass ? true : 'Please enter a number'
            }
        },
        {
            type: 'list',
            name: 'department_name',
            message: 'Which department is this for?',
            choices: () => {
                let roles = depts.map(dept => dept.name);
                roles = [...new Set(roles)];
                return roles;
            }
        }
    ]
);
//Filter the dept name to get dept_id
let department_id;
depts.filter(dept => {
    if (dept.name === data.department_name) {
        department_id = dept.id;
    }
});
  // Data validation
  const errors = inputCheck(data, "role_title", "salary_role");
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  } 

  const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
  const params = [data.role_title, data.salary_role, department_id];

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

// Delete a role
router.post("/deleterole", async(req, res) => {
  const roles = req.body.listroles;

  //Prompt for employee data to delete
  const data = await inquirer.prompt([
    {
      type: "list",
      name: "delrole",
      message: "Please choose the role to delete",
      choices: () => {
        let rol = roles.map((r) => r.title);
        rol = [...new Set(rol)];
        return rol;
      },
    },
  ])

  //Filter the chosen role to delete
  let role_id;
  roles.filter((r) => {
    if (r.title === data.delrole) {
      role_id = r.id;
    }
  });
  
  const sql = `DELETE FROM role WHERE id = ?`;
  const params = role_id;

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
        message: "role not found",
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
