document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращает стандартное поведение отправки формы
  
    const formData = new FormData(this); // Создает объект FormData из данных формы
  
    fetch('http://localhost:4000/register', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      // Ваши действия при успешной отправке формы
    })
    .catch(error => {
      console.error('Error:', error);
      // Ваши действия при ошибке отправки формы
    });
  });
  