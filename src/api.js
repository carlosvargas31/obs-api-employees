const express = require('express');
const employees = require('./employees.json');

const app = express();
const PORT = 8000;

app.use(express.json());

// GET /api/employees
app.get('/api/employees', (req, res) => {
  const page = parseInt(req.query.page);
  const user = req.query.user;
  const badges = req.query.badges;

  // Paginación
  if (page) {
    const start = (page - 1) * 2;
    const end = start + 2;
    const paginatedEmployees = employees.slice(start, end);
    return res.json(paginatedEmployees);
  }

  // Filtrar por privilegios de usuario
  if (user === 'true') {
    const userEmployees = employees.filter(emp => emp.privileges === 'user');
    return res.json(userEmployees);
  }

  // Filtrar por "badges"
  if (badges) {
    const employeesWithBadge = employees.filter(emp => emp.badges.includes(badges));
    return res.json(employeesWithBadge);
  }

  res.json(employees);
});

// GET /api/employees/oldest
app.get('/api/employees/oldest', (req, res) => {
  const oldestEmployee = employees.reduce((oldest, current) => {
    return (current.age > oldest.age) ? current : oldest;
  }, employees[0]);
  res.json(oldestEmployee);
});

// GET /api/employees/NAME
app.get('/api/employees/:name', (req, res) => {
  const employeeName = req.params.name;
  const employee = employees.find(emp => emp.name === employeeName);

  if (!employee) {
    return res.status(404).json({ code: 'not_found' });
  }

  res.json(employee);
});

// POST /api/employees
app.post('/api/employees', (req, res) => {
  const newEmployee = req.body;

  // Validación básica del formato JSON
  const hasValidKeys = newEmployee && newEmployee.name && newEmployee.age && newEmployee.privileges;
  
  if (!hasValidKeys) {
    return res.status(400).json({ code: 'bad_request' });
  }

  // Agregar el nuevo empleado al array en memoria
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

module.exports = app;