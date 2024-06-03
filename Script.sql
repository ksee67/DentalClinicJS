CREATE DATABASE IF NOT EXISTS DentalClinic;
use Dentalclinic;
-- Должность
CREATE TABLE Post (
    ID_Post INT NOT NULL AUTO_INCREMENT,
    Post_name VARCHAR(50) NOT NULL,
    Responsibilities TEXT NOT NULL,
    PRIMARY KEY (ID_Post)
);

SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'Post'
SET @@auto_increment_increment=1;

-- Заполнение данными таблицу 'Post'
INSERT INTO Post (Post_name, Responsibilities)
VALUES ('Стоматолог','Проведение диагностики, лечения и профилактики стоматологических заболеваний, выполнение стоматологических процедур, консультация пациентов, разработка планов лечения.'),
       ('Администратор стоматологической клиники', 'Управление и регулирование всеми данными в клинике'),
       ('Финансовый менеджер клиники','Управление финансовыми операциями клиники, бюджетирование, учет расходов и доходов, разработка финансовых стратегий.');

SET @@auto_increment_increment=1;
-- Вывод данных из таблицы 'Post'
SELECT * FROM Post;

-- Диагноз
CREATE TABLE Diagnosis (
    ID_Diagnosis INT NOT NULL AUTO_INCREMENT,
    Diagnosis_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (ID_Diagnosis)
);

-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'Diagnosis'
SET @@auto_increment_increment=1;

INSERT INTO Diagnosis (Diagnosis_name)
VALUES ('Пародонтит'),
       ('Кариес зубов'),
		('Периодонтит'),
       ('Десна гипертрофированная'),
       ('Отсутствие зубов (анодонтия)'),
       ('Остеомиелит челюстей'),
       ('Стоматит'),
       ('Апикальный пародонтит'),
       ('Аномалии прикуса'),
		('Дистопия зубов')
        ('Флюороз зубов'),
        ('Гингивит'),
        ('Пульпит');

-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;
SELECT * FROM Diagnosis;
-- -------------------------------------------------------------------------
--  Категории лечения
CREATE TABLE IF NOT EXISTS treatment_category (
    ID_Category INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL
);
-- Вставляем примеры данных
INSERT INTO treatment_category (category_name) VALUES
('Терапия'),
('Гигиена и профилактика'),
('Хирургия');

-- Создаем таблицу услуг с внешним ключом
CREATE TABLE  service (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    Price DECIMAL(10, 2) NOT NULL CHECK (Price >= 0), -- Ограничение на неотрицательное значение
    Service_name VARCHAR(255) NOT NULL,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES treatment_category(ID_Category)
);
INSERT INTO service (Price, Service_name, category_id) VALUES 
(5700, 'Профессиональная гигиена полости рта', 1), 
(450, 'Покрытие флюокал', 1), 
(2000, 'Метод глубокого фторирования в/ч и н/ч', 1), 
(200, 'Покрытие флюокал', 1),
(1200, 'Распломбировка корневого канала (паста)', 1),
(1600, 'Распломбировка корневого канала (цемент)', 1),
(500, 'Рентген снимок', 1),
(450, 'Снятие зубных отложений на одном зубе с использованием « УЗА»', 2),
(1600, 'Удаление налета с одного зуба', 2),
(6500, 'Комплексная гигиена полости рта (У/З снятие твердого зубного налета, Air flow)', 2),
(8700, 'Комплексная гигиена полости рта (II степень сложности)', 2),
(800, 'Инъекционная анестезия "Убистезин"', 3),
(3500, 'Удаление зубов верхней челюсти 1,2,3', 3),
(5800, 'Удаление зубов верхней челюсти 8', 3),
(9500, 'Удаление зубов верхней челюсти 8 ретинированный', 3);

select * from service;
update service
SET Price = 220, Service_name = 'Покрытие матовое'
WHERE service_id = 4;

-- Медицинская история
create TABLE Medical_history (
    ID_Medical_history INT NOT NULL AUTO_INCREMENT,
    Start_date DATE NOT NULL,
    End_date DATE NULL,
    Treatment TEXT NOT NULL,
    Notes TEXT NOT NULL,
    Diagnosis_ID INT NOT NULL,
    Patient_ID INT NOT NULL, -- Добавленный внешний ключ к таблице Patient
    CONSTRAINT FK_Medical_history_diagnosis FOREIGN KEY (Diagnosis_ID)
        REFERENCES Diagnosis (ID_Diagnosis),
    CONSTRAINT FK_Medical_history_patient FOREIGN KEY (Patient_ID)
        REFERENCES Patient (ID_Patient), -- Внешний ключ к таблице Patient
    PRIMARY KEY (ID_Medical_history)
);

-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'Medical_history'
SET @@auto_increment_increment=1;

INSERT INTO Medical_history (Start_date, End_date, Treatment, Notes, Diagnosis_ID, Patient_ID)
VALUES ('2023-09-15', '2023-09-20', 'Зубная экстракция', 'Удаление мудрости зуба.', 1,2),
       ('2023-08-10', '2023-08-15', 'Профилактичная чистка', 'Регулярная гигиеническая чистка по плану.', 2, 2),
       ('2023-07-05', '2023-07-12', 'Лечение кариеса', 'Поставлена композитная пломба.', 3, 2);

-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

SELECT * FROM Medical_history;
SELECT ASch.ID_AppointmentSchedule, ASch.Date_of_Appointment,
       ASch.Doctor_ID, CONCAT(Doc.Surname_doctor, ' ', Doc.Name_doctor) AS Doctor_Name,
       ASch.Patient_ID, CONCAT(Pat.Surname_patient, ' ', Pat.Name_patient) AS Patient_Name,
       ASch.TimeSlot_ID, TS.TimeValue
FROM AppointmentSchedule AS ASch
INNER JOIN TimeSlots AS TS ON ASch.TimeSlot_ID = TS.ID_TimeSlot
INNER JOIN Patient AS Pat ON ASch.Patient_ID = Pat.ID_Patient
INNER JOIN Doctor AS Doc ON ASch.Doctor_ID = Doc.ID_Doctor;

-- Пациент
create TABLE Patient (
    ID_Patient INT NOT NULL AUTO_INCREMENT,
    Surname_patient VARCHAR(30) NOT NULL,
    Name_patient VARCHAR(30) NOT NULL,
    Middle_patient VARCHAR(30) NULL,
    Date_of_birth DATE NOT NULL,
    Phone_number VARCHAR(16) NOT NULL,
    Adress_patient TEXT NOT NULL,
    CONSTRAINT CHK_Phone_number CHECK (Phone_number LIKE '+7(%' AND Phone_number LIKE '%)___-__-__'),
    PRIMARY KEY (ID_Patient)
);
UPDATE Medical_history
SET 
    Patient_ID = '1'
WHERE 
    ID_Medical_history = '2';

-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'Patient'
SET @@auto_increment_increment=1;

INSERT INTO Patient (Surname_patient, Name_patient, Middle_patient, Date_of_birth, Phone_number, Adress_patient)
VALUES
    ('Валерьев', 'Петр', 'Сергеевич', '1990-01-15', '+7(920)123-45-67', 'Москва, ул. Примерная, 123'),
    ('Сашкин', 'Иван', 'Игоревич', '1985-05-20', '+7(920)123-45-68', 'Москва, ул. Тестовая, 456'),
    ('Сысоев', 'Алексей', 'Дмитриевич', '1992-11-08', '+7(920)123-45-67', 'Москва, ул. Образцовая, 789');

-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

SELECT * FROM Patient;
-- Create a ТРИГГЕР ДЛЯ ВАЛИДАЦИИ ДАННЫх даты рождения
DELIMITER //
CREATE TRIGGER tr_check_date_of_birth
BEFORE INSERT ON Patient
FOR EACH ROW
BEGIN
    IF NEW.Date_of_birth >= CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Дата рождения должна быть меньше текущей даты!';
    END IF;
END;
//
DELIMITER ;
-- Администратор
CREATE TABLE Administrator (
    ID_Administrator INT NOT NULL AUTO_INCREMENT,
    Surname_admin VARCHAR(30) NOT NULL,
    Name_admin VARCHAR(30) NOT NULL,
    Middle_admin VARCHAR(30) NULL,
    Email_admin VARCHAR(50) NOT NULL,
    Login_admin VARCHAR(20) NOT NULL,
    Password_admin VARCHAR(20) NOT NULL,
    Post_ID INT NOT NULL,
    CONSTRAINT FK_Administrator_Post FOREIGN KEY (Post_ID)
        REFERENCES Post (ID_Post),
    CONSTRAINT CHK_Password_Length CHECK (LENGTH(Password_admin) >= 5 AND LENGTH(Password_admin) <= 20),
    CONSTRAINT CHK_Password_Complexity CHECK (
        Password_admin REGEXP '[A-Z]' AND  -- Проверка на наличие заглавных букв
        Password_admin REGEXP '[a-z]' AND  -- Проверка на наличие строчных букв
        Password_admin REGEXP '[0-9]' AND  -- Проверка на наличие цифр
        Password_admin REGEXP '[^A-Za-z0-9]'  -- Проверка на наличие специальных символов
    ),
    CONSTRAINT CHK_Login_Latin CHECK (LENGTH(Login_admin) >= 5 AND LENGTH(Login_admin) <= 20), -- Проверка на логин на латинице
    CONSTRAINT CHK_Email_Length_Format CHECK (LENGTH(Email_admin) >= 5 AND Email_admin LIKE '%@%.%'),
    PRIMARY KEY (ID_Administrator)
);

-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'Administrator'
SET @@auto_increment_increment=1;

INSERT INTO Administrator (Surname_admin, Name_admin, Middle_admin, Email_admin, Login_admin, Password_admin, Post_ID)
VALUES
    ('Иванов', 'Петр', 'Сергеевич', 'ivanov@mail.ru', 'iVan1922', 'Password123!', 2),
    ('Петрова', 'Анна', 'Игоревна', 'petrov@bk.ru', 'anNa456', 'SecurePass456!', 2),
    ('Сидоров', 'Алексей', 'Дмитриевич', 'sidorov@mail.ru', 'Alex789', 'StrongPW789!', 2);

-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

create TABLE user_tokens (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    access_token TEXT,
    refresh_token TEXT,
    FOREIGN KEY (id_user) REFERENCES Users(ID_User)
);
CREATE USER 'new_user'@'%' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, PROCESS, REFERENCES, INDEX, ALTER, SHOW DATABASES, CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, REPLICATION SLAVE, REPLICATION CLIENT, CREATE VIEW, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, CREATE USER, EVENT, TRIGGER ON *.* TO 'root'@'%' WITH GRANT OPTION;
SELECT * FROM Doctor WHERE Login_doctor = 'ekaterina_petrov' AND Password_doctor = 'SecurePassword456!'

SELECT Name_doctor FROM Doctor WHERE ID_Doctor = 3;

CREATE TABLE Doctor (
    ID_Doctor INT NOT NULL AUTO_INCREMENT,
    Surname_doctor VARCHAR(30) NOT NULL,
    Name_doctor VARCHAR(30) NOT NULL,
    Middle_doctor VARCHAR(30) NULL,
    Email_doctor VARCHAR(50) NOT NULL,
    Login_doctor VARCHAR(20) NOT NULL,
    Specialization VARCHAR(50) NOT NULL,
    Cabinet_number VARCHAR(3) NOT NULL,
    Password_doctor VARCHAR(20) NOT NULL,
    Post_ID INT NOT NULL,
    category_id INT NOT NULL,
 
    CONSTRAINT FK_Doctor_Post FOREIGN KEY (Post_ID)
        REFERENCES Post (ID_Post),
    CONSTRAINT CHK_Password_Length_Doc CHECK (LENGTH(Password_doctor) >= 5 AND LENGTH(Password_doctor) <= 20),
    CONSTRAINT CHK_Password_Complexity_Doc CHECK (
        Password_doctor REGEXP '[A-Z]' AND  -- Проверка на наличие заглавных букв
        Password_doctor REGEXP '[a-z]' AND  -- Проверка на наличие строчных букв
        Password_doctor REGEXP '[0-9]' AND  -- Проверка на наличие цифр
        Password_doctor REGEXP '[^A-Za-z0-9]'  -- Проверка на наличие специальных символов
    ),
    CONSTRAINT CHK_Login_Length_Doc CHECK (LENGTH(Login_doctor) >= 5 AND LENGTH(Login_doctor) <= 20), -- Проверка на длину логина
	FOREIGN KEY (category_id) REFERENCES treatment_category(ID_Category),
    CONSTRAINT CHK_Email_Length_Format_Doc CHECK (LENGTH(Email_doctor) >= 5 AND Email_doctor LIKE '%@%.%'),
    PRIMARY KEY (ID_Doctor)
);
select * from Doctor;
-- Включаем опцию AUTO_INCREMENT для 'Doctor'
SET @@auto_increment_increment=1;

INSERT INTO Doctor (Surname_doctor, Name_doctor, Middle_doctor, Email_doctor, Login_doctor, Specialization, Cabinet_number, Password_doctor, Post_ID, category_id)
VALUES
    ('Иванов', 'Алексей', 'Петрович', 'ivanov@email.com', 'alex_ivanov', 'Хирургия', '101', 'StrongPW123!', 1, 2),
    ('Петров', 'Екатерина', 'Андреевна', 'petrov@mail.ru', 'ekaterina_petrov', 'Педиатрия', '102', 'SecurePassword456!', 1, 3),
    ('Смирнов', 'Мария', 'Ивановна', 'smirnov@gmail.com', 'maria_smirnov', 'Терапия', '103', 'ComplexPass789!', 1, 1);

-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;
SELECT ID_Doctor, Surname_doctor, Name_doctor, Middle_doctor FROM Doctor;
SELECT * FROM Doctor;
-- Расписание приемов
create TABLE AppointmentSchedule (
    ID_AppointmentSchedule INT PRIMARY KEY AUTO_INCREMENT,
    Date_of_Appointment DATE NOT NULL,
    Doctor_ID INT NOT NULL,
    Patient_ID INT NOT NULL, -- Внешний ключ,  таблица пациентов
    TimeSlot_ID INT NOT NULL,-- Внешний ключ,  таблица времени
    CONSTRAINT FK_Patient FOREIGN KEY (Patient_ID) 
		REFERENCES Patient(ID_Patient),
    CONSTRAINT FK_AppointmentSchedule_Doctor FOREIGN KEY (Doctor_ID)
        REFERENCES Doctor(ID_Doctor),
    CONSTRAINT FK_AppointmentSchedule_TimeSlot FOREIGN KEY (TimeSlot_ID)
        REFERENCES TimeSlots(ID_TimeSlot)
);


-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'AppointmentSchedule'
SET @@auto_increment_increment=1;

-- Вставка записей в таблицу AppointmentSchedule
INSERT INTO AppointmentSchedule (Date_of_Appointment, Doctor_ID, Patient_ID,TimeSlot_ID)
VALUES
    ('2023-11-15',  1, 1,1),
    ('2023-11-15', 2, 2, 2),
    ('2023-11-16',  3, 3, 4),
    ('2023-11-17',  2, 2, 5 ),
    ('2023-11-17',  3, 3,7);
    
-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;
-- DELETE FROM AppointmentSchedule WHERE ID_AppointmentSchedule = 14;

SELECT * FROM AppointmentSchedule;
CREATE TABLE TimeSlots (
    ID_TimeSlot INT PRIMARY KEY AUTO_INCREMENT,
    TimeValue TIME NOT NULL
);
-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'AppointmentSchedule'
SET @@auto_increment_increment=1;

INSERT INTO TimeSlots (TimeValue) VALUES 
('09:00:00'),
('10:00:00'),
('11:00:00'),
('12:00:00'),
('14:00:00'),
('15:00:00'),
('16:00:00'),
('17:00:00'),
('18:00:00');
-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;
-- Тригер на случай если у врача занят день и время для записи другим пациентом
DELIMITER //
create TRIGGER prevent_duplicate_appointments
BEFORE INSERT ON AppointmentSchedule
FOR EACH ROW
BEGIN
    DECLARE existing_appointment INT;
    SET existing_appointment = (
        SELECT COUNT(*)
        FROM AppointmentSchedule
        WHERE Doctor_ID = NEW.Doctor_ID
          AND Date_of_Appointment = NEW.Date_of_Appointment
          AND TimeSlot_ID = NEW.TimeSlot_ID
    );
    
    IF existing_appointment > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Данная дата и время заняты у выбранного врача. Пожалуйста, выберите другую дату или время.';
    END IF;
END//

DELIMITER ;
-- тригеры
DELIMITER //
CREATE TRIGGER prevent_past_appointments
BEFORE INSERT ON AppointmentSchedule
FOR EACH ROW
BEGIN
    IF NEW.Date_of_Appointment < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Нельзя добавить запись с датой меньше текущей';
    END IF;
END;
//
DELIMITER ;

-- -------------------------------------ПРЕДСТАВЛЕНИЯ----------------------
-- 
create VIEW FullUserData AS
SELECT 
    CONCAT(A.Surname_admin, ' ', A.Name_admin, IFNULL(CONCAT(' ', A.Middle_admin), '')) AS Administrator_FullName,
    CONCAT(D.Surname_doctor, ' ', D.Name_doctor, IFNULL(CONCAT(' ', D.Middle_doctor), '')) AS Doctor_FullName,
    CONCAT(R.Surname_registr, ' ', R.Name_registr, IFNULL(CONCAT(' ', R.Middle_registr), '')) AS Registrar_FullName,
    P.Post_name AS PostName
FROM Post P
LEFT JOIN Administrator A ON P.ID_Post = A.Post_ID
LEFT JOIN Doctor D ON P.ID_Post = D.Post_ID
LEFT JOIN Registrar R ON P.ID_Post = R.Post_ID;


SELECT * FROM FullUserData
--  
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
-- 
SELECT * FROM service;
SELECT * FROM Patient;
SELECT * FROM Registrar;
SELECT ID_Patient, CONCAT(Surname_patient , " ", Name_patient , " ", Middle_patient) AS FullName FROM Patient
CREATE TABLE Payment (
    ID_Payment INT NOT NULL AUTO_INCREMENT,
    Date_payment DATETIME NOT NULL,
    Service_ID INT NOT NULL,
    Registrar_ID INT NOT NULL,
    Patient_ID INT NOT NULL,
    CONSTRAINT FK_Payment_Service FOREIGN KEY (Service_ID)
        REFERENCES service (service_id),
    CONSTRAINT FK_Payment_Patient FOREIGN KEY (Patient_ID)
        REFERENCES Patient (ID_Patient),
    CONSTRAINT FK_Payment_Registrar FOREIGN KEY (Registrar_ID)
        REFERENCES Registrar (ID_Registrar),
    PRIMARY KEY (ID_Payment)
);
SELECT p.ID_Payment, p.Date_payment, s.Service_name, s.Price,
       CONCAT(r.Surname_registr, ' ', r.Name_registr, ' ', COALESCE(r.Middle_registr, '')) AS Registrar_name,
       CONCAT(pat.Surname_patient, ' ', pat.Name_patient, ' ', COALESCE(pat.Middle_patient, '')) AS Patient_name
FROM Payment p
JOIN service s ON p.Service_ID = s.service_id
JOIN Registrar r ON p.Registrar_ID = r.ID_Registrar
JOIN Patient pat ON p.Patient_ID = pat.ID_Patient;

-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'Payment'
SET @@auto_increment_increment=1;

-- Вставка записей в таблицу Payment
INSERT INTO Payment (Date_payment, Service_ID, Registrar_ID, Patient_ID)
VALUES
    ('2023-04-15 10:00:00',  1, 1, 1),
    ('2023-07-20 14:30:00',2, 2, 2),
    ('2023-08-29 11:00:00', 3, 3, 3);

-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;
SELECT * FROM Payment;
--
CREATE TABLE Registrar (
    ID_Registrar INT NOT NULL AUTO_INCREMENT,
    Surname_registr VARCHAR(30) NOT NULL,
    Name_registr VARCHAR(30) NOT NULL,
    Middle_registr VARCHAR(30) NULL,
    Email_registr VARCHAR(50) NOT NULL,
    Login_registr VARCHAR(20) NOT NULL,
    Password_registr VARCHAR(20) NOT NULL,
    Post_ID INT NOT NULL,
    CONSTRAINT FK_Registrar_Post FOREIGN KEY (Post_ID)
        REFERENCES Post (ID_Post),
    CONSTRAINT CHK_Password_Length_Reg CHECK (LENGTH(Password_registr) >= 5 AND LENGTH(Password_registr) <= 20),
    CONSTRAINT CHK_Password_Complexity_Reg CHECK (
        Password_registr REGEXP '[A-Z]' AND  -- Проверка на наличие заглавных букв
        Password_registr REGEXP '[a-z]' AND  -- Проверка на наличие строчных букв
        Password_registr REGEXP '[0-9]' AND  -- Проверка на наличие цифр
        Password_registr REGEXP '[^A-Za-z0-9]'  -- Проверка на наличие специальных символов
    ),
    CONSTRAINT CHK_Login_Latin_Reg CHECK (LENGTH(Login_registr) >= 5 AND LENGTH(Login_registr) <= 20), -- Проверка на логин на длину
    CONSTRAINT CHK_Email_Length_Format_Reg CHECK (LENGTH(Email_registr) >= 5 AND Email_registr LIKE '%@%.%'),
    PRIMARY KEY (ID_Registrar)
);

-- Выключаем опцию AUTO_INCREMENT
SET @@auto_increment_increment=1;

-- Включаем опцию AUTO_INCREMENT для 'Registrar'
SET @@auto_increment_increment=1;

INSERT INTO Registrar (Surname_registr, Name_registr, Middle_registr, Email_registr, Login_registr, Password_registr, Post_ID)
VALUES
    ('Смирнова', 'Ирина', 'Александровна', 'smirnova@mail.ru', 'irina123', 'SecurePW123!', 3),
    ('Козлов', 'Денис', 'Павлович', 'kozlov@bk.ru', 'denis456', 'StrongPass456!', 3),
    ('Васильева', 'Ольга', 'Владимировна', 'vasilieva@mail.ru', 'olga789', 'Password987!', 3);

-- Завершаем операцию AUTO_INCREMENT
SET @@auto_increment_increment=1;
SELECT Users.*, Post.post_name
FROM Users
INNER JOIN Post ON Users.Post_ID = Post.ID_Post;

SELECT * FROM user_tokens;
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛИ
CREATE TABLE Users (
    ID_User INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(30) NOT NULL,
    Surname VARCHAR(30) NOT NULL,
    MiddleName VARCHAR(30),
    Email VARCHAR(30) NOT NULL,
    Password  VARCHAR(100) NOT NULL,
    Login VARCHAR(20) UNIQUE NOT NULL,
    Post_ID INT NOT NULL,
	CONSTRAINT CHK_Password_Len CHECK (LENGTH(Password) >= 5 AND LENGTH(Password) <= 100),
    CONSTRAINT CHK_Password_Complexit CHECK (
        Password REGEXP '[A-Z]' AND  -- Проверка на наличие заглавных букв
        Password REGEXP '[a-z]' AND  -- Проверка на наличие строчных букв
        Password REGEXP '[0-9]' AND  -- Проверка на наличие цифр
        Password REGEXP '[^A-Za-z0-9]'  -- Проверка на наличие специальных символов
    ),
    CONSTRAINT CHK_Login_Length CHECK (LENGTH(Login) >= 5 AND LENGTH(Login) <= 60), -- Проверка на длину логина
    CONSTRAINT CHK_Email_Length_ CHECK (LENGTH(Email) >= 5 AND Email LIKE '%@%.%'),
    FOREIGN KEY (Post_ID) REFERENCES Post(ID_Post)
);

INSERT INTO Users (Name, Surname, MiddleName, Email, Login, Password, Post_ID)
VALUES     ('Иванов', 'Алексей', 'Петрович', 'ivanov@email.com', 'alex_ivanov',  'StrongPW123!', 1 ),
    ('Петров', 'Екатерина', 'Андреевна', 'petrov@mail.ru', 'ekaterina_petrov',  'SecurePassword456!', 1),
    ('Смирнов', 'Мария', 'Ивановна', 'smirnov@gmail.com', 'maria_smirnov',  'ComplexPass789!', 1),
	('Смирнова', 'Ирина', 'Александровна', 'smirnova@mail.ru', 'irina123', 'SecurePW123!', 3),
    ('Козлов', 'Денис', 'Павлович', 'kozlov@bk.ru', 'denis456', 'StrongPass456!', 3),
    ('Васильева', 'Ольга', 'Владимировна', 'vasilieva@mail.ru', 'olga789', 'Password987!', 3),
	('Иванов', 'Петр', 'Сергеевич', 'ivanov@mail.ru', 'iVan1922', 'Password123!', 2),
    ('Петрова', 'Анна', 'Игоревна', 'petrov@bk.ru', 'anNa456', 'SecurePass456!', 2),
    ('Сидоров', 'Алексей', 'Дмитриевич', 'sidorov@mail.ru', 'Alex789', 'StrongPW789!', 2);

select * from Users;
-- ПРОЦЕДУРЫ
-- 1.получения минимальной цены услуги, использованной конкретным пациентом и зафиксированной определенным регистратором.
SELECT Users.ID_User, Users.Name'+'Users.Surname'+'Users.MiddleName, Users.Email, Users.Login, Users.Post_ID, Post.ID_Post, Post.Post_name
FROM Users
INNER JOIN Post ON Users.Post_ID = Post.ID_Post;

DELIMITER //
create PROCEDURE GetMinPriceService(
    IN PatientID INT, 
    IN RegistrarID INT, 
    OUT MinPrice DECIMAL(10, 2), 
    OUT PatientName VARCHAR(255), 
    OUT PatientSurname VARCHAR(255)
)
BEGIN
    SELECT MIN(service.Price), Patient.Name_patient, Patient.Surname_patient
    INTO MinPrice, PatientName, PatientSurname
    FROM service
    INNER JOIN Payment ON service.service_id = Payment.Service_ID
    INNER JOIN Patient ON Payment.Patient_ID = Patient.ID_Patient
    WHERE Payment.Patient_ID = PatientID AND Payment.Registrar_ID = RegistrarID;
END //

SET @MinPrice = NULL;
SET @PatientName = NULL;
SET @PatientSurname = NULL;

CALL GetMinPriceService(1, 2, @MinPrice, @PatientName, @PatientSurname);
SELECT @MinPrice AS 'Минимальная стоимость услуги', CONCAT(@PatientSurname, ' ', @PatientName) AS 'Пациент';
DELIMITER //

CREATE PROCEDURE GetMaxPriceService(
    IN PatientID INT, 
    IN RegistrarID INT, 
    OUT MaxPrice DECIMAL(10, 2), 
    OUT PatientName VARCHAR(255), 
    OUT PatientSurname VARCHAR(255)
)
BEGIN
    SELECT MAX(service.Price), Patient.Name_patient, Patient.Surname_patient
    INTO MaxPrice, PatientName, PatientSurname
    FROM service
    INNER JOIN Payment ON service.service_id = Payment.Service_ID
    INNER JOIN Patient ON Payment.Patient_ID = Patient.ID_Patient
    WHERE Payment.Patient_ID = PatientID AND Payment.Registrar_ID = RegistrarID;
END //

DELIMITER ;

SET @MaxPrice = NULL;
SET @PatientNameMax = NULL;
SET @PatientSurnameMax = NULL;

CALL GetMaxPriceService(1, 2, @MaxPrice, @PatientNameMax, @PatientSurnameMax);

SELECT @MaxPrice AS 'Максимальная стоимость услуги', CONCAT(@PatientNameMax, ' ', @PatientSurnameMax) AS 'Имя и фамилия пациента';
--  Последние 5 платежей
DELIMITER //
CREATE PROCEDURE GetLastPaymentInfo()
BEGIN
    SELECT 
        Payment.ID_Payment,
        Payment.Date_payment,
        service.Service_name,
        CONCAT(Registrar.Name_registr, ' ', Registrar.Surname_registr) AS RegistrarFullName,
        CONCAT(Patient.Name_patient, ' ', Patient.Surname_patient) AS PatientFullName
    FROM Payment
    JOIN service ON Payment.Service_ID = service.service_id
    JOIN Registrar ON Payment.Registrar_ID = Registrar.ID_Registrar
    JOIN Patient ON Payment.Patient_ID = Patient.ID_Patient
    ORDER BY Payment.Date_payment DESC
    LIMIT 1;
END //

CALL GetLastPaymentInfo();


-- Платежи добавленные за сегодняшний день
DELIMITER //
CREATE PROCEDURE GetPaymentsForToday()
BEGIN
  SELECT 
        Payment.ID_Payment,
        Payment.Date_payment,
        service.Service_name,
        CONCAT(Registrar.Name_registr, ' ', Registrar.Surname_registr) AS RegistrarFullName,
        CONCAT(Patient.Name_patient, ' ', Patient.Surname_patient) AS PatientFullName
    FROM Payment
    JOIN service ON Payment.Service_ID = service.service_id
    JOIN Registrar ON Payment.Registrar_ID = Registrar.ID_Registrar
    JOIN Patient ON Payment.Patient_ID = Patient.ID_Patient
    WHERE DATE(Date_payment) = CURDATE();
END //
CALL GetPaymentsForToday();

SELECT 
    AppointmentSchedule.ID_AppointmentSchedule,
    AppointmentSchedule.Date_of_Appointment,
    Doctor.CONCAT(ID_Doctor, ' - ', Doctor.Surname_doctor, ' ', Doctor.Name_doctor, IFNULL(CONCAT(' ', Doctor.Middle_doctor), '')) AS Doctor_Info,
    Patient.CONCAT(ID_Patient, ' - ', Patient.Surname_patient, ' ', Patient.Name_patient, IFNULL(CONCAT(' ', Patient.Middle_patient), '')) AS Patient_Info,
    TimeSlots.ID_TimeSlot,
    TimeSlots.TimeValue
FROM 
    AppointmentSchedule
INNER JOIN 
    Doctor ON AppointmentSchedule.Doctor_ID = Doctor.ID_Doctor
INNER JOIN 
    Patient ON AppointmentSchedule.Patient_ID = Patient.ID_Patient
INNER JOIN 
    TimeSlots ON AppointmentSchedule.TimeSlot_ID = TimeSlots.ID_TimeSlot;
DELIMITER //

DELIMITER //

CREATE FUNCTION CalculateClinicIncome()
RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
    DECLARE total_income DECIMAL(10, 2);
    SELECT SUM(s.Price) INTO total_income
    FROM Payment p
    JOIN service s ON p.Service_ID = s.service_id;
    
    RETURN total_income;
END //

DELIMITER ;

SELECT CalculateClinicIncome() AS TotalIncome;

SELECT ASch.ID_AppointmentSchedule, ASch.Date_of_Appointment,
       ASch.Doctor_ID, CONCAT(Doc.Surname_doctor, ' ', Doc.Name_doctor, ' ', Doc.Middle_doctor) AS Doctor_Name,
       Doc.Specialization,
       ASch.Patient_ID, CONCAT(Pat.Surname_patient, ' ', Pat.Name_patient, ' ', Pat.Middle_patient) AS Patient_Name,
       ASch.TimeSlot_ID, TS.TimeValue
FROM AppointmentSchedule AS ASch
INNER JOIN TimeSlots AS TS ON ASch.TimeSlot_ID = TS.ID_TimeSlot
INNER JOIN Patient AS Pat ON ASch.Patient_ID = Pat.ID_Patient
INNER JOIN Doctor AS Doc ON ASch.Doctor_ID = Doc.ID_Doctor;
-- ТРИГЕР логирование

DELIMITER //
create TRIGGER after_role_update AFTER UPDATE ON Users FOR EACH ROW
BEGIN
  IF OLD.Post_ID != NEW.Post_ID THEN
    INSERT INTO RoleChangeLog (user_id, description, timestamp)
    VALUES (NEW.ID_User, CONCAT('Роль изменена на ', NEW.Post_ID), NOW());
  END IF;
END;
//
DELIMITER ;
CREATE TABLE RoleChangeLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id int,
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(ID_User)
);

select * from  RoleChangeLog;
SELECT 
    a.ID_AppointmentSchedule,
    a.Date_of_Appointment,
    d.ID_Doctor AS Doctor_ID,
    d.Surname_doctor,
    d.Name_doctor,
    d.Middle_doctor,
    d.Cabinet_number,
    tc.category_name AS Department,
    t.TimeValue AS Time_of_Appointment,
    p.ID_Patient AS Patient_ID,
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
