const express = require('express');
const fs = require('fs');
const path = require('path');

// 1. Создаем сервер
const app = express();

// 2. Разрешаем серверу отдавать статические файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// 3. Подключаем middleware для чтения JSON из запросов
app.use(express.json());

// 4. Подключаем файл-базу данных
const DATA_FILE = 'data.json';
let db = { movies: [], favorites: [] };

// Загружаем данные при старте
if (fs.existsSync(DATA_FILE)) {
  db = JSON.parse(fs.readFileSync(DATA_FILE));
}

// 5. Роут для получения всех фильмов (GET /api/movies)
app.get('/api/movies', (req, res) => {
  res.json(db.movies);
});

// 6. Роут для добавления в избранное (POST /api/favorites)
app.post('/api/favorites', (req, res) => {
  const { movieId } = req.body;
  if (!db.favorites.includes(movieId)) {
    db.favorites.push(movieId);
    saveData();
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Уже в избранном' });
  }
});

// 7. Роут для удаления из избранного (DELETE /api/favorites/:id)
app.delete('/api/favorites/:id', (req, res) => {
  db.favorites = db.favorites.filter(id => id !== parseInt(req.params.id));
  saveData();
  res.json({ success: true });
});

// 8. Функция для сохранения данных в файл
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// 9. Запускаем сервер на порту 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});