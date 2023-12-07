window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const patientId = params.get('id');
    const fullName = params.get('fullName');
    const addButton = document.getElementById('addButton');
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const treatmentInput = document.getElementById('treatment');
    const notesInput = document.getElementById('notes');
    const diagnosisSelect = document.getElementById('diagnosis');
    const searchDiagnosisInput = document.getElementById('searchDiagnosis');
  
    // Функция для получения списка диагнозов
    async function fetchDiagnoses() {
      try {
        const response = await fetch('http://localhost:3001/diagnosis');
        if (!response.ok) {
          throw new Error('Ошибка при получении данных о диагнозах');
        }
        const diagnoses = await response.json();
  
        diagnoses.forEach(diagnosis => {
          const option = document.createElement('option');
          option.value = diagnosis.ID_Diagnosis;
          option.textContent = diagnosis.Diagnosis_name;
          diagnosisSelect.appendChild(option);
          
        });
      } catch (error) {
        console.error('Ошибка при получении данных о диагнозах:', error);
      }
    }
  
    fetchDiagnoses(); // Запускаем получение данных о диагнозах
  
    // Обработчик события для ввода поиска по диагнозу
    let searchTimeout;

    searchDiagnosisInput.addEventListener('input', async () => {
      clearTimeout(searchTimeout); // Очистить предыдущий таймер
    
      searchTimeout = setTimeout(async () => {
        const searchText = searchDiagnosisInput.value.toLowerCase().trim();
        diagnosisSelect.innerHTML = '';
    
        try {
          const response = await fetch('http://localhost:3001/diagnosis');
          if (!response.ok) {
            throw new Error('Ошибка при получении данных о диагнозах');
          }
          const diagnoses = await response.json();
          let found = false;
    
          diagnoses.forEach(diagnosis => {
            const diagnosisName = diagnosis.Diagnosis_name.toLowerCase();
            if (diagnosisName.includes(searchText)) {
              const option = document.createElement('option');
              option.value = diagnosis.ID_Diagnosis;
              option.textContent = diagnosis.Diagnosis_name;
              diagnosisSelect.appendChild(option);
              found = true;
            }
          });
    
          if (!found) {
            const option = document.createElement('option');
            option.textContent = 'Диагноз не найден';
            diagnosisSelect.appendChild(option);
          }
        } catch (error) {
          console.error('Ошибка при получении данных о диагнозах:', error);
        }
      }, 300); // Устанавливаем задержку в 300 миллисекунд
    });
    
    if (patientId && fullName) {
      const patientSelect = document.getElementById('patient');
      const option = document.createElement('option');
      option.value = patientId;
      option.textContent = fullName;
      patientSelect.appendChild(option);
    }
  
    addButton.addEventListener('click', async () => {
      const startDate = startDateInput.value;
      const endDate = endDateInput.value || null; // Добавление проверки на пустую дату
      const treatment = treatmentInput.value;
      const notes = notesInput.value;
      const diagnosisId = diagnosisSelect.value;

      const requestData = {
        Start_date: startDate,
        End_date: endDate,
        Treatment: treatment,
        Notes: notes,
        Diagnosis_ID: diagnosisId,
        Patient_ID: patientId // Добавляем ID пациента

      };
  
      try {
        const response = await fetch('http://localhost:3001/medicalHistory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
      
        if (!response.ok) {
          throw new Error('Ошибка при добавлении записи в базу данных');
        }
      
        alert('Запись успешно добавлена');
      } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
      }
      
    });
  });
  window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const patientId = params.get('id');
    const dataWindow = document.querySelector('.data-window');
  const table = document.createElement('table');
    try {
      const response = await fetch(`http://localhost:3001/medicalHistory?patientId=${patientId}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении медицинской истории');
      }
      const medicalHistoryData = await response.json();
  
      const dataWindow = document.querySelector('.data-window');
  
      const table = document.createElement('table');
      table.classList.add('medical-history-table');
      table.style.width = '100%';
      table.style.maxWidth = '600px';
  
      const tableHeader = `
        <tr>
          <th>Начало лечения</th>
          <th>Окончание лечения</th>
          <th>Назначенное лечение</th>
          <th>Примечания</th>
          <th>ID Диагноза</th>
        </tr>
      `;
      table.innerHTML += tableHeader;
  
      // Функция для форматирования даты в нужный вид (YYYY-MM-DD)
      function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      const editButton = document.createElement('button');
      editButton.textContent = 'Изменить';
      editButton.classList.add('edit-button');
    
      const exportButton = document.createElement('button');
      exportButton.textContent = 'Экспорт в Excel';
      exportButton.classList.add('export-button');
    
      const buttonsContainer = document.createElement('div');
      buttonsContainer.classList.add('buttons-container');
      buttonsContainer.appendChild(editButton);
      buttonsContainer.appendChild(exportButton);
    
      // Добавляем кнопки перед заполнением таблицы
      dataWindow.appendChild(buttonsContainer);
      dataWindow.appendChild(table);
      medicalHistoryData.forEach(async history => {
        if (history.Patient_ID === parseInt(patientId)) {
          const row = document.createElement('tr');
          const diagnosisId = history.Diagnosis_ID;
  
          try {
            const diagnosisResponse = await fetch(`http://localhost:3001/diagnosis/${diagnosisId}`);
            if (!diagnosisResponse.ok) {
              throw new Error('Ошибка при получении данных о диагнозе');
            }
            const diagnosisData = await diagnosisResponse.json();
  
            row.innerHTML = `
              <td>${formatDate(history.Start_date)}</td>
              <td>${history.End_date ? formatDate(history.End_date) : 'Не указано'}</td>
              <td>${history.Treatment}</td>
              <td>${history.Notes}</td>
              <td>${diagnosisData.Diagnosis_name}</td>
            `;
            table.appendChild(row);
          } catch (error) {
            console.error('Ошибка при получении данных о диагнозе:', error);
          }
        }
      });
      dataWindow.innerHTML = '';
      dataWindow.appendChild(table);
    } catch (error) {
      console.error('Ошибка при получении медицинской истории:', error);
    }
  });
  // Получаем кнопку обновления
const refreshButton = document.getElementById('refreshButton');

// Добавляем обработчик события 'click' для кнопки
refreshButton.addEventListener('click', () => {
  // Перезагружаем страницу
  location.reload();
});

  