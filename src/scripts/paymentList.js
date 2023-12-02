window.addEventListener('DOMContentLoaded', async () => {
    try {
      const patientsResponse = await fetch('http://localhost:3001/patients');
      if (!patientsResponse.ok) {
        throw new Error('Failed to fetch patient data');
      }
      const patients = await patientsResponse.json();
  
      const searchInput = document.getElementById('searchPayment');
      const dateInput = document.getElementById('dateFilter');
      const filterBtn = document.getElementById('filterBtn');
  
      filterBtn.addEventListener('click', () => {
        loadPaymentData(patients, searchInput.value, dateInput.value);
      });
  
      await loadPaymentData(patients);
    } catch (error) {
      console.error('Error on DOMContentLoaded:', error);
    }
  });
  
  async function loadPaymentData(patients, searchText = '', dateFilter = '') {
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
  
      payments.forEach(payment => {
        const patient = patients.find(patient => patient.ID_Patient === payment.Patient_ID);
        const registrar = registrars.find(registrar => registrar.ID_Registrar === payment.Registrar_ID);
  
        if (
          patient?.FullName.toLowerCase().includes(searchText.toLowerCase()) &&
          (dateFilter === '' || new Date(payment.Date_payment).toLocaleDateString() === new Date(dateFilter).toLocaleDateString())
        ) {
          const div = document.createElement('div');
          div.textContent = `Пациент: ${patient?.FullName}, Дата и время: ${new Date(payment.Date_payment).toLocaleString()}, Сумма: $${payment.Amount}, Регистратор: ${registrar?.FullName}`;
  
          const printButton = document.createElement('button');
          printButton.textContent = 'Распечатать чек';
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
      const content = textContent;
  
      // Создаем содержимое документа Word
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
  
      const blob = new Blob([htmlContent], { type: 'application/msword' });
  
      // Создаем ссылку для скачивания файла
      const url = window.URL.createObjectURL(blob);
  
      // Создаем ссылку для скачивания файла
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Receipt.docx');
      document.body.appendChild(link);
  
      // Загружаем файл
      link.click();
  
      // Освобождаем ресурсы
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error creating Word document:', error);
    }
  }
  
  