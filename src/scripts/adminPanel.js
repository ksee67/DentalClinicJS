document.addEventListener('DOMContentLoaded', function() {
    const currentUserElement = document.getElementById('currentUser');
    const userId = localStorage.getItem('userId');
  
    if (currentUserElement && userId) {
      const userIdInt = parseInt(userId, 10);
  
      fetch(`http://localhost:3001/user/${userIdInt}`) 
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(userData => {
          console.log('Данные пользователя:', userData);
          const userName = userData.name;
          currentUserElement.innerText = `Уважаемый, администратор - ${userName}.`;
        })
        .catch(error => {
          console.error('Проблема с получением данных пользователя:', error);
        });
    }
  });
  const backupButton = document.getElementById('backupButton');

  backupButton.addEventListener('click', () => {   
     fetch('http://localhost:3001/downloadBackup')
    .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Ошибка скачивания резервной копии');
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup.sql'; // Имя файла резервной копии
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .catch(error => {
        console.error('Произошла ошибка:', error);
        // Обработка ошибок
      });
  });