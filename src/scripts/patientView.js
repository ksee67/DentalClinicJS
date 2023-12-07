window.addEventListener('DOMContentLoaded', async () => {
  const patientInput = document.querySelector('input[placeholder="Поиск по ФИО пациента"]');
  const cardsContainer = document.querySelector('.cards-container');
  let allCards = [];
  let visibleCards = [];

  function filterByPatientName() {
    const searchText = patientInput.value.toLowerCase().trim();

    visibleCards.forEach(card => {
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

  // Функция для вычисления возраста
  function getAge(dateOfBirth) {
    const today = new Date();
    const diff = today - dateOfBirth;
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // Обработчик события изменения значения в select
  document.getElementById('rating').addEventListener('change', () => {
    const selectedCategory = document.getElementById('rating').value;
    visibleCards = allCards.slice(); // Скопируем все карточки в видимые
  
    visibleCards.forEach(card => {
      const birthDateElement = card.querySelector('.patient-info p:nth-child(2)'); // Элемент с датой рождения
      if (birthDateElement) {
        const dateOfBirth = new Date(birthDateElement.textContent.split(': ')[1]);
        const age = getAge(dateOfBirth);
  
        // Фильтрация по возрастной категории
        if (selectedCategory === 'Дети' && age >= 18) {
          card.style.display = 'none';
        } else if (selectedCategory === 'Взрослые' && age < 18) {
          card.style.display = 'none';
        }
      }
    });
  
    // Показать только те карточки, которые должны быть видимыми
    visibleCards.forEach(card => {
      if (card.style.display !== 'none') {
        card.style.display = 'block';
      }
    });
  
    showPage(1); // Показываем первую страницу
  });
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  patientInput.addEventListener('input', filterByPatientName);

  try {
    const response = await fetch('http://localhost:3001/patientsAll');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о пациентах');
    }
    const patients = await response.json();

    cardsContainer.innerHTML = '';

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
      doctor.textContent = `Врач: ${patient.Doctor || 'Нет информации'}`;

      patientInfo.appendChild(fullName);
      patientInfo.appendChild(birthDate);
      patientInfo.appendChild(medicalCardNumber);
      patientInfo.appendChild(doctor);

      const detailsButton = document.createElement('button');
      detailsButton.classList.add('details-button');
      detailsButton.textContent = 'Подробнее';
      
      card.appendChild(patientInfo);
      card.appendChild(detailsButton);

      allCards.push(card); // Добавляем каждую карточку в массив всех карточек

      // Код для добавления карточек в DOM-дерево здесь...
    });

    visibleCards = [...allCards]; // Начально все карточки видимы
    showPage(1); // Показываем первую страницу

  } catch (error) {
    console.error('Ошибка при получении данных о пациентах:', error);
  }

  function showPage(pageNumber) {
    cardsContainer.innerHTML = '';
    const itemsPerPage = 6;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCards = visibleCards.slice(startIndex, endIndex);

    pageCards.forEach(card => {
      cardsContainer.appendChild(card);
    });

    addPagination(pageNumber);
  }

  function addPagination(currentPage) {
    const itemsPerPage = 6;
    const totalPages = Math.ceil(visibleCards.length / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.addEventListener('click', () => {
        showPage(i);
      });

      if (i === currentPage) {
        pageButton.classList.add('active');
      }

      pagination.appendChild(pageButton);
    }
  }
});
