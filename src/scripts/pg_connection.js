const { createPool } = require('mysql');
const express = require('express');
const app = express();

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "DentalClinic",
});

const getProperties = (callback) => {
  pool.query('SELECT * FROM service;', (err, result) => {
    if (err) {
      console.error(err);
      callback({ error: 'Failed to fetch data from the database' }, null);
    } else {
      callback(null, { data: result });
    }
  });
};



module.exports = {
  getProperties,
};
