
async function fetchDoctors() {
  try {
    const response = await fetch('http://localhost:3001/doctors');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о врачах');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения данных о врачах:', error);
    return [];
  }
}

async function fetchTimeSlots() {
  try {
    const response = await fetch('http://localhost:3001/timeslots');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о временных слотах');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения данных о временных слотах:', error);
    return [];
  }
}

async function fetchAppointments() {
  try {
    const response = await fetch('http://localhost:3001/appointments');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о записях на прием');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения данных о записях на прием:', error);
    return [];
  }
}

async function fillTimeSlotsDropdown() {
  try {
    const response = await fetch('http://localhost:3001/timeslots');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о временных слотах');
    }
    const timeSlots = await response.json();
    const timeDropdown = document.getElementById('time');

    timeDropdown.innerHTML = ''; // Очистить список перед заполнением

    timeSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot.ID_TimeSlot;
      option.text = formatTime(slot.TimeValue);
      timeDropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Ошибка заполнения данных о временных слотах:', error);
  }
}

function formatTime(timeValue) {
  const date = new Date();
  const [hours, minutes, seconds] = timeValue.split(':');
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds || 0);

  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function checkForSunday() {
  const inputDate = document.getElementById('selectedDate');
  const selectedDate = new Date(inputDate.value);
  if (selectedDate.getDay() === 0) {
    alert('Воскресенье нерабочий день! Пожалуйста, выберите другую дату.');
    inputDate.value = ''; // Сбросить значение, если выбрано воскресенье
  }
}

function fillComboBox(data, elementId, valueKey, textKey, departmentKey) {
  const comboBox = document.getElementById(elementId);
  comboBox.innerHTML = '';

  const existingValues = new Set(); // Создаем множество для хранения уникальных значений

  data.forEach(item => {
    if (!existingValues.has(item[valueKey])) { // Проверяем, есть ли уже такое значение
      const option = document.createElement('option');
      option.value = item[valueKey];
      option.text = item[textKey];
      option.dataset.departmentId = item[departmentKey]; // Сохраняем отделение в dataset

      comboBox.appendChild(option);
      existingValues.add(item[valueKey]); // Добавляем значение в множество
    }
  });
}

let id; 
let doctorId; 
let patientId;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    id = urlParams.get('id');
    doctorId = urlParams.get('doctorId');
    patientId = urlParams.get('patientId');
    const doctorName = urlParams.get('doctorName');
    const patientName = urlParams.get('patientName');
    const rawDate = urlParams.get('date');
    const time = urlParams.get('time');
    const department = urlParams.get('department');

    const date = new Date(rawDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    document.getElementById('doctor').innerHTML = `<option value="${doctorId}">${doctorName}</option>`;
    document.getElementById('patient').innerHTML = `<option value="${patientId}">${patientName}</option>`;
    document.getElementById('selectedDate').value = formattedDate;
    document.getElementById('time').value = time;
    document.getElementById('department').innerHTML = `<option value="${department}">${department}</option>`;

    const responseTimeSlots = await fetch('http://localhost:3001/timeslots');
    const timeSlotsData = await responseTimeSlots.json();
    fillTimeSlotsDropdown(timeSlotsData);

    const response = await fetch('http://localhost:3001/myappointments');
    const data = await response.json();

    fillComboBox(data, 'doctor', 'Doctor_ID', 'Doctor_Info', 'Doctor_Department_ID');
    fillComboBox(data, 'time', 'ID_TimeSlot', 'TimeValue');

    const doctorSelect = document.getElementById('doctor');
    const departmentSelect = document.getElementById('department');

    doctorSelect.addEventListener('change', () => {
      const selectedDoctorId = doctorSelect.value;

      departmentSelect.innerHTML = '';

      data.forEach(item => {
        if (item.Doctor_ID === selectedDoctorId) {
          const option = document.createElement('option');
          option.value = item.Department_ID;
          option.text = item.Department_Name;
          departmentSelect.appendChild(option);
        }
      });
    });
  } catch (error) {
    console.error('Ошибка:', error);
  }
});

function fillTimeSlotsDropdown(timeSlotsData) {
  const timeDropdown = document.getElementById('time');
  timeDropdown.innerHTML = '';

  timeSlotsData.forEach(slot => {
    const option = document.createElement('option');
    option.value = slot.ID_TimeSlot;
    option.text = formatTime(slot.TimeValue);
    timeDropdown.appendChild(option);
  });
}

function formatTime(timeValue) {
  const date = new Date();
  const [hours, minutes, seconds] = timeValue.split(':');
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds || 0);

  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

document.getElementById('editSubmit').addEventListener('click', async () => {
  const date = document.getElementById('selectedDate').value;
  const timeSlotID = document.getElementById('time').value;

  try {
    const appointmentData = {
      Date_of_Appointment: date,
      Doctor_ID: doctorId,
      Patient_ID: patientId,
      TimeSlot_ID: timeSlotID
    };

    const currentDate = new Date();
    const selectedDateTime = new Date(date);

    if (selectedDateTime < currentDate) {
      alert('Нельзя перенести прием на прошедшее время.');
      return;
    }

    const confirmation = confirm('Уверены ли вы, что хотите обновить запись на прием?');

    if (!confirmation) {
      return;
    }

    const checkResponse = await fetch(`http://localhost:3001/appointments/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Doctor_ID: doctorId,
        Date_of_Appointment: date,
        TimeSlot_ID: timeSlotID
      })
    });

    if (!checkResponse.ok) {
      throw new Error('Ошибка проверки');
    }

    const isAppointmentAvailable = await checkResponse.json();

    if (!isAppointmentAvailable) {
      alert('Данное время занято у выбранного врача. Пожалуйста, выберите другое время.');
      return;
    }

    const updateResponse = await fetch(`http://localhost:3001/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });

    if (!updateResponse.ok) {
      throw new Error('Ошибка сети');
    }

    const message = await updateResponse.text();
    alert(message);
    location.reload();
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка при обновлении записи');
  }
});

document.getElementById('deleteSubmit').addEventListener('click', async () => {
  try {
    const deleteResponse = await fetch(`http://localhost:3001/appointments/${id}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      throw new Error('Ошибка удаления записи');
    }

    const message = await deleteResponse.text();
    alert(message);
    
    // Перенаправление на AppointmentPage.html
    window.location.href = 'http://127.0.0.1:5500/public/AppointmentPage.html';
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка при удалении записи');
  }
});
