const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

require('dotenv').config();
const app = express();
const port = process.env.PORT;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.use(async function(req, res, next) {
  try {
    req.db = await pool.getConnection();
    req.db.connection.config.namedPlaceholders = true;

    await req.db.query(`SET SESSION sql_mode = "TRADITIONAL"`);
    await req.db.query(`SET time_zone = '-8:00'`);

    await next();

    req.db.release();
  } catch (err) {
    console.log(err);

    if (req.db) req.db.release();
    throw err;
  }
});

app.use(cors());

app.use(express.json());

app.get('/car/:car_id', async function(req, res) {
  try {
     const { car_id } = req.body; // Use route parameters to get the car ID
     const query = `SELECT * FROM expresspractice.car WHERE car_id = ?;`; // Correct SQL query syntax
     const [rows, fields] = await req.db.query(query, [car_id]); // Destructure the result to get rows and fields
     console.log('/cars/:car_id', rows);
     res.json(rows); // Send the query result back to the client
  } catch (err) {
     console.error(err);
     res.status(500).send('An error occurred while fetching the car.'); // Send an error response
  }
 });
 

app.use(async function(req, res, next) {
  try {
    console.log('Middleware after the get /cars');
  
    await next();

  } catch (err) {

  }
});

app.post('/car', async function(req, res) {
  try {
     const { make, model, year } = req.body;

     const query = await req.db.query(
       `INSERT INTO car (make, model, year) VALUES (?,?,?)`,
       [make, model, year]
     );
 
     res.json({ success: true, message: 'Car successfully created', data: null });
  } catch (err) {
     res.status(500).json({ success: false, message: err.message, data: null });
  }
 });
 
 

app.delete('/car/:id', async function(req,res) {
  try {
    console.log('req.params /car/:id', req.params)

    res.json('success')
  } catch (err) {

  }
});

app.put('/car/:car_id', async function(req, res) {
  try {
     const { make, model, year, car_id } = req.body;
 
     const query = await req.db.query(
       `UPDATE car SET make = ?, model = ?, year = ? WHERE car_id = ?`,
       [make, model, year, car_id]
     );
 
     res.json({ success: true, message: 'Car successfully updated', data: null });
  } catch (err) {
     res.json({ success: false, message: err.message, data: null });
  }
 });
 


app.listen(port, () => console.log(`212 API Example listening on http://localhost:${port}`));