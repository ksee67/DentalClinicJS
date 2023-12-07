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
document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const tableBody = document.getElementById('appointmentTableBody');
  let allAppointments = []; // Хранит все записи

  function filterAppointmentsByDate(startDate, endDate) {
    return allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.Date_of_Appointment);
      return appointmentDate >= startDate && (!endDate || appointmentDate <= endDate);
    });
  }

  function displayAppointments(appointments) {
    tableBody.innerHTML = '';

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
      editButton.addEventListener('click', () => editAppointment(appointment)); // Функция editAppointment вызывается при нажатии кнопки
      editCell.appendChild(editButton);
      row.appendChild(editCell);
  
      tableBody.appendChild(row);
    });
  }

  function handleDateSelection() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    const filteredAppointments = filterAppointmentsByDate(startDate, endDate);
    displayAppointments(filteredAppointments);
  }
  function editAppointment(appointment) {
    const appointmentId = appointment.ID_AppointmentSchedule;
    localStorage.setItem('selectedAppointmentId', appointmentId);
    const url = `AppointmentDetail.html?id=${appointmentId}`;
    window.location.href = `${url}?id=${appointmentId}`;
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