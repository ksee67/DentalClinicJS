window.addEventListener('DOMContentLoaded', async () => {
  const patientInput = document.querySelector('input[placeholder="Поиск по ФИО пациента"]');
  if (patientInput) {
    patientInput.addEventListener('input', filterByPatientName);
  } else {
    console.error('Элемент не найден');
  }
  const cardsContainer = document.querySelector('.cards-container');
  const sortAscButton = document.getElementById('sortAscButton');
  const sortDescButton = document.getElementById('sortDescButton');
  const allCards = [];
  let visibleCards = [];
  filterByAgeCategory();


function getAge(dateOfBirth) {
  const today = new Date();
  const diff = today - dateOfBirth;
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
function filterByPatientName() {
  const searchText = patientInput.value.toLowerCase().trim();

  allCards.forEach(card => {
    const fullName = card.querySelector('.patient-info h2').textContent.toLowerCase();
    const names = fullName.split(' ');
    const shouldShowCard = names.some(name => name.includes(searchText));

    card.style.display = shouldShowCard ? 'block' : 'none';
  });

  // Обновляем видимые карточки и отображаем первую страницу
  visibleCards = allCards.filter(card => card.style.display !== 'none');
  showPage(1);
}
function sortPatientsAsc() {
  visibleCards.sort((a, b) =>
    a.querySelector('.patient-info h2').textContent.localeCompare(b.querySelector('.patient-info h2').textContent)
  );
  showPage(1); // Показать отсортированные карточки на первой странице
}

function sortPatientsDesc() {
  visibleCards.sort((a, b) =>
    b.querySelector('.patient-info h2').textContent.localeCompare(a.querySelector('.patient-info h2').textContent)
  );
  showPage(1); //  отсортированные карточки на первой странице
}

  function renderCards() {
    cardsContainer.innerHTML = '';
    visibleCards.forEach(card => {
      cardsContainer.appendChild(card);
    });
  }

  patientInput.addEventListener('input', filterByPatientName);
  function handleDetailsClick(patientId, fullName) {
    window.location.href = `MedicalHistory.html?id=${patientId}&fullName=${fullName}`;
  }
  try {
    const response = await fetch('http://localhost:3001/patientsAll');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о пациентах');
    }
    const patients = await response.json();
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
    
      patientInfo.appendChild(fullName);
      patientInfo.appendChild(birthDate);
      patientInfo.appendChild(medicalCardNumber);
    
      const detailsButton = document.createElement('button');
      detailsButton.classList.add('details-button');
      detailsButton.textContent = 'Подробнее';
      detailsButton.addEventListener('click', () => {
        const fullName = `${patient.Surname_patient} ${patient.Name_patient} ${patient.Middle_patient || ''}`;
        handleDetailsClick(patient.ID_Patient, fullName);
      });
    
      card.appendChild(patientInfo);
      card.appendChild(detailsButton);
    
      allCards.push(card);
    });

    visibleCards = [...allCards];
    renderCards();
    addPagination(1);
  
    sortAscButton.addEventListener('click', sortPatientsAsc);
    sortDescButton.addEventListener('click', sortPatientsDesc);
  
    showPage(1); //  для отображения всех карточек после загрузки
  } catch (error) {
    console.error('Ошибка при получении данных о пациентах:', error);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function showPage(pageNumber) {
    cardsContainer.innerHTML = '';
    const itemsPerPage = 3; // Устанавливаем максимальное количество карточек на одной странице
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCards = visibleCards.slice(startIndex, endIndex);

    pageCards.forEach(card => {
      cardsContainer.appendChild(card);
    });

    addPagination(pageNumber);
  }

  function addPagination(currentPage) {
    const itemsPerPage = 3; // Устанавливаем максимальное количество карточек на одной странице
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
  document.getElementById('rating').addEventListener('change', filterByAgeCategory);

  async function filterByAgeCategory() {
    const selectedCategory = document.getElementById('rating').value;
    const cards = Array.from(allCards); //  копию всех карточек
  
    cards.forEach(card => {
      const birthDateElement = card.querySelector('.patient-info p:nth-child(2)');
      if (birthDateElement) {
        const dateOfBirth = new Date(birthDateElement.textContent.split(': ')[1]);
        const age = getAge(dateOfBirth);
  
        if (selectedCategory === '1') { // Все
          card.style.display = 'block';
        } else if (selectedCategory === '2') { // Дети
          if (age < 18) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        } else if (selectedCategory === '3') { // взрослые
          if (age >= 18) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      }
    });
  
    // Обновляем visibleCards
    visibleCards = cards.filter(card => card.style.display !== 'none');
    showPage(1);
  }
  
});
const recognition = new window.webkitSpeechRecognition(); //  экземпляр распознавания речи

const input = document.querySelector('input'); //  инпут, в который будет вводиться текст с помощью голоса

recognition.lang = 'ru-RU'; //  язык для распознавания
recognition.interimResults = false; //  опция для промежуточных результатов 

//  при завершении распознавания речи
recognition.onresult = (event) => {
  const speechToText = event.results[0][0].transcript; //  распознанный текст из результатов
  input.value = speechToText; // заплчнения значение инпута текстом из голоса
};

//  при ошибке распознавания
recognition.onerror = (event) => {
  console.error('Ошибка распознавания речи:', event.error);
};

//  при начале распознавания речи
recognition.onstart = () => {
  console.log('Начато распознавание речи...');
};

// при завершении распознавания речи
recognition.onend = () => {
  console.log('Распознавание речи завершено');
};

//  запуск распознавания речи при клике 
const startSpeechRecognition = () => {
  recognition.start(); // Запускаем распознавание речи
};

// привязка функции к событию клик по кнопке
const startButton = document.getElementById('startButton'); 
startButton.addEventListener('click', startSpeechRecognition);
