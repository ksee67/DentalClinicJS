const express = require('express');
const { createPool } = require('mysql');
const app = express();
const port = 3001;
app.set('appName', 'DentalClinic'); // Пример установки имени приложения в Express
const multer = require('multer');
const XLSX = require('xlsx');
const upload = multer({ dest: 'uploads/' }); // Папка для сохранения загруженных файлов

// Создание пула подключений к базе данных
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "DentalClinic",
});
app.post('/import-medical-history', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('Файл не был загружен');
  }

  const workbook = XLSX.readFile(file.path);
  const sheetName = workbook.SheetNames[0]; 
  const worksheet = workbook.Sheets[sheetName];
  const excelData = XLSX.utils.sheet_to_json(worksheet);

  const promises = excelData.map(data => {
    return new Promise((resolve, reject) => {
      const { Start_date, End_date, Treatment, Notes, Diagnosis_ID, Patient_ID } = data;
      const sql = 'INSERT INTO Medical_history (Start_date, End_date, Treatment, Notes, Diagnosis_ID, Patient_ID) VALUES (?, ?, ?, ?, ?, ?)';
      pool.query(sql, [Start_date, End_date, Treatment, Notes, Diagnosis_ID,Patient_ID], (error, results) => {
        if (error) {
          console.error('Ошибка запроса: ' + error.message);
          reject(error);
          return;
        }
        console.log('Запись успешно добавлена');
        resolve(results);
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.status(200).json({ message: 'Все записи успешно добавлены' });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Произошла ошибка при добавлении записей' });
    });
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

  const sql = `INSERT INTO Payment (Date_payment, Service_ID, Registrar_ID, Patient_ID) 
               VALUES (?, ?, ?, ?)`;
  
  const values = [
    paymentData.Date_payment,
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
// GET запрос для получения информации о медицинской истории по ID
app.delete('/medicalHistory/delete/:id', (req, res) => {
  const medicalHistoryId = req.params.id;
  const sql = 'DELETE FROM Medical_history WHERE ID_Medical_history = ?';
  pool.query(sql, [medicalHistoryId], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send('Медицинская история не найдена');
      return;
    }
    res.status(200).send('Медицинская история успешно удалена');
  });
});
// доабвление мед . истории
app.post('/medical-history', (req, res) => {
  const { Start_date, End_date, Treatment, Notes, Diagnosis_ID } = req.body;
  const sql = 'INSERT INTO Medical_history (Start_date, End_date, Treatment, Notes, Diagnosis_ID) VALUES (?, ?, ?, ?, ?)';
  pool.query(sql, [Start_date, End_date, Treatment, Notes, Diagnosis_ID], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.status(201).send('Запись успешно добавлена');
  });
});
// изменение мед. истории
app.put('/medicalhistory/:id', (req, res) => {
  const { id } = req.params;
  const { Start_date, End_date, Treatment, Notes, Diagnosis_ID } = req.body; // Removed Patient_ID from here
  const sql = 'UPDATE Medical_history SET Start_date = ?, End_date = ?, Treatment = ?, Notes = ?, Diagnosis_ID = ? WHERE ID_Medical_history = ?';
  pool.query(sql, [Start_date, End_date, Treatment, Notes, Diagnosis_ID, id], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.status(200).send('Запись успешно обновлена');
  });
});



// GET запрос для добавления нового диагноза
app.get('/diagnosis', (req, res) => {
  const sql = 'SELECT * FROM Diagnosis';
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.json(results); // Отправляем данные о диагнозах в формате JSON на клиент
  });
});

app.get('/diagnosis/:id', (req, res) => {
  const diagnosisId = req.params.id; // Получаем ID из параметров запроса
  const sql = 'SELECT * FROM Diagnosis WHERE ID_Diagnosis = ?'; // SQL-запрос для получения диагноза по ID
  pool.query(sql, [diagnosisId], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.json(results[0]); // Отправляем данные о диагнозе в формате JSON на клиент
  });
});

// POST запрос для добавления информации о медицинской истории
app.post('/medicalHistory', (req, res) => {
  const { Start_date, End_date, Treatment, Notes, Diagnosis_ID, Patient_ID } = req.body;
  const sql = 'INSERT INTO Medical_history (Start_date, End_date, Treatment, Notes, Diagnosis_ID, Patient_ID) VALUES (?, ?, ?, ?, ?, ?)';
  pool.query(sql, [Start_date, End_date, Treatment, Notes, Diagnosis_ID, Patient_ID], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    res.status(201).send('Медицинская история успешно добавлена');
  });
});
app.get('/medicalHistory', async (req, res) => {
  try {
    const sql = 'SELECT * FROM Medical_history';
    pool.query(sql, (error, results) => {
      if (error) {
        console.error('Ошибка запроса: ' + error.message);
        res.status(500).send('Ошибка сервера');
        return;
      }
      res.status(200).json(results); // Отправляем данные о медицинской истории в формате JSON
    });
  } catch (error) {
    console.error('Ошибка при получении медицинской истории:', error);
    res.status(500).send('Ошибка сервера');
  }
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
// Получение списка ролей
app.get('/roles', (req, res) => {
  const query = 'SELECT DISTINCT PostName AS Role FROM FullUserData'; // Запрос для получения уникальных ролей
  pool.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Ошибка получения данных о ролях' });
      throw error;
    }
    
    // Отправляем данные в формате JSON в ответ на запрос
    res.json(results);
  });
});
app.put('/user/:userId/role/:roleId', (req, res) => {
  const { userId, roleId } = req.params;

  if (roleId === 'administratorRoleId') {
     const updateQuery = 'UPDATE Administrator SET Post_ID = ? WHERE ID_Administrator = ?';
  } else if (roleId === 'doctorRoleId') {
     const updateQuery = 'UPDATE Doctor SET Post_ID = ? WHERE ID_Doctor = ?';
  } else if (roleId === 'registrarRoleId') {
    const updateQuery = 'UPDATE Registrar SET Post_ID = ? WHERE ID_Registrar = ?';
  } else {
    res.status(400).json({ error: 'Неверный ID роли' });
    return;
  }

  res.status(200).json({ message: `Роль пользователя с ID ${userId} изменена на ${roleId}` });
});

// Получение списка всех пользователей
app.get('/users', (req, res) => {
  const query = `
    SELECT 
      CONCAT(Administrator_FullName) AS FullName 
    FROM FullUserData
    UNION
    SELECT 
      CONCAT(Doctor_FullName) AS FullName 
    FROM FullUserData
    UNION
    SELECT 
      CONCAT(Registrar_FullName) AS FullName 
    FROM FullUserData
  `;
  
  pool.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Ошибка получения данных о пользователях' });
      throw error;
    }
    
    // Отправляем данные в формате JSON в ответ на запрос
    res.json(results);
  });
});


// Express маршрут для получения информации о пациенте по ID
app.get('/patients/:id', (req, res) => {
  const patientId = req.params.id;
  const sql = 'SELECT * FROM Patient WHERE ID_Patient = ?';
  pool.query(sql, [patientId], (error, results) => {
    if (error) {
      console.error('Ошибка запроса: ' + error.message);
      res.status(500).send('Ошибка сервера');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Пациент не найден');
      return;
    }
    res.json(results[0]); // Отправляем данные о пациенте в формате JSON на клиент
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
// Получение платежей с разнецей
app.get('/paymentss', (req, res) => {
  const sql = "SELECT p.ID_Payment, p.Date_payment, s.Service_name, s.Price, CONCAT(r.Surname_registr, ' ', r.Name_registr, ' ', COALESCE(r.Middle_registr, '')) AS Registrar_name,  CONCAT(pat.Surname_patient, ' ', pat.Name_patient, ' ', COALESCE(pat.Middle_patient, '')) AS Patient_name  FROM Payment p  JOIN service s ON p.Service_ID = s.service_id  JOIN Registrar r ON p.Registrar_ID = r.ID_Registrar JOIN Patient pat ON p.Patient_ID = pat.ID_Patient WHERE p.Date_payment BETWEEN 'startDate' AND 'endDate'";
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});

// Получение платежей
app.get('/payments1', (req, res) => {
  const sql = "SELECT p.ID_Payment, p.Date_payment, s.Service_name, s.Price, CONCAT(r.Surname_registr, ' ', r.Name_registr, ' ', COALESCE(r.Middle_registr, '')) AS Registrar_name,  CONCAT(pat.Surname_patient, ' ', pat.Name_patient, ' ', COALESCE(pat.Middle_patient, '')) AS Patient_name  FROM Payment p  JOIN service s ON p.Service_ID = s.service_id  JOIN Registrar r ON p.Registrar_ID = r.ID_Registrar JOIN Patient pat ON p.Patient_ID = pat.ID_Patient;"
  pool.query(sql, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results);
    }
  });
});
// Получение платежей
app.get('/payments', (req, res) => {
  const sql = "SELECT * FROM Payment;"
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



app.get('/user/:id', (req, res) => {
  const userId = req.params.id; 

  const sql = 'SELECT Name_doctor FROM Doctor WHERE ID_Doctor = ?';
  pool.query(sql, userId, (err, results) => {
    if (err) {
      console.error('Ошибка при запросе пользователя из базы данных:', err);
      return res.status(500).json({ error: 'Ошибка при запросе пользователя' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const userName = results[0].Name_doctor; 
    res.json({ name: userName }); 
  });
});

app.listen(port, () => {
  console.log('Сервер запущен на порту 3001');
});
