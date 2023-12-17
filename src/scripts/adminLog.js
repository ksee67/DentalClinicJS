// Получаем ссылку на tbody в таблице
const roleChangeLogBody = document.getElementById('roleChangeLogBody');

// Маппинг для соответствия ролям
const roleMapping = {
  1: 'Стоматолог',
  2: 'Администратор',
  3: 'Регистратор'
};

// Функция для получения ФИО по user_id
function fetchUserName(userId) {
  return fetch(`http://localhost:3001/user/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(userData => {
      return `${userData.name} ${userData.surname}`;
    })
    .catch(error => {
      console.error('Ошибка получения данных пользователя:', error);
      return 'Неизвестно'; // В случае ошибки вернем "Неизвестно" для ФИО
    });
}

fetch('http://localhost:3001/roleChangeLog')
  .then(response => response.json())
  .then(data => {
    // Очищаем содержимое tbody перед вставкой новых данных
    roleChangeLogBody.innerHTML = '';

    if (data.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.textContent = 'Изменений нет';
      emptyCell.colSpan = 3; // Занимает все столбцы
      emptyRow.appendChild(emptyCell);
      roleChangeLogBody.appendChild(emptyRow);
    } else {
      Promise.all(data.map(entry => fetchUserName(entry.user_id)))
        .then(userNames => {
          data.forEach((entry, index) => {
            const row = document.createElement('tr');

            const userFullNameCell = document.createElement('td');
            const userName = userNames[index].replace('undefined', '').trim(); // Удаление 'undefined' из строки ФИО
            userFullNameCell.textContent = userName;
            row.appendChild(userFullNameCell);

            const descriptionCell = document.createElement('td');

            const roleRegex = /Роль изменена на (\d+)/;
            const toRole = entry.description.match(roleRegex)[1];

            const toRoleText = roleMapping[toRole] || 'Неизвестно';

            descriptionCell.textContent = `Изменена роль на ${toRoleText}`;
            row.appendChild(descriptionCell);

            const timestampCell = document.createElement('td');
            timestampCell.textContent = entry.timestamp;
            row.appendChild(timestampCell);

            // Вставляем созданную строку в tbody
            roleChangeLogBody.appendChild(row);
          });
        })
        .catch(error => {
          console.error('Ошибка получения данных:', error);
        });
    }
  })
  .catch(error => {
    console.error('Ошибка получения данных:', error);
    // Обработка ошибок, если запрос не удался
  });
