fetch('http://localhost:3001/users')
  .then(response => response.json())
  .then(data => {
    const userSelect = document.getElementById('user');
    userSelect.innerHTML = '';
    data.forEach(user => {
      const option = document.createElement('option');
      option.value = user.ID_User;
      option.text = `${user.FullName} - ${user.Post_name}`; // Комбинация имени пользователя и должности
      userSelect.appendChild(option);
    });
  })
  .catch(error => console.error('Ошибка получения пользователей:', error));
const searchInput = document.getElementById('searchUser');
const userSelect = document.getElementById('user');

searchInput.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase(); // Получаем текст для поиска и приводим к нижнему регистру
    userSelect.innerHTML = ''; // Очищаем селект перед добавлением найденных элементов

    fetch('http://localhost:3001/users')
      .then(response => response.json())
      .then(usersData => {
        let found = false;

        usersData.forEach(user => {
          if (user.FullName.toLowerCase().includes(searchText)) {
            const option = document.createElement('option');
            option.value = user.ID_User;
            option.text = `${user.FullName} - ${user.Post_name}`; // Комбинация имени пользователя и должности
            userSelect.appendChild(option);
            found = true; 
          }
        });

        // Отображаем "Не найдено", если результаты не найдены
        if (!found) {
          const option = document.createElement('option');
          option.text = 'Не найдено';
          option.disabled = true;
          userSelect.appendChild(option);
        }
      })
      .catch(error => console.error('Ошибка получения пользователей:', error));
});

fetch('http://localhost:3001/roles')
  .then(response => response.json())
  .then(data => {
    const roleSelect = document.getElementById('role');
    roleSelect.innerHTML = ''; //  новых элементов
    data.forEach(role => {
      const option = document.createElement('option');
      option.value = role.ID_Post; 
      option.text = role.Post_name; 
      roleSelect.appendChild(option);
    });
  })
  .catch(error => console.error('Ошибка получения ролей:', error));

document.getElementById('updateButton').addEventListener('click', () => {
  const selectedUserId = document.getElementById('user').value;
  const selectedRoleId = document.getElementById('role').value;

  fetch(`http://localhost:3001/user/${selectedUserId}/role/${selectedRoleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Ошибка обновления роли');
    })
    .then(data => {
      alert(data.message); // Оповещение об успешном обновлении роли
      location.reload(); // Обновление страницы
    })
    .catch(error => console.error('Ошибка обновления роли:', error.message));
});