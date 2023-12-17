document.addEventListener('DOMContentLoaded', () => {  
    const form = document.querySelector('form');
    const phoneNumbers = []; // Хранение номеров телефонов
    function isPhoneNumberUnique(phoneNumber) {
      return !phoneNumbers.includes(phoneNumber);
    }
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const surname = document.getElementById('surname').value;
      const name = document.getElementById('name').value;
      const middle = document.getElementById('middle').value;
      const dob = document.getElementById('dob').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
  
      try {
        const response = await fetch('http://localhost:3001/addPatient', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            surname,
            name,
            middle,
            dob,
            phone,
            address,
          }),
        });
        const phoneNumber = patient.Phone_number; // Предположим, номер телефона хранится в поле 'Phone_number'

        //  уникальность номера телефона перед добавлением в карточку
        if (isPhoneNumberUnique(phoneNumber)) {
          phoneNumbers.push(phoneNumber); // Добавляем номер
          allCards.push(card); // Добавляем карточку в общий список
        }
        if (!response.ok) {
          const errorMessage = await response.text();
          if (response.status === 400) {
            alert(errorMessage); // Показать ошибку в случае неверных данных
          } else {
            throw new Error('Ошибка сервера');
          }
        } else {
          const successMessage = await response.text();
          alert(successMessage); // Показать успешное сообщение
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при добавлении пациента. Сработал триггер "tr_check_date_of_birth"');
      }
    });
  });
  