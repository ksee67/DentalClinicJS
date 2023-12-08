require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
app.set('appName', 'DentalClinic'); // Пример установки имени приложения в Express

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешить запросы от всех источников (*)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "DentalClinic",
});

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    throw err;
  }
  console.log('Успешное подключение к базе данных');
});

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  
  connection.query('SELECT * FROM user_tokens WHERE refresh_token = ?', refreshToken, (err, results) => {
    if (err) {
      console.error('Ошибка при поиске refresh токена:', err);
      return res.sendStatus(500);
    }
    if (results.length === 0) return res.sendStatus(403);
    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ name: user.name });
      res.json({ accessToken: accessToken });
    });
  });
});

app.delete('/logout', (req, res) => {
  const refreshToken = req.body.token;
  connection.query('DELETE FROM user_tokens WHERE refresh_token = ?', refreshToken, (err) => {
    if (err) {
      console.error('Ошибка при удалении refresh токена:', err);
      return res.sendStatus(500);
    }
    res.sendStatus(204);
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  connection.query('SELECT * FROM Doctor WHERE Login_doctor = ? AND Password_doctor = ?', [email, password], (err, results) => {
    if (err) {
      console.error('Ошибка при поиске пользователя:', err);
      return res.sendStatus(500);
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const user = {
      id: results[0].ID_Doctor, 
      email: email,
      password: password
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    
    connection.query('UPDATE user_tokens SET refresh_token = ? WHERE ID_Doctor = ?', [refreshToken, results[0].ID_Doctor], (err) => {
      if (err) {
        console.error('Ошибка при обновлении refresh токена:', err);
        return res.sendStatus(500);
      }
      res.json({ id: user.id, accessToken: accessToken, refreshToken: refreshToken });
    });
  });
});


function generateAccessToken(user){ 
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m'});
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/current-user', authenticateToken, (req, res) => {
  res.json({ username: req.user.name });
});

app.listen(4000);