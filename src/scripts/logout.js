document.addEventListener('DOMContentLoaded', function() {
    const signOutLink = document.getElementById('signOut');
    const userId = localStorage.getItem('userId');
  
    if (userId) {
      signOutLink.textContent = 'Выход'; 
      signOutLink.href = '#'; 
      signOutLink.addEventListener('click', async function(event) {
        event.preventDefault();
  
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            console.error('Refresh token not found');
            return;
          }
  
          const userId = localStorage.getItem('userId');
          if (!userId) {
            console.error('User ID not found');
            return;
          }
  
          const response = await fetch('http://localhost:3001/logout', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: refreshToken,
              userId: userId
            })
          });
  
          if (response.ok) {
            console.log('Logged out successfully');
  
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            window.location.href = '/public/index.html'; 
          } else {
            console.error('Failed to log out:', response.status);
          }
        } catch (error) {
          console.error('Failed to log out:', error);
        }
      });
    } else {
     
      signOutLink.textContent = 'Вход';
      signOutLink.href = '/public/Authorization.html';
    }
  });
  