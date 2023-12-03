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
    appointmentData.TimeSlot_ID,
  ];

  pool.query(sql, values, (error, results) => {
    if (error && error.code === 'ER_SIGNAL_EXCEPTION') {
      // Обработка ошибки, вызванной триггером
      console.error('Ошибка вставки записи: Данная дата и время заняты у выбранного врача.');
      res.status(400).json({ error: 'Данная дата и время заняты у выбранного врача. Выберите другую дату или время.' });
    } else if (error) {
      console.error('Ошибка при добавлении записи:', error);
      res.status(500).json({ error: 'Ошибка при добавлении записи' });
    } else {
      res.status(200).json({ message: 'Запись успешно добавлена', data: results });
    }
  });
});
// Express маршрут для получения списка пациентов
app.get('/patientsAll', (req, res) => {
  const sql = 'SELECT * FROM Patient';
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.json(results); // Отправляем данные о пациентах в формате JSON на клиент
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
app.post('/addPatient', (req, res) => {
  const { surname, name, middle, dob, phone, address } = req.body;

  const sql = `INSERT INTO Patient (Surname_patient, Name_patient, Middle_patient, Date_of_birth, Phone_number, Adress_patient) VALUES (?, ?, ?, ?, ?, ?)`;
  pool.query(sql, [surname, name, middle, dob, phone, address], (error, results) => {
    if (error) {
      if (error.code === 'ER_DATA_TOO_LONG') {
        res.status(400).send('Превышена максимальная длина для некоторых полей');
      } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
        res.status(400).send('Неверный формат данных в поле телефона');
      } else {
        console.error('Ошибка запроса: ' + error.message);
        res.status(500).send('Ошибка сервера');
      }
      return;
    }
    res.send('Пациент успешно добавлен');
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
// Удаление записи из таблицы AppointmentSchedule по id
app.delete('/appointments/:id', (req, res) => {
  const appointmentId = req.params.id;
  const sql = `DELETE FROM AppointmentSchedule WHERE id = ?`;
  pool.query(sql, [appointmentId], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.send('Запись удалена успешно');
  });
});
app.put('/appointments/:id', (req, res) => {
  const id = req.params.id;
  const { Date_of_Appointment, Doctor_ID, Patient_ID, TimeSlot_ID } = req.body;
  const sql = 'UPDATE AppointmentSchedule SET Date_of_Appointment = ?, Doctor_ID = ?, Patient_ID = ?, TimeSlot_ID = ? WHERE ID_AppointmentSchedule = ?';
  pool.query(sql, [Date_of_Appointment, Doctor_ID, Patient_ID, TimeSlot_ID, id], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      if (error.code === 'ER_SIGNAL_EXCEPTION') {
        // Обработка ошибки, связанной с триггером prevent_duplicate_appointments
        console.error('Триггер prevent_duplicate_appointments сработал: ' + error.message);
        res.status(400).send('Ошибка: ' + error.message); // Или любой другой код статуса по вашему выбору
      } else {
        res.status(500).send('Ошибка сервера');
      }
      return;
    }
    res.send('Запись обновлена успешно');
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
