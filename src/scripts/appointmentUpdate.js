document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const doctorName = urlParams.get('doctorName');
  const patientName = urlParams.get('patientName');

  // Установка значений в селекты и комбобоксы
  document.getElementById('doctor').value = doctorName;
  document.getElementById('patient').value = patientName;
});
