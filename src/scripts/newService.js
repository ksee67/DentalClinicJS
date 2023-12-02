const therapyContainer = document.querySelector('.services#therapy');
const searchInput = document.querySelector('.special-input');
const categorySelect = document.getElementById('rating');
const priceSelect = document.getElementById('price');

let serviceData; //

async function loadServiceDataFromServer() {
  try {
    const response = await fetch('http://localhost:3001/services');
    if (!response.ok) {
      throw new Error('Failed to fetch data: ' + response.status);
    }
    serviceData = await response.json();
    if (serviceData) {
      renderServicesByCategory(serviceData);
      const categorySelect = document.getElementById('rating');
      const priceSelect = document.getElementById('price');
      const searchInput = document.querySelector('.special-input');

      categorySelect.addEventListener('change', () => filterServicesByCategory(serviceData));
      priceSelect.addEventListener('change', () => filterServicesByCategory(serviceData));
      searchInput.addEventListener('input', () => filterServicesByCategory(serviceData));
    } else {
      console.error('No data received from the server');
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

function sortServices(data, sortType) {
  const sortedData = [...data];
  if (sortType === 'asc') {
    sortedData.sort((a, b) => a.Price - b.Price);
  } else if (sortType === 'desc') {
    sortedData.sort((a, b) => b.Price - a.Price);
  }
  return sortedData;
}

function renderServicesByCategory(serviceData) {
  const therapyContainer = document.getElementById('therapy');
  const hygieneContainer = document.getElementById('hygiene');
  const surgeryContainer = document.getElementById('surgery');

  therapyContainer.innerHTML = '';
  hygieneContainer.innerHTML = '';
  surgeryContainer.innerHTML = '';

  serviceData.forEach(service => {
    const serviceDiv = document.createElement('div');
    serviceDiv.className = 'service-card';
    serviceDiv.innerHTML = `
      <div class="service">
        <div class="name">${service.Service_name}</div>
        <div class="price">Цена: $${service.Price}</div>
      </div>
    `;

    switch (service.category_id) {
      case 1:
        therapyContainer.appendChild(serviceDiv);
        break;
      case 2:
        hygieneContainer.appendChild(serviceDiv);
        break;
      case 3:
        surgeryContainer.appendChild(serviceDiv);
        break;
      default:
        break;
    }
  });
}

function filterServicesByCategory(serviceData) {
  const categorySelect = document.getElementById('rating');
  const selectedCategoryId = parseInt(categorySelect.value);
  const priceSelect = document.getElementById('price');
  const selectedPrice = priceSelect.value;
  const searchInput = document.querySelector('.special-input');
  const searchText = searchInput.value.toLowerCase();

  const filteredData = serviceData.filter(service => {
    return (selectedCategoryId === 0 || service.category_id === selectedCategoryId) &&
      (searchText === '' || service.Service_name.toLowerCase().includes(searchText));
  });

  const sortedData = sortServices(filteredData, selectedPrice);
  renderServicesByCategory(sortedData);
}

window.addEventListener('load', loadServiceDataFromServer);
