const express = require('express');
const { createPool } = require('mysql');
const app = express();
const port = 3001;

// Создание пула подключений к базе данных
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "DentalClinic",
});

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.post('/payments', (req, res) => {
  const paymentData = req.body; // Данные из POST-запроса

  const sql = `INSERT INTO Payment (Date_payment, Amount, Service_ID, Registrar_ID, Patient_ID) 
               VALUES (?, ?, ?, ?, ?)`;
  
  const values = [
    paymentData.Date_payment,
    paymentData.Amount,
    paymentData.Service_ID,
    paymentData.Registrar_ID,
    paymentData.Patient_ID
  ];

  // Выполнение SQL-запроса
  pool.query(sql, values, (error, results) => {
    if (error) {
      res.status(500).send('Error adding payment'); // Отправка сообщения об ошибке
    } else {
      res.status(200).send('Payment added successfully'); // Отправка сообщения об успешном добавлении
    }
  });
});
app.post('/appointments', (req, res) => {
  const appointmentData = req.body; // Данные из POST-запроса

  const sql = 'INSERT INTO AppointmentSchedule (Date_of_Appointment, Doctor_ID, Patient_ID, TimeSlot_ID) VALUES (?, ?, ?, ?)';
  const values = [
    appointmentData.Date_of_Appointment, 
    appointmentData.Doctor_ID, 
    appointmentData.Patient_ID, 
    appointmentData.TimeSlot_ID
  ];

  pool.query(sql, values, (error, results) => {
    if (error) {
      console.error('Ошибка при добавлении записи:', error);
      res.status(500).json({ error: 'Ошибка при добавлении записи' });
    } else {
      res.status(200).json({ message: 'Запись успешно добавлена', data: results });
    }
  });
});


// Получение списка услуг
app.get('/services', (req, res) => {
  const sql = 'SELECT * FROM service';
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});
app.get('/viewappointments', (req, res) => {
  const sqlQuery = `
    SELECT 
      a.Date_of_Appointment,
      d.Surname_doctor,
      d.Name_doctor,
      d.Middle_doctor,
      d.Cabinet_number,
      tc.category_name AS Department,
      t.TimeValue AS Time_of_Appointment,
      CONCAT(p.Surname_patient, ' ', p.Name_patient, ' ', COALESCE(p.Middle_patient, '')) AS Patient_FullName,
      p.Phone_number AS Patient_Phone
    FROM 
      AppointmentSchedule a
    INNER JOIN 
      Doctor d ON a.Doctor_ID = d.ID_Doctor
    INNER JOIN 
      TimeSlots t ON a.TimeSlot_ID = t.ID_TimeSlot
    INNER JOIN 
      Patient p ON a.Patient_ID = p.ID_Patient
    INNER JOIN 
      treatment_category tc ON d.category_id = tc.ID_Category
    ORDER BY 
      a.Date_of_Appointment, t.TimeValue;
  `;

  pool.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.json(results); // Отправка результатов запроса в формате JSON
  });
});

app.get('/treatmentscategories', (req, res) => {
  const sql = 'SELECT * FROM treatment_category';
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});
// Получение пациентов
app.get('/patients', (req, res) => {
  // Ваш SQL-запрос для получения данных о пациентах
  const sql = 'SELECT ID_Patient, CONCAT(Surname_patient , " ", Name_patient , " ", Middle_patient) AS FullName FROM Patient';
  
  // Выполнение запроса к базе данных
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error); // Отправка ошибки в случае возникновения ошибки при запросе к базе данных
    } else {
      res.json(results); // Отправка результатов запроса в формате JSON
    }
  });
});

// Получение данных из таблицы AppointmentSchedule
app.get('/appointments', (req, res) => {
  const sql = 'SELECT * FROM AppointmentSchedule';
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.json(results); // Отправляем данные в формате JSON на клиент
  });
});

// Получение платежей
app.get('/payments', (req, res) => {
  const sql = 'SELECT * FROM Payment';
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});

// Получение регистраторов
app.get('/registrars', (req, res) => {
  const sql = 'SELECT ID_Registrar, CONCAT(Surname_registr, " ", Name_registr, " ", Middle_registr) AS FullName FROM Registrar';
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});

app.get('/timeslots', (req, res) => {
  const sql = 'SELECT * FROM TimeSlots;';
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});
// Обработчик запроса на получение списка врачей
app.get('/doctors', (req, res) => {
  const sql = 'SELECT * FROM Doctor;';
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});
// Обработчик для получения данных о враче по идентификатору
app.get('/doctors/:id', (req, res) => {
  const doctorId = req.params.id;
  const query = `SELECT * FROM Doctor WHERE ID_Doctor = ${doctorId}`;
  pool.query(query, (err, results) => { // Замените connection.query на pool.query здесь
    if (err) {
      console.error('Ошибка при получении данных о враче:', err);
      res.status(500).json({ error: 'Ошибка при получении данных о враче' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Врач не найден' });
      return;
    }
    res.json(results[0]);
  });
});


app.listen(port, () => {
  console.log('Сервер запущен на порту 3001');
});
