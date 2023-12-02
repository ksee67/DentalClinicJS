app.get('/', (req, res) => {
    const categoryServices = []; //  для получения данных из базы данных
  
    res.render('categoryServices', { categoryServices }); // имя шаблона без расширения
  });
  