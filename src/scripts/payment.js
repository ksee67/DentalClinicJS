// Загрузка данных о пациентах
async function loadPatients() {
  try {
    const patientResponse = await fetch('http://localhost:3001/patients');
    if (!patientResponse.ok) {
      throw new Error('Failed to fetch patient data');
    }
    const patientData = await patientResponse.json();
    const patientSelect = document.getElementById('patientSelect');
    patientData.forEach(patient => {
      const option = document.createElement('option');
      option.value = patient.ID_Patient;
      option.textContent = patient.FullName;
      patientSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching patient data:', error);
  }
}

// Загрузка данных о регистраторах
async function loadRegistrars() {
  try {
    const registrarResponse = await fetch('http://localhost:3001/registrars');
    if (!registrarResponse.ok) {
      throw new Error('Failed to fetch registrar data');
    }
    const registrarData = await registrarResponse.json();
    const registrationEmployee = document.getElementById('registrationEmployee');
    registrarData.forEach(registrar => {
      const option = document.createElement('option');
      option.value = registrar.ID_Registrar;
      option.textContent = registrar.FullName;
      registrationEmployee.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching registrar data:', error);
  }
}
// Загрузка данных об услугах
async function loadServices() {
  try {
    const serviceResponse = await fetch('http://localhost:3001/services');
    if (!serviceResponse.ok) {
      throw new Error('Failed to fetch service data');
    }
    const serviceData = await serviceResponse.json();
    const serviceSelect = document.getElementById('serviceSelect1');

    serviceData.forEach(service => {
      const option = document.createElement('option');
      option.value = service.service_id;
      option.textContent = `${service.Service_name} - ${service.Price}$`;
      serviceSelect.appendChild(option);
    });

    // Обработчик события изменения выбранной услуги

  } catch (error) {
    console.error('Error fetching service data:', error);
  }
}

window.addEventListener('load', () => {
  loadServices();
});


// Вызов функций загрузки данных при загрузке страницы
window.addEventListener('load', () => {
  loadPatients();
  loadRegistrars();
  loadServices();

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  const currentDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  document.getElementById('paymentDate').value = currentDate;

  // Обработчик отправки формы
  document.getElementById('paymentForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвратить стандартное поведение отправки формы

    const formData = new FormData(document.getElementById('paymentForm'));

    const paymentData = {
      Date_payment: formData.get('paymentDate'),
      Service_ID: formData.get('serviceSelect'),
      Registrar_ID: formData.get('registrationEmployee'),
      Patient_ID: formData.get('patientSelect')
    };

    try {
      const response = await fetch('http://localhost:3001/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Ошибка добавления оплаты');
      }

      document.getElementById('paymentForm').reset();
      
      // Показываем alert об успешном добавлении платежа
      alert('Оплата прошла успешно!');
      
      console.log('Оплата прошла успешно!');
    } catch (error) {
      console.error('ОШибка оплаты:', error);
    }
  });
});

// Получаем кнопку обновления
const refreshButton = document.getElementById('refreshButton');

// Добавляем обработчик события 'click' для кнопки
refreshButton.addEventListener('click', () => {
  // Перезагружаем страницу
  location.reload();
});
