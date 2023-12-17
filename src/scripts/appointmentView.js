function formatDate(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  // Добавляем ноль перед месяцем и днем, если они состоят из одной цифры
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }

  return `${year}-${month}-${day}`;
}
let doctorId; // Объявление doctorId
let patientId; // Объявление patientId

document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const tableBody = document.getElementById('appointmentTableBody');
  const patientNameInput = document.getElementById('patientName');
  const doctorNameInput = document.getElementById('doctorName');
  let allAppointments = []; // Хранит все записи
  const today = new Date();
startDateInput.valueAsDate = today;
 //  для фильтрации записей по дате
 function filterAppointmentsByDate(startDate, endDate) {
  return allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.Date_of_Appointment);
    return appointmentDate >= startDate && (!endDate || appointmentDate <= endDate);
  });
}

// Обработчик изменения даты начала и окончания
function handleDateSelection() {
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  const filteredAppointments = filterAppointmentsByDate(startDate, endDate);
  displayAppointments(filteredAppointments);
}

// Добавляем обработчики для полей даты
startDateInput.addEventListener('change', handleDateSelection);
endDateInput.addEventListener('change', handleDateSelection);

  fetch('http://localhost:3001/viewappointments')
  .then(response => response.json())
  .then(data => {
    allAppointments = data;
    const firstAppointment = allAppointments[0];
    doctorId = firstAppointment.Doctor_ID; // Присвоение значения doctorId
    patientId = firstAppointment.Patient_ID; // Присвоение значения patientId
    
    displayAppointments(allAppointments);
  })
  .catch(error => console.error('Ошибка получения данных:', error));
  function displayAppointments(appointments) {
    tableBody.innerHTML = '';

    if (appointments.length === 0) {
      const row = document.createElement('tr');
      const noResultsCell = document.createElement('td');
      noResultsCell.textContent = 'По вашему запросу записей не найдено';
      noResultsCell.colSpan = 7; // Занимает все столбцы
      row.appendChild(noResultsCell);
      tableBody.appendChild(row);
    } else {
    appointments.forEach(appointment => {
      const row = document.createElement('tr');

      const dateCell = document.createElement('td');
      const appointmentDate = new Date(appointment.Date_of_Appointment);
      dateCell.textContent = formatDate(appointmentDate);
      row.appendChild(dateCell);
      const doctorFullNameCell = document.createElement('td');
      doctorFullNameCell.textContent = `${appointment.Surname_doctor} ${appointment.Name_doctor} ${appointment.Middle_doctor}`;
      row.appendChild(doctorFullNameCell);

      const cabinetCell = document.createElement('td');
      cabinetCell.textContent = appointment.Cabinet_number;
      row.appendChild(cabinetCell);

      const departmentCell = document.createElement('td');
      departmentCell.textContent = appointment.Department;
      row.appendChild(departmentCell);

      const timeCell = document.createElement('td');
      timeCell.textContent = appointment.Time_of_Appointment;
      row.appendChild(timeCell);

      const patientFullNameCell = document.createElement('td');
      patientFullNameCell.textContent = appointment.Patient_FullName;
      row.appendChild(patientFullNameCell);

      const patientPhoneCell = document.createElement('td');
      patientPhoneCell.textContent = appointment.Patient_Phone;
      row.appendChild(patientPhoneCell);
      const editCell = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.textContent = 'Редактировать';
      editButton.addEventListener('click', () => editAppointment(appointment));
      editCell.appendChild(editButton);
      row.appendChild(editCell);
  
      tableBody.appendChild(row);
    });
  }
}
function filterAppointmentsBySearchAndDate(appointments, patientName, doctorName, startDate, endDate) {
  return appointments.filter(appointment => {
    const patientFullName = appointment.Patient_FullName.toLowerCase();
    const doctorFullName = `${appointment.Surname_doctor} ${appointment.Name_doctor} ${appointment.Middle_doctor}`.toLowerCase();
    const appointmentDate = new Date(appointment.Date_of_Appointment);

    const matchesPatient = patientFullName.includes(patientName.toLowerCase());
    const matchesDoctor = doctorFullName.includes(doctorName.toLowerCase());
    const matchesDate = appointmentDate >= startDate && (!endDate || appointmentDate <= endDate);

    return matchesPatient && matchesDoctor && matchesDate;
  });
}

function handleSearchAndDateInput() {
  const patientName = patientNameInput.value.trim();
  const doctorName = doctorNameInput.value.trim();
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  const filteredAppointments = filterAppointmentsBySearchAndDate(allAppointments, patientName, doctorName, startDate, endDate);
  displayAppointments(filteredAppointments);
}

patientNameInput.addEventListener('input', handleSearchAndDateInput);
doctorNameInput.addEventListener('input', handleSearchAndDateInput);
startDateInput.addEventListener('change', handleSearchAndDateInput);
endDateInput.addEventListener('change', handleSearchAndDateInput);

  function filterAppointmentsBySearch(appointments, patientName, doctorName) {
    return appointments.filter(appointment => {
      const patientFullName = appointment.Patient_FullName.toLowerCase();
      const doctorFullName = `${appointment.Surname_doctor} ${appointment.Name_doctor} ${appointment.Middle_doctor}`.toLowerCase();

      const matchesPatient = patientFullName.includes(patientName.toLowerCase());
      const matchesDoctor = doctorFullName.includes(doctorName.toLowerCase());

      return matchesPatient && matchesDoctor;
    });
  }

  function handleSearchInput() {
    const patientName = patientNameInput.value.trim();
    const doctorName = doctorNameInput.value.trim();

    const filteredAppointments = filterAppointmentsBySearch(allAppointments, patientName, doctorName);
    displayAppointments(filteredAppointments);
  }

  patientNameInput.addEventListener('input', handleSearchInput);
  doctorNameInput.addEventListener('input', handleSearchInput);
  function handleDateSelection() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    const filteredAppointments = filterAppointmentsByDate(startDate, endDate);
    displayAppointments(filteredAppointments);
  }function editAppointment(appointment) {
    const appointmentId = appointment.ID_AppointmentSchedule;
    const dateOfAppointment = appointment.Date_of_Appointment;
    const doctorId = appointment.Doctor_ID; // Получаем doctorId из appointment
    const patientId = appointment.Patient_ID; // Получаем patientId из appointment
    const doctorFullName = `${appointment.Surname_doctor} ${appointment.Name_doctor} ${appointment.Middle_doctor}`;
    const patientFullName = appointment.Patient_FullName;
    const timeOfAppointment = appointment.Time_of_Appointment;
    const department = appointment.Department;
  
    // Кодируем данные для URL-адреса
    const encodedDoctorName = encodeURIComponent(doctorFullName);
    const encodedPatientName = encodeURIComponent(patientFullName);
    const encodedDepartment = encodeURIComponent(department);
  
    // Формируем URL-адрес с передачей параметров через строку запроса
    const url = `AppointmentDetail.html?id=${appointmentId}&doctorId=${doctorId}&patientId=${patientId}&doctorName=${encodedDoctorName}&patientName=${encodedPatientName}&date=${dateOfAppointment}&time=${timeOfAppointment}&department=${encodedDepartment}`;
  
    // Перенаправляем пользователя на страницу с URL-адресом, содержащим параметры
    window.location.href = url;
  }
  
  
  startDateInput.addEventListener('change', handleDateSelection);
  endDateInput.addEventListener('change', handleDateSelection);

  // Расчет и установка начальной даты на 7 дней назад от сегодняшней
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  startDateInput.valueAsDate = sevenDaysAgo;

  // Получаем все записи при загрузке страницы
  fetch('http://localhost:3001/viewappointments')
  .then(response => response.json())
  .then(data => {
    allAppointments = data;
    displayAppointments(allAppointments);
  })
  .catch(error => console.error('Ошибка получения данных:', error));

});
// Получение кнопки по ее ID
const updateButton = document.getElementById('updateButton');

// Добавление обработчика события click
updateButton.addEventListener('click', function() {
  // Перенаправление на другую страницу
  window.location.href = '../public/appointmentUpdate.html'; // Путь к вашей странице appointmentUpdate.html
});
