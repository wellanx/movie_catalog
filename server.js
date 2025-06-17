const express = require('express');
const fs = require('fs').promises; // Используем promises для асинхронной работы с файлами
const path = require('path');

// Создаем сервер
const app = express();

// Разрешаем серверу отдавать статические файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Подключаем middleware для чтения JSON из запросов
app.use(express.json());

// Файл базы данных
const DATA_FILE = 'data.json';
let db = { movies: [], favorites: [] };

// Загружаем данные при старте
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    db = JSON.parse(data);
  } catch (error) {
    console.error('Ошибка загрузки data.json:', error);
    db = { movies: [], favorites: [] }; // Инициализация пустой базы при ошибке
  }
}

// Сохраняем данные в файл
async function saveData() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения data.json:', error);
  }
}

// Инициализация данных
loadData().then(() => {
  console.log('Данные загружены');
});

// Роут для получения всех фильмов с поддержкой фильтрации
app.get('/api/movies', (req, res) => {
  let filteredMovies = [...db.movies];

  // Фильтрация по названию
  if (req.query.title) {
    const title = req.query.title.toLowerCase();
    filteredMovies = filteredMovies.filter(movie =>
      movie.title.toLowerCase().includes(title)
    );
  }

  // Фильтрация по жанру
  if (req.query.genre) {
    const genre = req.query.genre;
    filteredMovies = filteredMovies.filter(movie =>
      movie.genres.includes(genre)
    );
  }

  res.json(filteredMovies);
});

// Роут для добавления в избранное
app.post('/api/favorites', async (req, res) => {
  const { movieId } = req.body;
  console.log('POST /api/favorites, movieId:', movieId, 'type:', typeof movieId); // Лог
  console.log('Текущие favorites:', db.favorites, 'types:', db.favorites.map(id => typeof id)); // Лог
  if (!movieId || isNaN(movieId)) {
      console.error('Некорректный movieId:', movieId);
      return res.status(400).json({ error: 'Некорректный movieId' });
  }
  const movieIdNum = parseInt(movieId); // Приводим к числу
  const movieExists = db.movies.some(movie => movie.id === movieIdNum);
  if (!movieExists) {
      console.error('Фильм не найден:', movieIdNum);
      return res.status(404).json({ error: 'Фильм не найден' });
  }
  if (db.favorites.includes(movieIdNum)) {
      console.error('Фильм уже в избранном:', movieIdNum, 'favorites:', db.favorites);
      return res.status(400).json({ error: 'Фильм уже в избранном' });
  }
  db.favorites.push(movieIdNum);
  try {
      await saveData();
      console.log('Фильм добавлен в избранное:', movieIdNum, 'новые favorites:', db.favorites);
      res.json({ success: true });
  } catch (error) {
      console.error('Ошибка сохранения:', error);
      res.status(500).json({ error: 'Ошибка сервера при сохранении' });
  }
});

// Роут для удаления из избранного
app.delete('/api/favorites/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);

  // Проверка, есть ли фильм в избранном
  if (!db.favorites.includes(movieId)) {
    return res.status(404).json({ error: 'Фильм не в избранном' });
  }

  db.favorites = db.favorites.filter(id => id !== movieId);
  await saveData();
  res.json({ success: true });
});

// Роут для перенаправления с корня на каталог
app.get('/', (req, res) => {
  res.redirect('/catalog.html');
});

// Запускаем сервер
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});