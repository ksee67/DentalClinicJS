// Запрос для получения ролей
fetch('http://localhost:3001/roles')
  .then(response => response.json())
  .then(data => {
    const roleSelect = document.getElementById('role');
    data.forEach(role => {
      const option = document.createElement('option');
      option.value = role.Role;
      option.text = role.Role;
      roleSelect.appendChild(option);
    });
  })
  .catch(error => console.error('Ошибка получения ролей:', error));

// Запрос для получения пользователей
fetch('http://localhost:3001/users')
  .then(response => response.json())
  .then(data => {
    const userSelect = document.getElementById('user');
    data.forEach(user => {
      if (user.FullName) { // Проверка на null
        const option = document.createElement('option');
        option.value = user.FullName;
        option.text = user.FullName;
        userSelect.appendChild(option);
      }
    });
  })
  .catch(error => console.error('Ошибка получения пользователей:', error));
  // Функция для получения пользователей с сервера
function getUsersFromServer() {
    fetch('http://localhost:3001/users')
      .then(response => response.json())
      .then(usersData => {
        const searchInput = document.getElementById('searchUser');
        const userSelect = document.getElementById('user');
  
        searchInput.addEventListener('input', (event) => {
          const searchText = event.target.value.toLowerCase();
  
          userSelect.innerHTML = '';
          
          usersData.forEach(user => {
            if (user.FullName && user.FullName.toLowerCase().includes(searchText)) {
              const option = document.createElement('option');
              option.value = user.FullName;
              option.text = user.FullName;
              userSelect.appendChild(option);
            }
          });
        });
      })
      .catch(error => console.error('Ошибка получения пользователей:', error));
  }
  
  getUsersFromServer();
  
// Находим поле для ввода поиска и селект с пользователями
const searchInput = document.getElementById('searchUser');
const userSelect = document.getElementById('user');

// Обработчик события ввода в поле поиска
searchInput.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase(); // Получаем текст для поиска и приводим к нижнему регистру
    userSelect.innerHTML = ''; // Очищаем селект перед добавлением найденных элементов
  
    // Получение пользователей с сервера
    fetch('http://localhost:3001/users')
      .then(response => response.json())
      .then(usersData => {
        let found = false; // Переменная для отслеживания наличия результатов
  
        // Фильтрация пользователей по введенному тексту и добавление соответствующих опций в селект
        usersData.forEach(user => {
          if (user.FullName && user.FullName.toLowerCase().includes(searchText)) {
            const option = document.createElement('option');
            option.value = user.FullName;
            option.text = user.FullName;
            userSelect.appendChild(option);
            found = true; // Найдены результаты
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
  document.getElementById('updateButton').addEventListener('click', () => {
    const selectedUser = document.getElementById('user').value;
    const selectedRole = document.getElementById('role').value;
  
    if (selectedUser && selectedRole) {
      // Отправка PUT-запроса на сервер для обновления роли у выбранного пользователя
      fetch(`http://localhost:3001/user/${selectedUser}/role/${selectedRole}`, {
        method: 'PUT',
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.message); // Отображение сообщения об успешном обновлении роли
        })
        .catch(error => console.error('Ошибка обновления роли:', error));
    } else {
      console.error('Пожалуйста, выберите пользователя и роль для обновления.');
    }
  });
  