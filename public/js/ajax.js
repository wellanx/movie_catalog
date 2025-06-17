$(document).ready(function() {
    let movies = [];
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // Функция для загрузки фильмов (GET-запрос)
    function loadMovies() {
        $.ajax({
            // Было: url: 'http://localhost:3000/books'
            // Стало:
            url: '/api/movies',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                movies = data;
                localStorage.setItem('movies', JSON.stringify(movies));
                renderMovies(movies); // Вызов существующей функции рендера
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка загрузки фильмов:', textStatus, errorThrown);
                // Fallback на localStorage
                const storedMovies = JSON.parse(localStorage.getItem('movies') || '[]');
                if (storedMovies.length > 0) {
                    movies = storedMovies;
                    renderMovies(movies);
                } else {
                    alert('Ошибка загрузки фильмов! Проверьте подключение к API.');
                }
            }
        });

        // Имитация через setTimeout (для тестирования без API)
        /*
        setTimeout(() => {
            const mockMovies = JSON.parse(localStorage.getItem('movies') || '[]');
            if (mockMovies.length > 0) {
                movies = mockMovies;
                renderMovies(movies);
            } else {
                alert('Нет данных для загрузки!');
            }
        }, 500);
        */
    }
     // Функция для добавления в избранное (POST-запрос)
    function addToFavorites(movieId) {
        $.ajax({
            url: 'http://localhost:3000/favorites',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ movieId }),
            success: function(data) {
                if (!favorites.includes(movieId)) {
                    favorites.push(movieId);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    updateFavoriteButton(movieId, true);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка добавления в избранное:', textStatus, errorThrown);
                // Fallback на localStorage
                if (!favorites.includes(movieId)) {
                    favorites.push(movieId);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    updateFavoriteButton(movieId, true);
                }
                alert('Фильм добавлен локально из-за ошибки сервера.');
            }
        });

        // Имитация через setTimeout
        /*
        setTimeout(() => {
            if (!favorites.includes(movieId)) {
                favorites.push(movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, true);
            }
        }, 500);
        */
    }
   // Функция для удаления из избранного (DELETE-запрос)
    function removeFromFavorites(movieId) {
        $.ajax({
            url: `http://localhost:3000/favorites/${movieId}`,
            method: 'DELETE',
            success: function() {
                favorites = favorites.filter(id => id !== movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, false);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка удаления из избранного:', textStatus, errorThrown);
                // Fallback на localStorage
                favorites = favorites.filter(id => id !== movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, false);
                alert('Фильм удален локально из-за ошибки сервера.');
            }
        });

        // Имитация через setTimeout
        /*
        setTimeout(() => {
            favorites = favorites.filter(id => id !== movieId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoriteButton(movieId, false);
        }, 500);
        */
    }

    // Обновление кнопки избранного
    function updateFavoriteButton(movieId, isFavorited) {
        const $btn = $(`.fav-btn[data-id="${movieId}"]`);
        if ($btn.length === 0) {
            // Если кнопка не найдена, найти по ближайшему li
            const $li = $(`#movie-list li[data-id="${movieId}"]`);
            const $newBtn = $li.find('.fav-btn');
            $newBtn.text(isFavorited ? 'В избранном' : 'Добавить в избранное');
            $newBtn.data('id', movieId);
        } else {
            $btn.text(isFavorited ? 'В избранном' : 'Добавить в избранное');
        }
    }
    // Переопределение рендера фильмов для поддержки data-id
    function renderMovies(moviesToRender) {
        $('#movie-list').empty();
        moviesToRender.forEach(movie => {
            const isFavorited = favorites.includes(movie.id);
            const movieHtml = `
                <li data-title="${movie.title}" data-genre="${movie.genres.join(', ')}" data-id="${movie.id}">
                    <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                    <div>Название: <strong>${movie.title}</strong></div>
                    <div>Год: ${movie.year}</div>
                    <div>Жанр: ${movie.genres.join(', ')}</div>
                    <div>Описание: ${movie.description}</div>
                    <div>Режиссёр: ${movie.director}</div>
                    <div>Продолжительность: ${movie.duration} мин</div>
                    <div>Страна: ${movie.country}</div>
                    <div>Рейтинг: ${movie.rating}</div>
                    <div><button class="fav-btn" data-id="${movie.id}">${isFavorited ? 'В избранном' : 'Добавить в избранное'}</button></div>
                </li>
            `;
            $('#movie-list').append(movieHtml);
        });
        // Применить фильтры после рендера
        filterMovies();
    }

    // Переопределение обработчика избранного
    $(document).on('click', '.fav-btn', function() {
        const movieId = parseInt($(this).data('id'));
        const isFavorited = favorites.includes(movieId);
        if (isFavorited) {
            removeFromFavorites(movieId);
        } else {
            addToFavorites(movieId);
        }
    });
       // Обновление списка избранного в модальном окне
    function updateFavoritesList() {
        const $favList = $('#fav-list');
        $favList.empty();
        const favoritedMovies = movies.filter(movie => favorites.includes(movie.id));
        if (favoritedMovies.length === 0) {
            $favList.append('<li>Нет избранных фильмов</li>');
        } else {
            favoritedMovies.forEach(movie => {
                $favList.append(`
                    <li style="margin-bottom:10px;">
                        <img src="${movie.poster}" alt="${movie.title}" style="height:40px;vertical-align:middle;margin-right:10px;">
                        <span>${movie.title} (${movie.year})</span>
                    </li>
                `);
            });
        }
    }

    // Переопределение показа модального окна избранного
    $('#show-fav-btn').click(function(e) {
        e.preventDefault();
        updateFavoritesList();
        $('#fav-modal').fadeIn(200);
    });

    // Инициализация
    loadMovies();
});