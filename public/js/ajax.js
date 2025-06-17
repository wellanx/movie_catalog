$(document).ready(function() {
    let movies = [];
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // Загрузка избранного с сервера
    function loadFavorites() {
        $.ajax({
            url: '/api/favorites',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('Избранное с сервера:', data);
                favorites = data.map(id => parseInt(id)); // Гарантируем числа
                localStorage.setItem('favorites', JSON.stringify(favorites));
                renderMovies(movies); // Обновляем кнопки
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка загрузки избранного:', textStatus, errorThrown);
            }
        });
    }

    // Функция для загрузки фильмов
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
                console.log('Фильмов загружено:', movies.length);
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

    // Функция добавления в избранное
    function addToFavorites(movieId, $btn) {
        movieId = parseInt(movieId); // Гарантируем число
        console.log('Отправляем movieId:', movieId, 'type:', typeof movieId);
        if (favorites.includes(movieId)) {
            console.log('Фильм уже в избранном локально:', movieId);
            $btn.prop('disabled', false);
            return;
        }
        $.ajax({
            url: '/api/favorites',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ movieId }),
            success: function(data) {
                favorites.push(movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, true);
                $btn.prop('disabled', false);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка добавления в избранное:', {
                    status: jqXHR.status,
                    response: jqXHR.responseJSON,
                    textStatus,
                    errorThrown
                });
                if (jqXHR.responseJSON?.error === 'Фильм уже в избранном') {
                    if (!favorites.includes(movieId)) {
                        favorites.push(movieId);
                        localStorage.setItem('favorites', JSON.stringify(favorites));
                        updateFavoriteButton(movieId, true);
                    }
                } else {
                    if (!favorites.includes(movieId)) {
                        favorites.push(movieId);
                        localStorage.setItem('favorites', JSON.stringify(favorites));
                        updateFavoriteButton(movieId, true);
                    }
                    alert('Фильм добавлен локально из-за ошибки сервера: ' + JSON.stringify(jqXHR.responseJSON));
                }
                $btn.prop('disabled', false);
            }
        });
    }

    // Функция удаления из избранного
    function removeFromFavorites(movieId, $btn) {
        movieId = parseInt(movieId);
        $.ajax({
            url: `/api/favorites/${movieId}`,
            method: 'DELETE',
            success: function() {
                favorites = favorites.filter(id => id !== movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, false);
                $btn.prop('disabled', false);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Ошибка удаления из избранного:', {
                    status: jqXHR.status,
                    response: jqXHR.responseJSON,
                    textStatus,
                    errorThrown
                });
                favorites = favorites.filter(id => id !== movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoriteButton(movieId, false);
                alert('Фильм удален локально из-за ошибки сервера: ' + JSON.stringify(jqXHR.responseJSON));
                $btn.prop('disabled', false);
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
        console.log('Рендерим фильмов:', moviesToRender.length);
        moviesToRender.forEach(movie => {
            const movieId = parseInt(movie.id);
            const isFavorited = favorites.includes(movieId);
            const movieHtml = `
                <li data-title="${movie.title}" data-genre="${movie.genres.join(', ')}" data-id="${movieId}">
                    <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                    <div>Названиеscore: <strong>${movie.title}</strong></div>
                    <div>Год: ${movie.year}</div>
                    <div>Жанр: ${movie.genres.join(', ')}</div>
                    <div>Описание: ${movie.description}</div>
                    <div>Режиссёр: ${movie.director}</div>
                    <div>Продолжительность: ${movie.duration} мин</div>
                    <div>Страна: ${movie.country}</div>
                    <div>Рейтинг: ${movie.rating}</div>
                    <div><button class="fav-btn" data-id="${movieId}">${isFavorited ? 'В избранном' : 'Добавить в избранное'}</button></div>
                </li>
            `;
            $('#movie-list').append(movieHtml);
        });
        // filterMovies(); // Закомментировано, так как не реализовано
    }

    // Заглушка для filterMovies
    function filterMovies() {
        // Реализуй, если нужна клиентская фильтрация
    }

    // Обработчик избранного
    $(document).on('click', '.fav-btn', function() {
        const $btn = $(this);
        const movieId = parseInt($btn.data('id'));
        console.log('Клик по кнопке, movieId:', movieId, 'type:', typeof movieId);
        if ($btn.prop('disabled')) {
            console.log('Кнопка заблокирована, игнорируем клик:', movieId);
            return;
        }
        $btn.prop('disabled', true); // Блокируем кнопку
        const isFavorited = favorites.includes(movieId);
        if (isFavorited) {
            removeFromFavorites(movieId, $btn);
        } else {
            addToFavorites(movieId, $btn);
        }
    });

    // Обновление списка избранного
    function updateFavoritesList() {
        const $favList = $('#fav-list');
        $favList.empty();
        const favoritedMovies = movies.filter(movie => favorites.includes(parseInt(movie.id)));
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

    // Фильтрация при вводе
    $('#title-filter, #genre-filter').on('input change', function() {
        loadMovies();
    });

    // Инициализация
    loadFavorites(); // Сначала загружаем избранное
    loadMovies();
});