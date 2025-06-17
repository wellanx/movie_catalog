$(document).ready(function() {
    let movies = [];
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // Функция для загрузки фильмов (GET-запрос)
    function loadMovies() {
        $.ajax({
            url: 'http://localhost:3000/books', // Замените на ваш API или 'my-movie/movies.json'
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
