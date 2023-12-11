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
  const diagnosis = params.get('diagnosis');

  diagnosisSelect.value = diagnosis || '';

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
      Patient_ID: patientId
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
    table.style.maxWidth = '760px';

    const tableHeader = `
      <tr>
        <th>Начало лечения</th>
        <th>Окончание лечения</th>
        <th>Назначенное лечение</th>
        <th>Примечания</th>
        <th>Диагнoз</th>
        <th>Действия</th>
      </tr>
    `;
    table.innerHTML += tableHeader;

    const exportButton = document.createElement('button');
    exportButton.textContent = 'Экспорт в Excel';
    exportButton.classList.add('login-button', 'export-button');
    const exportButtonSQL = document.createElement('button');
    exportButtonSQL.textContent = 'Экспорт в SQL';
    exportButtonSQL.classList.add('login-button', 'export-button');
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons-container');
    buttonsContainer.appendChild(exportButton);
    buttonsContainer.appendChild(exportButtonSQL);

    dataWindow.appendChild(buttonsContainer);
    dataWindow.appendChild(table);

    const exportData = []; //  для хранения данных для экспорта

    for (const history of medicalHistoryData) {
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

          const editButton = createEditButton(history, fullName, diagnosis);
          const deleteButton = createDeleteButton(history);

          const editCell = document.createElement('td');
          editCell.appendChild(editButton);

          const deleteCell = document.createElement('td');
          deleteCell.appendChild(deleteButton);

          row.appendChild(editCell);
          row.appendChild(deleteCell);

          table.appendChild(row);

          const exportItem = {
            'Пациент': fullName, // внешн ключ
            'Начало лечения': formatDate(history.Start_date),
            'Окончание лечения': history.End_date ? formatDate(history.End_date) : 'Не указано',
            'Назначенное лечение': history.Treatment,
            'Примечания': history.Notes,
            'Диагноз': diagnosisData.Diagnosis_name
          };

          exportData.push(exportItem); // Добавляем объект в массив для экспорта SQL
        } catch (error) {
          console.error('Ошибка при получении данных о диагнозе:', error);
        }
      }
    }
    exportButtonSQL.addEventListener('click', () => {
      exportToSQL(exportData, fullName); // Вызываем функцию экспорта в SQL
    });

    exportButton.addEventListener('click', () => {
      exportToExcel(exportData, fullName); // Вызываем функцию экспорта в Excel
    });

  } catch (error) {
    console.error('Ошибка при получении медицинской истории:', error);
  }

  // Получаем кнопку обновления
  const refreshButton = document.getElementById('refreshButton');

  // Добавляем обработчик события 'click' для кнопки
  refreshButton.addEventListener('click', () => {
    location.reload();
  });
});

function createEditButton(history, fullName) {
  const editButton = document.createElement('button');
  editButton.textContent = 'Изменить';
  editButton.classList.add('login-button', 'edit-button');

  editButton.addEventListener('click', async () => {
    try {
      const medicalHistoryId = history.ID_Medical_history;
      const patientId = history.Patient_ID;
      const diagnosisId = history.Diagnosis_ID;

      const diagnosisResponse = await fetch(`http://localhost:3001/diagnosis/${diagnosisId}`);
      if (!diagnosisResponse.ok) {
        throw new Error('Ошибка при получении данных о диагнозе');
      }
      const diagnosisData = await diagnosisResponse.json();

      const diagnosisName = diagnosisData.Diagnosis_name; 
      window.location.href = `MedicalHistoryEdit.html?id=${medicalHistoryId}&patientId=${patientId}&fullName=${encodeURIComponent(fullName)}&diagnosisId=${diagnosisId}&diagnosis=${encodeURIComponent(diagnosisName)}&start_date=${history.Start_date}&end_date=${history.End_date}&treatment=${history.Treatment}&notes=${encodeURIComponent(history.Notes)}&searchDiagnosis=`;
    } catch (error) {
      console.error('Ошибка при получении данных о диагнозе:', error);
    }
  });

  return editButton;
}

function createDeleteButton(history) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить';
  deleteButton.classList.add('login-button', 'delete-button');
  deleteButton.addEventListener('click', () => {
    if (history.ID_Medical_history) {
      deleteHistory(history); // Передача объекта history
    } else {
      console.error('ID записи не найден');
    }
  });
  return deleteButton;
}

// Функция для удаления записи
async function deleteHistory(history) {
  const confirmDelete = confirm('Уверены, что хотите удалить запись?');
  if (confirmDelete) {
    try {
      const response = await fetch(`http://localhost:3001/medicalHistory/delete/${history.ID_Medical_history}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Ошибка при удалении записи');
      }
      alert('Запись успешно удалена');
      // Перезагрузка страницы после удаления
      location.reload();
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
    }
  }
}

// Функция для форматирования даты в нужный вид (YYYY-MM-DD)
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function exportToSQL(data, fullName) {
  let sqlScript = `-- SQL скрипт для экспорта истории болезни of ${fullName}\n\n`;

  const columnMapping = {
    'Пациент': 'Patient',
    'Начало лечения': 'Start_date',
    'Окончание лечения': 'End_date',
    'Назначенное лечение': 'Treatment',
    'Примечания': 'Notes',
    'Диагноз': 'Diagnosis'
  };

  data.forEach(item => {
    // Переименование столбцов с использованием английских названий
    const renamedItem = {};
    Object.keys(item).forEach(key => {
      renamedItem[columnMapping[key]] = item[key];
    });

    const columns = Object.keys(renamedItem).join(', ');
    const values = Object.values(renamedItem).map(val => typeof val === 'string' ? `'${val}'` : val).join(', ');

    const insertQuery = `INSERT INTO medical_history (${columns}) VALUES (${values});\n`;
    sqlScript += insertQuery;
  });

  // Создание ссылки для скачивания SQL-скрипта
  const sqlContent = 'data:text/sql;charset=utf-8,' + encodeURIComponent(sqlScript);
  const link = document.createElement('a');
  link.setAttribute('href', sqlContent);
  link.setAttribute('download', `export_${fullName}_medical_history.sql`);
  document.body.appendChild(link);
  link.click();
  }
  
function exportToExcel(data, fullName) {
  const worksheet = XLSX.utils.json_to_sheet(data); // Преобразуем данные в объект рабочего листа Excel
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Медицинская карта');
  const fileName = `Медицинская карта ${fullName}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
document.getElementById('uploadButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('excelFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Выберите файл для загрузки');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3001/import-medical-history', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Ошибка при импорте данных');
    }

    const result = await response.text();
    alert(result); // Изменили здесь
  } catch (error) {
    console.error('Ошибка при отправке запроса:', error);
  }
});

