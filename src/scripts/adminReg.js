function togglePasswordVisibility() {
  const passwordField = document.getElementById("password");
  const showPasswordButton = document.getElementById("showPasswordButton");
  
  if (passwordField.type === "password") {
    passwordField.type = "text";
    showPasswordButton.textContent = "Скрыть пароль";
  } else {
    passwordField.type = "password";
    showPasswordButton.textContent = "Показать пароль";
  }
}


async function submitForm(event) {
  event.preventDefault();

  const form = document.getElementById('userForm');
  const formData = new FormData(form);
  const userData = {};

  for (let [key, value] of formData.entries()) {
    userData[key] = value;
  }

  // Проверка адреса электронной почты
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData['email'])) {
    alert('Некорректный адрес электронной почты');
    return;
  }

  // Проверка пароля по заданным ограничениям
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{5,100}$/;
  if (!passwordRegex.test(userData['password'])) {
    alert('Пароль должен содержать минимум одну заглавную и строчную букву, цифру, специальный символ и быть длиной от 5 до 100 символов');
    return;
  }

  // Проверка длины логина
  const login = userData['login'];
  if (login.length < 5 || login.length > 60) {
    alert('Логин должен содержать от 5 до 60 символов');
    return;
  }
  try {
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      alert('Пользователь успешно добавлен');

    } else {
      throw new Error('Ошибка при добавлении пользователя');
    }
  } catch (error) {
    console.error('Произошла ошибка:', error);
    alert('Произошла ошибка при добавлении пользователя');
  }
}
