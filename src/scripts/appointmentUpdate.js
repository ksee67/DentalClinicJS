document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('id'); // Получаем параметр ID из URL
  
    fetch(`http://localhost:3001/appointments/${appointmentId}`)
      .then(response => response.json())
      .then(appointmentData => {
        document.getElementById('doctor').value = appointmentData.Doctor_ID;
        document.getElementById('selectedDate').value = appointmentData.Date_of_Appointment;
        document.getElementById('patient').value = appointmentData.Patient_ID;
        document.getElementById('timeslots').value = appointmentData.TimeSlot_ID;
        // Другие поля и их заполнение
      })
      .catch(error => console.error('Ошибка получения данных о записи:', error));
  
    // После того как данные загружены, добавляем обработчики на кнопки "Изменить" и "Удалить"
    document.getElementById('editButton').addEventListener('click', () => {
      // Запрос на сервер для изменения записи
    });
  
    document.getElementById('deleteButton').addEventListener('click', () => {
      const confirmation = confirm('Вы уверены, что хотите удалить запись?');
      if (confirmation) {
        // Запрос на сервер для удаления записи
      }
    });
  });
  