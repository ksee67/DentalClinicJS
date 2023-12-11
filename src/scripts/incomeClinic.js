function formatDateString(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) {
    return null; // Возвращаем null, если входная строка не является корректной датой
  }
  const formattedDate = date.toISOString().split('T')[0];
  return formattedDate;
}
fetch('http://localhost:3001/payments1')
  .then(response => response.json())
  .then(data => {
    const table = document.createElement('table');
    table.border = '1';

    const headersMap = {
      Date_payment: 'Дата платежа',
      Service_name: 'Наименование услуги',
      Price: 'Цена, руб',
      Registrar_name: 'Имя регистратора',
      Patient_name: 'Имя пациента'
    };

    const headers = Object.keys(data[0]).filter(header => header !== 'ID_Payment');
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
      const header = document.createElement('th');
      header.textContent = headersMap[headerText] || headerText;
      headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    data.forEach(record => {
      const row = document.createElement('tr');
      headers.forEach(headerText => {
        const cell = document.createElement('td');
        if (headerText === 'Date_payment') {
          const dateValue = record[headerText].split('T')[0];
          cell.textContent = dateValue;
        } else {
          cell.textContent = record[headerText];
        }
        row.appendChild(cell);
      });
      table.appendChild(row);
    });

    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer) {
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
    } else {
      console.error("Элемент 'tableContainer' не найден.");
    }
  })
  .catch(error => console.error('Ошибка получения данных о платежах:', error));

// Создание графика
let myChart;

function generateChart(data) {
  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById('paymentChart').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      // Настройки графика
    }
  });
}

function generateStatistics(startDate = null, endDate = null) {
  fetch('http://localhost:3001/payments1')
    .then(response => response.json())
    .then(data => {
      const today = new Date().toISOString().split('T')[0];

      const filteredData = data.filter(record => {
        const date = new Date(record.Date_payment);
        const recordDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

        return (!startDate || date >= new Date(startDate)) &&
               (!endDate || date <= new Date(endDate)) &&
               recordDate <= today;
      });

      const paymentData = {};

      filteredData.forEach(record => {
        const date = formatDateString(record.Date_payment);

        if (!paymentData[date]) {
          paymentData[date] = {
            totalPrices: 0,
            count: 0
          };
        }

        paymentData[date].totalPrices += record.Price;
        paymentData[date].count++;
      });

      const labels = Object.keys(paymentData);
      const totalPrices = labels.map(date => paymentData[date].totalPrices);
      const counts = labels.map(date => paymentData[date].count);


      const ctx = document.getElementById('paymentChart').getContext('2d');
      let existingChart = window.paymentChart;

      if (existingChart instanceof Chart) {
        existingChart.destroy();
      }

      window.paymentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Сумма платежей',
              data: totalPrices,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: 'Количество платежей',
              data: counts,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
    .catch(error => console.error('Ошибка получения данных о платежах:', error));
}

// Обработчик события  за год
document.getElementById('yearlyButton').addEventListener('click', () => {
  const currentDate = new Date();
  const endDate = new Date(); // Сегодняшняя дата
  const startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
  generateStatistics(startDate, endDate);
});

function getLastMonthDate() {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setMonth(currentDate.getMonth() - 1);
  return startDate;
}

function getLastWeekDates() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7 + 1);

  return { startDate, endDate };
}

// Вызов функции для последнего месяца
document.getElementById('monthlyButton').addEventListener('click', () => {
  const endDate = new Date();
  const startDate = getLastMonthDate();

  generateStatistics(startDate, endDate);
});

// Вызов функции для последней недели
document.getElementById('weeklyButton').addEventListener('click', () => {
  const { startDate, endDate } = getLastWeekDates();

  generateStatistics(startDate, endDate);
});
