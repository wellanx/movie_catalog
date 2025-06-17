$(document).ready(function() {
    let movies = [];
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // Функция для загрузки фильмов (GET-запрос)
    function loadMovies() {
        const title = $('#title-filter').val();
        const genre = $('#genre-filter').val();
        $.ajax({
            url: '/api/movies',
            method: 'GET',
            data: { title, genre },
            dataType: 'json',
            success: function(data) {
                movies = data;
                localStorage.setItem('movies', JSON.stringify(movies));
                renderMovies(movies);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка загрузки фильмов:', textStatus, errorThrown);
                const storedMovies = JSON.parse(localStorage.getItem('movies') || '[]');
                if (storedMovies.length > 0) {
                    movies = storedMovies;
                    renderMovies(movies);
                } else {
                    alert('Ошибка загрузки фильмов! Проверьте подключение к API.');
                }
            }
        });
    }

    // Фильтрация при вводе
    $('#title-filter, #genre-filter').on('input change', function() {
        loadMovies();
    });

    // Функция добавления в избранное (POST-запрос)
    function addToFavorites(movieId) {
        $.ajax({
            url: '/api/favorites',
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
                if (!favorites.includes(movieId)) {
                    favorites.push(movieId);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    updateFavoriteButton(movieId, true);
                }
                alert('Фильм добавлен локально из-за ошибки сервера.');
            }
        });
    }

    // Функция удаления из избранного (DELETE-запрос)
    function removeFromFavorites(movieId) {
        $.ajax({
            url: `/api/favorites/${movieId}`,
            method: 'DELETE',
            success: function() {
                favorites = favorites.filter(id => id !== movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, false);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка удаления из избранного:', textStatus, errorThrown);
                favorites = favorites.filter(id => id !== movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, false);
                alert('Фильм удален локально из-за ошибки сервера.');
            }
        });
    }

    // Обновление кнопки избранного
    function updateFavoriteButton(movieId, isFavorited) {
        const $btn = $(`.fav-btn[data-id="${movieId}"]`);
        if ($btn.length === 0) {
            const $li = $(`#movie-list li[data-id="${movieId}"]`);
            const $newBtn = $li.find('.fav-btn');
            $newBtn.text(isFavorited ? 'В избранном' : 'Добавить в избранное');
            $newBtn.data('id', movieId);
        } else {
            $btn.text(isFavorited ? 'В избранном' : 'Добавить в избранное');
        }
    }

    // Рендер фильмов
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
        filterMovies();
    }

    // Заглушка-функция фильтрации (если у тебя она не определена)
    function filterMovies() {
        // Реализуй, если нужно фильтровать вручную
    }

    // Обработчик избранного
    $(document).on('click', '.fav-btn', function() {
        const movieId = parseInt($(this).data('id'));
        const isFavorited = favorites.includes(movieId);
        if (isFavorited) {
            removeFromFavorites(movieId);
        } else {
            addToFavorites(movieId);
        }
    });

    // Обновление списка избранного
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

    // Показ модального окна избранного
    $('#show-fav-btn').click(function(e) {
        e.preventDefault();
        updateFavoritesList();
        $('#fav-modal').fadeIn(200);
    });

    // Инициализация
    loadMovies();
});
