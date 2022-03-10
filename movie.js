const URL_BASE = "https://api.themoviedb.org/3"
const URL_MOVIE = URL_BASE + "/movie/"
const URL_IMG = "https://image.tmdb.org/t/p/w500"
const YOUTUBE = "https://www.youtube.com/embed/"

const API_KEY = "?api_key=74691c7ddeef37469dc5e430f57b01b2"

var current_address = window.location.href;
var url_main = new URL(current_address);
var movie_id = url_main.searchParams.get("movie_id");

const URL_CREDITS = URL_BASE + "/movie/" + movie_id + "/credits" + API_KEY

var lfm_search;

//form
const form = document.getElementById("form")
const submit = form.addEventListener("submit", updateSearch)

function updateSearch(e) {

    e.preventDefault();
    let keyword = form.elements['search'].value;

    lfm_search = keyword.split(" ");
    lfm_search = lfm_search.join("+");

    if (lfm_search == "")
        location.replace("index.html");
    else
        location.replace("index.html?lfm_page=search&search=" + lfm_search);
}

//get movie info
fetch_info();

async function fetch_info() {
    let results = await fetch(URL_MOVIE + movie_id + API_KEY + "&append_to_response=credits,videos").then(res => res.json());

    build_page(results);
}

async function get_info(results) {
    const {backdrop_path, genres, homepage, original_language, overview, poster_path, production_companies, release_date, runtime, tagline, title, vote_average, vote_count} = results;

    const {cast, crew} = results.credits;

    const videos = results.videos.results;

    console.log(videos);

    let producers = [];
    let writers = [];
    let directors = [];
    let trailer = "";

    crew.forEach(element => {
        if (element.job == "Producer")
            producers.push(element.name);
        else if (element.job == "Writer")
            writers.push(element.name);
        else if (element.job == "Director")
            directors.push(element.name);
    })

    for(let i=0; i<videos.length; i++){
        if ((/Official Trailer/i).test(videos[i].name) || (/Main Trailer/i).test(videos[i].name) || (/Final Trailer/i).test(videos[i].name)){
            trailer = YOUTUBE + videos[i].key + "?autoplay=1&mute=1&loop=1";
            break;
        }
    }

    if (trailer === "") {
        for(let i=0; i<videos.length; i++){
            if ((/Trailer/i).test(videos[i].name))
                trailer = YOUTUBE + videos[i].key + "?autoplay=1&mute=1&loop=1";
                break;
        }
    }

    return ({backdrop_path, genres, homepage, original_language, overview, poster_path, production_companies, release_date, runtime, tagline, title, vote_average, vote_count, cast, writers, directors, producers, directors, trailer});
}

async function build_page(results) {
    const {backdrop_path, genres, homepage, original_language, overview, poster_path, production_companies, release_date, runtime, tagline, title, vote_average, vote_count, cast, writers, directors, producers, trailer} = await get_info(results);

    //backdrop
    document.querySelector("#main .background").style.background = `url('${URL_IMG}${backdrop_path}')`; 

    //poster
    let poster_box = document.querySelector("#main .poster-box");

    let poster = document.createElement("img");

    poster.src = URL_IMG + poster_path;

    poster_box.appendChild(poster);

    let info = document.getElementById("info");
    //info
    info.innerHTML += `
    <h1 id="title">${title}</h1>
    <p id="tagline"><i>"${tagline}"</i></p>
    `
    //directors
    if (directors.length > 0){
        let for_directors = "<p>Directed by: ";
        directors.forEach((element, index) => {
            for_directors += `${element}`;

            if (index != directors.length-1)
                for_directors += ", ";
        });
        for_directors += "</p>";

        info.innerHTML += for_directors;
    }

    //writers
    if (writers.length > 0){
        let for_writers = "<p>Written by: ";
        writers.forEach((element, index) => {
            for_writers += `${element}`;

            if (index != writers.length-1)
                for_writers += ", ";
        });
        for_writers += "</p>";

        info.innerHTML += for_writers;
    }

    //producers
    if (producers.length > 0){
        let for_producers = "<p>Produced by: ";
        producers.forEach((element, index) => {
            for_producers += `${element}`;

            if (index != producers.length-1)
                for_producers += ", ";
        });
        for_producers += "</p>";

        info.innerHTML += for_producers;
    }

    //cast
    if (cast.length > 0){
        let for_cast = "<p>Starring by: </br>";
        for (let i=0; i<8 && i<cast.length; i++){
            for_cast += `${cast[i].name}`;

            if (i != cast.length-1 && i!=9)
                for_cast += ", ";
        }
        for_cast += "</p>";

        info.innerHTML += for_cast;
    }

    //genres
    let for_genres = "<p>Genres: ";
    genres.forEach((element, index) => {
        for_genres += `${element.name}`;

        if (index != genres.length-1)
            for_genres += ", ";
    });
    for_genres += "</p>";

    info.innerHTML += for_genres;

    //production companies
    let for_pc= "<p>Production Companies: ";
    production_companies.forEach((element, index) => {
        for_pc += `${element.name}`;

        if (index != production_companies.length-1)
            for_pc += ", ";
    });
    for_pc += "</p>";

    info.innerHTML += for_pc;

    info.innerHTML += `
    <p>Runtime: ${runtime} minutes</p>
    <p>Release Date: ${release_date}</p>
    <p>Overview:</p>
    <p>&emsp;${overview}</p>
    <p>Official Website: <a href="${homepage}">${homepage}</a></p>
    `;

    let video_box = document.getElementById("trailer");
    video_box.innerHTML = `
        <iframe width="1920" height="1080"
        src="${trailer}" allowfullscreen>
        </iframe>
    `

    if (trailer == "")
        document.getElementById("trailer").remove();
}



