 // Функция для заполнения таблицы данными
 function fillTableWithData(data) {
    const tableBody = document.querySelector('#appointmentsTable tbody');
    tableBody.innerHTML = '';
    data.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.id}</td>
        <td>${record.Date_of_Appointment}</td>
        <td>${record.Doctor_ID}</td>
        <td>${record.Patient_ID}</td>
        <td>${record.TimeSlot_ID}</td>
        <td>
          <button onclick="fillUpdateForm(${record.id},'${record.Date_of_Appointment}','${record.Doctor_ID}','${record.Patient_ID}','${record.TimeSlot_ID}')">Изменить</button>
          <button onclick="deleteRecord(${record.id})">Удалить</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Функция для заполнения формы изменения данными выбранной записи
  function fillUpdateForm(id, date, doctorID, patientID, timeSlotID) {
    document.getElementById('updateDate').value = date;
    document.getElementById('updateDoctorID').value = doctorID;
    document.getElementById('updatePatientID').value = patientID;
    document.getElementById('updateTimeSlotID').value = timeSlotID;
    document.getElementById('deleteID').value = id;
  }

  // Функция для отправки запроса на удаление записи
  function deleteRecord(id) {
    const confirmation = confirm('Вы уверены, что хотите удалить запись с ID ' + id + '?');
    if (confirmation) {
      fetch(`/appointments/${id}`, {
        method: 'DELETE'
      })
      .then(response => response.text())
      .then(message => {
        alert(message);
        location.reload(); // Перезагрузка страницы после удаления
      })
      .catch(error => console.error('Ошибка:', error));
    }
  }

  // Получение данных и заполнение таблицы при загрузке страницы
  fetch('/appointments')
    .then(response => response.json())
    .then(data => fillTableWithData(data))
    .catch(error => console.error('Ошибка:', error));

  // Обработка отправки формы обновления записи
  document.getElementById('updateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const id = document.getElementById('deleteID').value;
    const formData = new FormData(this);
    fetch(`/appointments/${id}`, {
      method: 'PUT',
      body: formData
    })
    .then(response => response.text())
    .then(message => {
      alert(message);
      location.reload(); // Перезагрузка страницы после обновления
    })
    .catch(error => console.error('Ошибка:', error));
  });

  // Обработка отправки формы удаления записи
  document.getElementById('deleteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const id = document.getElementById('deleteID').value;
    deleteRecord(id);
  });