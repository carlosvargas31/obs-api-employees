
const request = require('supertest');
const app = require('../src/api');

describe('API Endpoints', () => {

  // Test para GET /api/employees
  test('GET /api/employees should return all employees', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(6);
  });

  // Test para GET /api/employees?page=1 (Paginación)
  test('GET /api/employees?page=1 should return the first two employees', async () => {
    const res = await request(app).get('/api/employees?page=1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].name).toEqual('Sue');
    expect(res.body[1].name).toEqual('Bob');
  });

  // Test para GET /api/employees?page=2 (Paginación)
  test('GET /api/employees?page=2 should return the next two employees', async () => {
    const res = await request(app).get('/api/employees?page=2');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].name).toEqual('Willy');
    expect(res.body[1].name).toEqual('John');
  });

  // Test para GET /api/employees/oldest
  test('GET /api/employees/oldest should return the oldest employee', async () => {
    const res = await request(app).get('/api/employees/oldest');
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Martin');
  });

  // Test para GET /api/employees?user=true
  test('GET /api/employees?user=true should return employees with user privileges', async () => {
    const res = await request(app).get('/api/employees?user=true');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(4);
    res.body.forEach(emp => {
      expect(emp.privileges).toEqual('user');
    });
  });

  // Test para GET /api/employees?badges=black
  test('GET /api/employees?badges=black should return employees with a "black" badge', async () => {
    const res = await request(app).get('/api/employees?badges=black');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(3);
    res.body.forEach(emp => {
      expect(emp.badges).toContain('black');
    });
  });

  // Test para POST /api/employees (creación exitosa)
  test('POST /api/employees should add a new employee and return 201 status', async () => {
    const newEmployee = {
      name: 'Luis',
      age: 28,
      phone: { personal: '555-123-123', work: '555-456-456', ext: '1010' },
      privileges: 'user',
      favorites: { artist: 'Dali', food: 'tacos' },
      finished: [1, 2],
      badges: ['gold'],
      points: [{ points: 90, bonus: 5 }]
    };

    const res = await request(app).post('/api/employees').send(newEmployee);
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('Luis');
  });

  // Test para POST /api/employees (validación fallida)
  test('POST /api/employees with invalid data should return 400 status', async () => {
    const invalidEmployee = { name: 'Luis' }; // Faltan age y privileges
    const res = await request(app).post('/api/employees').send(invalidEmployee);
    expect(res.statusCode).toEqual(400);
    expect(res.body.code).toEqual('bad_request');
  });

  // Test para GET /api/employees/NAME (encontrado)
  test('GET /api/employees/:name should return the employee object if found', async () => {
    const res = await request(app).get('/api/employees/Sue');
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Sue');
  });

  // Test para GET /api/employees/NAME (no encontrado)
  test('GET /api/employees/:name should return 404 status if not found', async () => {
    const res = await request(app).get('/api/employees/NonExistentUser');
    expect(res.statusCode).toEqual(404);
    expect(res.body.code).toEqual('not_found');
  });
});