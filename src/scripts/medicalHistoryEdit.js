window.addEventListener('DOMContentLoaded', async () => {
  let updateButton;
  let medicalHistoryId;
  let params;

  function formatDate(dateString) {
    if (!dateString) return '';
    const dateObject = new Date(dateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  try {
    params = new URLSearchParams(window.location.search);

    const start_date = params.get('start_date');
    const end_date = params.get('end_date');
    const treatment = params.get('treatment');
    const notes = params.get('notes');
    const diagnosisName = params.get('diagnosis');
    updateButton = document.getElementById('updateButton');
    const diagnosis = params.get('diagnosis');

    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const treatmentInput = document.getElementById('treatment');
    const notesInput = document.getElementById('notes');
    const diagnosisSelect = document.getElementById('diagnosis');
    medicalHistoryId = params.get('id');

    startDateInput.value = formatDate(start_date);
    endDateInput.value = formatDate(end_date);
    treatmentInput.value = treatment || '';
    notesInput.value = notes || '';
    diagnosisSelect.value = diagnosis || '';

    const diagnosisResponse = await fetch(`http://localhost:3001/diagnosis?name=${diagnosisName}`);
    if (!diagnosisResponse.ok) {
      throw new Error('Ошибка при получении данных о диагнозе');
    }
    const diagnosisData = await diagnosisResponse.json();
    const diagnosisId = diagnosisData.id;

    // Проверяем, есть ли уже опция с таким значением в списке
    const existingOption = Array.from(diagnosisSelect.options).find(
      option => option.value === diagnosisId
    );

    // Если опции с таким значением нет, добавляем новую опцию
    if (!existingOption) {
      const option = document.createElement('option');
      option.value = diagnosisId;
      option.textContent = diagnosisName;
      diagnosisSelect.appendChild(option);
    }

    diagnosisSelect.value = diagnosisId;

    updateButton.addEventListener('click', () => {
      medicalHistoryId = params.get('id');
      const startDateInput = document.getElementById('start_date');
      const endDateInput = document.getElementById('end_date');
      const treatmentInput = document.getElementById('treatment');
      const notesInput = document.getElementById('notes');
      const startDate = startDateInput.value;
      const endDate = endDateInput.value || null;
      const treatment = treatmentInput.value;
      const notes = notesInput.value;
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const diagnosisId = urlParams.get('diagnosisId');
      console.log('Измененный id:', medicalHistoryId);
      console.log('Измененный Diagnosis ID:', diagnosisId);
      console.log('Измененный Start Date:', startDate);
      console.log('Измененный End Date:', endDate);
      console.log('Измененный Treatment:', treatment);
      console.log('Измененный Notes:', notes);
      const requestData = {
        Start_date: startDate,
        End_date: endDate,
        Treatment: treatment,
        Notes: notes,
        Diagnosis_ID: diagnosisId
      };

      const confirmUpdate = confirm('Вы уверены, что хотите изменить запись?');
      if (confirmUpdate) {
        fetch(`http://localhost:3001/medicalhistory/${medicalHistoryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Ошибка при изменении записи в базе данных');
            }
            // Проверяем тип ответа
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return response.json(); // Если ответ JSON, парсим его
            } else {
              return response.text(); // Если не JSON, возвращаем как текст
            }
          })
          .then(data => {
            // Добавьте обработку данных в зависимости от типа ответа
            if (typeof data === 'object') {
              const returnBack = confirm('Запись успешно изменена. Желаете вернуться назад?');
              if (returnBack) {
                window.history.back();
              }
            } else {
              console.log('Текстовый ответ:', data);
              const returnBack = confirm('Запись успешно изменена. Желаете вернуться назад?');
              if (returnBack) {
                window.history.back();
              }
            }
          })
          .catch(error => {
            console.error('Ошибка при отправке запроса:', error);
            alert('Ошибка при изменении записи в базе данных');
          });          
      }
    });
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
});
