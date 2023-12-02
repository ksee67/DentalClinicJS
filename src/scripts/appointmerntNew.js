async function fetchDoctorSpecialization(doctorId) {
  try {
    const response = await fetch(`http://localhost:3001/doctors/${doctorId}`);
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о враче');
    }
    const doctorData = await response.json();
    return doctorData.Specialization;
  } catch (error) {
    console.error('Ошибка получения данных о враче:', error);
    return null;
  }
}

async function fillSpecializationsDropdown(doctorId) {
  try {
    const response = await fetch(`http://localhost:3001/doctors/${doctorId}`);
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о враче');
    }
    const doctorData = await response.json();
    
    const specializationDropdown = document.getElementById('specialization');
    specializationDropdown.innerHTML = '';

    const specialization = doctorData.Specialization;
    if (specialization) {
      const option = document.createElement('option');
      option.value = specialization; // Устанавливаем значение специализации
      option.text = specialization;
      specializationDropdown.appendChild(option);
    }
  } catch (error) {
    console.error('Ошибка заполнения данных о специализации:', error);
  }
}

function handleTimeSlotChange() {
  const timeDropdown = document.getElementById('time');
  timeDropdown.addEventListener('change', async function() {
    try {
      const selectedTimeSlotId = this.value; // Получаем выбранное значение временного слота
      const timeDropdown = document.getElementById('time');
      timeDropdown.innerHTML = '';
      await fillTimeSlotsDropdown(); // Заново заполнить выпадающий список временных слотов
    } catch (error) {
      console.error('Ошибка при обработке изменения временного слота:', error);
    }
  });
}


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

async function fillDoctorsDropdown() {
  try {
    const doctors = await fetchDoctors();
    const doctorDropdown = document.getElementById('doctor');

    doctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.ID_Doctor;
      option.text = `${doctor.Surname_doctor} ${doctor.Name_doctor} ${doctor.Middle_doctor}`;
      doctorDropdown.appendChild(option);
    });

    // Инициализация отображения специализации при загрузке страницы
    const initialDoctorId = doctorDropdown.value;
    fillSpecializationsDropdown(initialDoctorId);
  } catch (error) {
    console.error('Ошибка заполнения данных о врачах:', error);
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
function handleTimeSlotChange() {
  const timeDropdown = document.getElementById('time');
  timeDropdown.addEventListener('change', function() {
    const selectedTimeSlotId = this.value; // Получаем выбранное значение временного слота

    const timeDropdown = document.getElementById('time');
    timeDropdown.innerHTML = '';
    fillTimeSlotsDropdown(); // Заново заполнить выпадающий список временных слотов
  });
}

function checkForSunday() {
  const inputDate = document.getElementById('selectedDate');
  const selectedDate = new Date(inputDate.value);
  if (selectedDate.getDay() === 0) {
    alert('Воскресенье нерабочий день! Пожалуйста, выберите другую дату.');
    inputDate.value = ''; // Сбросить значение, если выбрано воскресенье
  }
}
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('http://localhost:3001/patients');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных о пациентах');
      }
      const patients = await response.json();
  
      const patientSelect = document.getElementById('patient');
      const searchInput = document.getElementById('searchPatient');
  
      // Функция для заполнения списка пациентов
      function fillPatientsDropdown(searchText = '') {
        patientSelect.innerHTML = '';
        patients
          .filter(patient => patient.FullName.toLowerCase().includes(searchText.toLowerCase()))
          .forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.ID_Patient;
            option.textContent = patient.FullName;
            patientSelect.appendChild(option);
          });
      }
  
      // Заполняем список пациентов при загрузке страницы
      fillPatientsDropdown();
  
      // Добавляем обработчик для поиска внутри селекта
      searchInput.addEventListener('input', function () {
        fillPatientsDropdown(this.value);
      });
    } catch (error) {
      console.error('Ошибка при загрузке данных о пациентах:', error);
    }
    const addAppointmentButton = document.getElementById('addAppointmentButton');

  addAppointmentButton.addEventListener('click', async () => {
  
      try {
        const selectedDoctorId = document.getElementById('doctor').value;
        const selectedPatientId = document.getElementById('patient').value;
        let selectedTimeSlotId = document.getElementById('time').value;
        const selectedDate = document.getElementById('selectedDate').value;
    
      // Проверка на undefined или null
      if (selectedTimeSlotId !== undefined && selectedTimeSlotId !== null && selectedTimeSlotId !== '') {
        selectedTimeSlotId = parseInt(selectedTimeSlotId); // Преобразование в число, если необходимо
        const response = await fetch('http://localhost:3001/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Doctor_ID: selectedDoctorId,
            Patient_ID: selectedPatientId,
            TimeSlot_ID: selectedTimeSlotId,
            Date_of_Appointment: selectedDate,
          }),
        });
    
          if (response.ok) {
            alert('Запись успешно добавлена');
          } else {
            throw new Error('Ошибка при добавлении записи');
          }
        } else {
          console.error('Ошибка: Некорректное значение selectedTimeSlotId');
          alert('Произошла ошибка при добавлении записи: Некорректное значение временного слота');
        }
      } catch (error) {
        console.error('Ошибка при добавлении записи:', error);
        alert('Произошла ошибка при добавлении записи');
      }
    });
  });
  
  window.onload = function () {
    fillDoctorsDropdown();
    fillTimeSlotsDropdown();    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keyup', searchPatients);
    }
  };
  