document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); 

  const formData = new FormData(this);
  const data = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  fetch('http://localhost:4000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log("Ответ сервера:", data);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userId', data.id); 
    console.log('Tokens сохранены:', data.accessToken, data.refreshToken);
    window.location.href = '../public/index.html';
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error); 
  });  
});
