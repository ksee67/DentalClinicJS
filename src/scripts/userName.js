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
          currentUserElement.innerText = `${userName}, встречая пациентов с улыбкой и от всего сердца в стоматологии  создает доверие, уменьшает стресс и болезненные ощущения, способствует позитивному опыту и укрепляет  отношения пациента со стоматологом.`;
        })
        .catch(error => {
          console.error('Проблема с получением данных пользователя:', error);
        });
    }
  });
  