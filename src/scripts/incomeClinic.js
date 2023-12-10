// Получение данных о платежах
fetch('http://localhost:3001/payments')
  .then(response => response.json())
  .then(data => {
    // Создание HTML таблицы
    const table = document.createElement('table');
    table.border = '1';

    // Создание заголовка таблицы
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
      const header = document.createElement('th');
      header.textContent = headerText;
      headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    // Добавление данных в таблицу
    data.forEach(record => {
      const row = document.createElement('tr');
      headers.forEach(headerText => {
        const cell = document.createElement('td');
        cell.textContent = record[headerText];
        row.appendChild(cell);
      });
      table.appendChild(row);
    });

    // Вставка таблицы в элемент с id="paymentsTable"
    const tableContainer = document.getElementById('paymentsTable');
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
  })
  .catch(error => console.error('Ошибка получения данных о платежах:', error));
