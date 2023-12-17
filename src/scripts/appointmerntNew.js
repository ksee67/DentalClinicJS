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

async function fillDoctorsDropdown() {
  try {
    const doctors = await fetchDoctors();
    const doctorDropdown = document.getElementById('doctor');

    doctors.forEach((doctor, index) => {
      const option = document.createElement('option');
      option.value = doctor.ID_Doctor;
      option.text = `${doctor.Surname_doctor} ${doctor.Name_doctor} ${doctor.Middle_doctor}`;
      option.setAttribute('data-category-id', doctor.category_id); // Store category_id as data attribute
      doctorDropdown.appendChild(option);

      if (index === 0) {
        option.selected = true; // Set the first option as selected by default
      }
    });

    doctorDropdown.addEventListener('change', function () {
      const selectedDoctorId = this.value;
      const selectedOption = this.options[this.selectedIndex];
      const departmentId = selectedOption.getAttribute('data-category-id');
      fillSpecializationsDropdown(selectedDoctorId, departmentId);
    });

    // Trigger initial department load and specialization based on the first doctor
    const initialDepartmentId = doctorDropdown.options[doctorDropdown.selectedIndex].getAttribute('data-category-id');
    fillSpecializationsDropdown(doctors[0].ID_Doctor, initialDepartmentId); // Load specialization for the first doctor
  } catch (error) {
    console.error('Ошибка заполнения данных о врачах:', error);
  }
}


async function fillSpecializationsDropdown(doctorId, departmentId) {
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
      option.value = specialization;
      option.text = `${specialization} (${departmentId})`; 
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
      const selectedTimeSlotId = this.value;
      timeDropdown.innerHTML = '';
      await fillTimeSlotsDropdown(); 
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
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('http://localhost:3001/patients');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных о пациентах');
      }
      const patients = await response.json();
      const inputDate = document.getElementById('selectedDate');
      const currentDate = new Date(); // Получаем текущую дату
      const currentMonth = currentDate.getMonth() + 1; // Получаем текущий месяц
      const currentDay = currentDate.getDate(); // Получаем текущий день
  
      // Формируем строку для текущей даты в формате YYYY-MM-DD
      const formattedCurrentDate = `${currentDate.getFullYear()}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      
      // Устанавливаем текущую дату в качестве значения по умолчанию для поля выбора даты
      inputDate.value = formattedCurrentDate;
  
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
        const selectedTimeSlotId = document.getElementById('time').value;
        const selectedDate = document.getElementById('selectedDate').value;
    
        const responseAppointments = await fetchAppointments();
        const existingAppointment = responseAppointments.find(appointment =>
          appointment.Doctor_ID === selectedDoctorId &&
          appointment.Date_of_Appointment === selectedDate &&
          appointment.TimeSlot_ID === selectedTimeSlotId
        );
    
        if (existingAppointment) {
          alert('Данная дата и время заняты у выбранного врача. Пожалуйста, выберите другую дату или время.');
        } else {
          // Код для добавления новой записи на прием
          const response = await fetch('http://localhost:3001/appointments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Doctor_ID: selectedDoctorId,
              Patient_ID: selectedPatientId,
              TimeSlot_ID: parseInt(selectedTimeSlotId),
              Date_of_Appointment: selectedDate,
            }),
          });
    
          if (response.ok) {
            alert('Запись успешно добавлена');
            window.location.reload(); // Reload the page after adding an 
          } else {
            throw new Error('Ошибка при добавлении записи');
          }
        }
      } catch (error) {
        console.error('Ошибка при добавлении записи:', error);
        alert('Произошла ошибка при добавлении записи');
      }
    });
    
  }),
  
  window.onload = function () {
    fillDoctorsDropdown();
    fillTimeSlotsDropdown();    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keyup', searchPatients);
    }
  };
  
  