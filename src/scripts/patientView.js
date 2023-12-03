window.addEventListener('DOMContentLoaded', async () => {
    const patientInput = document.querySelector('input[placeholder="Поиск по ФИО пациента"]');
    const cards = document.querySelectorAll('.card');
    const searchButton = document.getElementById('searchButton');

    function filterByPatientName() {
        const searchText = patientInput.value.toLowerCase().trim();

        cards.forEach(card => {
            const patientInfo = card.querySelector('.patient-info');
            const fullNameElement = patientInfo.querySelector('h2');

            if (fullNameElement) {
                const fullName = fullNameElement.textContent.toLowerCase();
                const names = fullName.split(' ');
                const shouldShowCard = names.some(name => name.includes(searchText));

                card.style.display = shouldShowCard ? 'block' : 'none';
            } else {
                card.style.display = 'none';
            }
        });
    } 
      // Преобразование даты в строку в формате YYYY-MM-DD
    function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  patientInput.addEventListener('input', filterByPatientName);

  searchButton.addEventListener('click', filterByPatientName);
    try {
      const response = await fetch('http://localhost:3001/patientsAll');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных о пациентах');
      }
      const patients = await response.json();
  
      const cardsContainer = document.querySelector('.cards-container');
      cardsContainer.innerHTML = ''; // Очистка контейнера перед добавлением карточек
  
      patients.forEach(patient => {
        const card = document.createElement('div');
        card.classList.add('card');
  
        const patientInfo = document.createElement('div');
        patientInfo.classList.add('patient-info');
        
        const fullName = document.createElement('h2');
        fullName.textContent = `ФИО: ${patient.Surname_patient} ${patient.Name_patient} ${patient.Middle_patient || ''}`;
  
        const birthDate = document.createElement('p');
        birthDate.textContent = `Дата рождения: ${formatDate(new Date(patient.Date_of_birth))}`;
  
        const medicalCardNumber = document.createElement('p');
        medicalCardNumber.textContent = `Медицинская карта №: ${patient.ID_Patient}`;
  
        const doctor = document.createElement('p');
        doctor.textContent = `Врач: ${patient.Doctor || 'Нет информации'}`; // Если у пациента есть поле Doctor, используем его
  
        patientInfo.appendChild(fullName);
        patientInfo.appendChild(birthDate);
        patientInfo.appendChild(medicalCardNumber);
        patientInfo.appendChild(doctor);
  
        const detailsButton = document.createElement('button');
        detailsButton.classList.add('details-button');
        detailsButton.textContent = 'Подробнее';
        
        card.appendChild(patientInfo);
        card.appendChild(detailsButton);
  
        cardsContainer.appendChild(card);
      });
  
      // Код для пагинации
      const itemsPerPage = 6; // Количество карточек на одной странице
      const pagination = document.querySelector('.pagination');
      const cards = Array.from(cardsContainer.querySelectorAll('.card'));
  
      function displayCards(page) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
  
        const visibleCards = cards.slice(startIndex, endIndex);
  
        cardsContainer.innerHTML = '';
  
        visibleCards.forEach(card => {
          // Создание и добавление карточек на страницу
          cardsContainer.appendChild(card);
        });
      } 

      function createPagination() {
        const totalPages = Math.ceil(cards.length / itemsPerPage);
  
        for (let i = 1; i <= totalPages; i++) {
          const pageButton = document.createElement('button');
          pageButton.textContent = i;
          pageButton.addEventListener('click', () => {
            displayCards(i);
          });
  
          pagination.appendChild(pageButton);
        }
      }
  
      displayCards(1); // Отображение первой страницы при загрузке
      createPagination(); // Создание пагинации
  
    } catch (error) {
        console.error('Ошибка при получении данных о пациентах:', error);
    }
    
});
  // Находите элементы input для поиска по ФИО пациента 
