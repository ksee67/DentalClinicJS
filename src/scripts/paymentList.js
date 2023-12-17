window.addEventListener('DOMContentLoaded', async () => {
  try {
    const servicesResponse = await fetch('http://localhost:3001/services');
    if (!servicesResponse.ok) {
      throw new Error('Failed to fetch service data');
    }
    const services = await servicesResponse.json();

    const patientsResponse = await fetch('http://localhost:3001/patients');
    if (!patientsResponse.ok) {
      throw new Error('Failed to fetch patient data');
    }
    const patients = await patientsResponse.json();

    const searchInput = document.getElementById('searchPayment');
    const dateInput = document.getElementById('dateFilter');
    const filterBtn = document.getElementById('filterBtn');

    filterBtn.addEventListener('click', () => {
      loadPaymentData(patients, services, searchInput.value, dateInput.value);
    });

    await loadPaymentData(patients, services);
  } catch (error) {
    console.error('Error on DOMContentLoaded:', error);
  }
});

async function loadPaymentData(patients, services, searchText = '', dateFilter = '') {
  try {
    const paymentsResponse = await fetch('http://localhost:3001/payments');
    if (!paymentsResponse.ok) {
      throw new Error('Failed to fetch payment data');
    }
    const payments = await paymentsResponse.json();

    const registrarsResponse = await fetch('http://localhost:3001/registrars');
    if (!registrarsResponse.ok) {
      throw new Error('Failed to fetch registrar data');
    }
    const registrars = await registrarsResponse.json();

    const paymentContainer = document.getElementById('paymentData');
    paymentContainer.innerHTML = '';
    paymentContainer.style.maxHeight = '600px'; 
    paymentContainer.style.overflow = 'auto'; 
    payments.forEach(payment => {
      const patient = patients.find(patient => patient.ID_Patient === payment.Patient_ID);
      const registrar = registrars.find(registrar => registrar.ID_Registrar === payment.Registrar_ID);

      if (
        patient?.FullName.toLowerCase().includes(searchText.toLowerCase()) &&
        (dateFilter === '' || new Date(payment.Date_payment).toLocaleDateString() === new Date(dateFilter).toLocaleDateString())
      ) {
        const service = services.find(service => service.service_id === payment.Service_ID);
        const div = document.createElement('div');
        div.textContent = `Пациент: ${patient?.FullName}, Услуга: ${service?.Service_name}, Цена: ${service?.Price}, Дата и время: ${new Date(payment.Date_payment).toLocaleString()}, Регистратор: ${registrar?.FullName}`;

        const printButton = document.createElement('button');
        printButton.innerText = 'Экспортировать';
        printButton.className = 'login-button';
        printButton.style.marginLeft = '20px';
        printButton.style.marginTop = '10px';
        printButton.onclick = () => printReceipt(div.textContent);

        div.appendChild(printButton);
        paymentContainer.appendChild(div);
        
      }
    });
  } catch (error) {
    console.error('Error fetching payment data:', error);
  }
}
async function printReceipt(textContent) {
  try {
    let content = textContent;

    content = content.replace('Экспортировать', '');

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Receipt</title>
        </head>
        <body>
          <div>${content}</div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Receipt.html');

    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка создания HTML документа:', error);
  }
}
document.getElementById('uploadButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('excelFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Выберите файл для загрузки');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3001/import-payment', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Ошибка при импорте данных');
    }

    const result = await response.text();
    alert('Файл успешно загружен и обработан: ' + result);
    window.location.reload(); // Reload the page after adding an appointment
  } catch (error) {
    console.error('Ошибка при отправке запроса:', error);
    alert('Файл успешно загружен и обработан!');
  }
});
