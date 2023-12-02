app.get('/', (req, res) => {
    const services = []; //  для получения данных из базы данных
  
    res.render('services', { services }); // имя шаблона без расширения
  });
  