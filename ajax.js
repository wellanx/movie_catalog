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