const API_KEY = "?api_key=74691c7ddeef37469dc5e430f57b01b2"
const URL_BASE = "https://api.themoviedb.org/3"
const LANGUAGE = "&language=en-US"

const URL_TRENDING = URL_BASE + "/trending/movie/week" + API_KEY
const URL_POPULAR = URL_BASE + "/movie/popular" + API_KEY + LANGUAGE
const URL_SEARCH = URL_BASE + "/search/movie" + API_KEY + LANGUAGE + "&query="

const URL_MOVIE = URL_BASE + "/movie/"
const URL_IMG = "https://image.tmdb.org/t/p/w500"

const HIGHTLIGHT_NUM = 8;

const TREND = "Now Trending";
const SEARCH = "Search Results for"

var current_address = window.location.href;
var url_main = new URL(current_address);
var lfm_page = url_main.searchParams.get("lfm_page");
var lfm_page_num = url_main.searchParams.get("lfm_page_num");
var lfm_search = url_main.searchParams.get("search");

if (lfm_page_num === null)
    lfm_page_num = 1;
else
    lfm_page_num = parseInt(lfm_page_num);

var state = {
    current: TREND,
    search: ""
}

get_address();

function get_address() {

    switch (true){

    case /search/.test(lfm_page):
        //document.getElementById("ss-container").remove();
        document.getElementById("top").innerHTML = `<div class="for-margin"></div>`
        document.getElementById("main-container").classList.add("search");
        state.current = SEARCH;
        search_fetch();
        break;

/*
    case /\d/.test(page):
        document.getElementById("ss-container").remove();
        console.log("hello");
        break;
*/

    default:
        //fetch on load: slider
        state.current = TREND;
        call_fetch = fetchAPI(slide);
        call_fetch(URL_TRENDING);
        slide_run();

        //fetch on load: popular movies
        call_fetch = fetchAPI(listMovies);
        call_fetch(URL_POPULAR + "&page=" + lfm_page_num);  
        break;
    }
}

/*
//fetch on load: slider
call_fetch = fetchAPI(slide);
call_fetch(URL_TRENDING);
slide_run();

//fetch on load: popular movies
call_fetch = fetchAPI(listMovies);
call_fetch(URL_POPULAR); */

//form
const form = document.getElementById("form")
const submit = form.addEventListener("submit", updateSearch)

function updateSearch(e) {

    e.preventDefault();
    let keyword = form.elements['search'].value;

    lfm_search = keyword.split(" ");
    lfm_search = lfm_search.join("+");

    /*
    call_fetch = fetchAPI(listMovies);
    call_fetch(URL_SEARCH + query);
    */

    if (lfm_search == "")
        window.location.href = "index.html";
    else
        window.location.href = "index.html?lfm_page=search&search=" + lfm_search;

    /*
    if (keyword !== "")
        break_keyword(keyword);
    else{
        call_fetch = fetchAPI(listMovies);
        call_fetch(URL_POPULAR);
    }
    */
}

function search_fetch() {
    let query = url_main.searchParams.get("search");

    let breakdown = query.split("+");
    breakdown = breakdown.join(" ");

    state.search = breakdown;

    call_fetch = fetchAPI(listMovies);
    call_fetch(URL_SEARCH + query + "&page=" + lfm_page_num);
}

//load main container title
function container_title () {
    let title = document.getElementById("container-title");

    title.innerText = `${state.current} ${(state.current==TREND)? "": "'" + state.search + "'"}`
}

container_title();

/*
function break_keyword(keyword) {
    let query = keyword.split(" ");
    query = query.join("+");

    call_fetch = fetchAPI(listMovies);
    call_fetch(URL_SEARCH + query + "&total_results=2");
}
*/

//API fetch
function fetchAPI(part) {
    return async function (url){
        let response = fetch(url).then(res => res.json());

        let data = await response;
        part(data /*, url, data.total_pages*/);
    }
}

async function get_info(packet) {

    let {id, title, overview, poster_path, vote_average, backdrop_path} = packet;

    //details
    let details_path = URL_MOVIE + id + API_KEY;

    let details_fetch = fetch(details_path).then(res => res.json());

    let details = await details_fetch;

    let {production_companies} = details;

    if (details.hasOwnProperty("production_companies") == true){   
        if (production_companies.length != 0){
            var {logo_path, name} = production_companies[0];
        }else{
            var logo_path = null;
            var name = "";
        }
    }else{
        var logo_path = null;
        var name = "";
    }

    let company_logo, hide_image;

    let company_name = name;

    if (poster_path === null){
        poster_path = "https://www.logolynx.com/images/logolynx/8e/8ecdea3e6c81ef80c16d36de1077da91.jpeg";
    }else{
        poster_path = URL_IMG + poster_path;
    }

    if (backdrop_path === null){
        backdrop_path = "https://www.logolynx.com/images/logolynx/8e/8ecdea3e6c81ef80c16d36de1077da91.jpeg";
    }else{
        backdrop_path = URL_IMG + backdrop_path;
    }

    if (logo_path === null){
        company_logo = "";
        hide_image = "hide-image";
    }
    else{
        company_logo = URL_IMG + logo_path;
        hide_image = "";
    }

    //credits
    let URL_CREDITS = URL_BASE + "/movie/" + id + "/credits" + API_KEY 

    let credits = await fetch(URL_CREDITS).then(res => res.json());

    let cast = credits.cast.slice(0, 3);

    vote_average = vote_average.toFixed(1);

    return {id, title, overview, poster_path, backdrop_path, hide_image, company_logo, company_name, cast, vote_average}
}

/*
//slideshow
function slide(data) {
    let results = data.results;

    let highlight = results.splice(0, HIGHTLIGHT_NUM);

    highlight.map(async (movie, index) => {

        let hl_container = document.getElementById("container-" + index);

        hl_container.innerHTML = "";

        let {id, title, overview, poster_path, backdrop_path, hide_image, company_logo, company_name, cast, vote_average} = await get_info(movie);

        let html_text = `
            <div id="hli-${index}" class="hli-box">
                <img class="hl-image" src="${backdrop_path}">
            </div>
            <div id="hld-${index}" class="hl-description">
                <h1 id="ss-movie-${id}" class="hl-title">${title}</h1>
                <p class="hl-overview">${overview}</p>
            </div>
        `
        
        hl_container.innerHTML += html_text;

        document.getElementById(`ss-movie-${id}`).addEventListener("click", (e) => {e.preventDefault(); enter_movie(id)})
    })
}*/


//slideshow
function slide(data) {
    let results = data.results;

    let highlight = results.splice(0, HIGHTLIGHT_NUM);

    let hl_container = document.getElementById("ss-movie-container");

    highlight.map(async (movie, index) => {

        let each_movie = document.createElement("div")

        if (index === 0){
            each_movie.className = "show";
        }
        else {
            each_movie.className = "hide";
        }

        each_movie.setAttribute("id", "container-" + index)

        let {id, title, overview, poster_path, backdrop_path, hide_image, company_logo, company_name, cast, vote_average} = await get_info(movie);

        let each_movie_text = `
            <div id="hli-${index}" class="hli-box">
                <img class="hl-image" src="${backdrop_path}">
            </div>
            <div id="hld-${index}" class="hl-description">
                <h1 id="ss-movie-${id}" class="hl-title">${title}</h1>
                <p class="hl-overview">${overview}</p>
            </div>
        `
        each_movie.innerHTML = each_movie_text;

        hl_container.appendChild(each_movie);

        document.getElementById(`ss-movie-${id}`).addEventListener("click", (e) => {e.preventDefault(); enter_movie(id)})
    })
}

function slide_run() {
    let seq_number = 0;

    let last_number = 0;

    dot();

    let change = setInterval(function() {slide_sequence(++seq_number)}, 6000);

    function slide_sequence() {

        if (seq_number >= HIGHTLIGHT_NUM)
            seq_number = 0;
        else if (seq_number <0)
            seq_number = HIGHTLIGHT_NUM - 1;

        document.getElementById("container-" + last_number).className = "hide";
        document.getElementById("dot-" + last_number).classList.toggle("dot-diff");

        document.getElementById("container-" + seq_number).className = "show";
        document.getElementById("dot-" + seq_number).classList.toggle("dot-diff");

        last_number = seq_number;
    }

    document.querySelector('.ss-container').addEventListener('mouseover',function(){
        clearInterval(change); 
    });

    document.querySelector('.ss-container').addEventListener('mouseenter',function(){
        clearInterval(change); 
    });

    document.querySelector('.ss-container').addEventListener('mouseleave',function(){
        change = setInterval(function() {slide_sequence(++seq_number)}, 6000);
    });

    document.getElementById('ss-previous').addEventListener('click',function(){
        clearInterval(change); 
        seq_number--;
        slide_sequence(seq_number);
    });

    document.getElementById('ss-next').addEventListener('click',function(){
        clearInterval(change); 
        seq_number++;
        slide_sequence(seq_number);
    });

    function dot() {
        let bar = document.getElementById('bar');

        bar.innerHTML = "";

        for (let i=0; i<HIGHTLIGHT_NUM; i++){
            let each_dot = document.createElement('button');

            each_dot.setAttribute("id", `dot-${i}`);

            each_dot.classList.add("dot");

            if (i==0)
             each_dot.classList.add("dot-diff");
            
            each_dot.addEventListener("click", function(){
                clearInterval(change); 
                seq_number = i;
                slide_sequence(seq_number);
            });

            bar.appendChild(each_dot);
        }
    }
}

//main page
const main_container = document.querySelector(".main-container") 

function listMovies(data /*, url, pages*/) {
    let results = data.results;

    page_director(data.total_pages);

    main_container.innerHTML = ""

    results.map(async (movie) => {
    
        let each_movie = document.createElement('div');

        let {id, title, overview, poster_path, hide_image, company_logo, company_name, cast, vote_average} = await get_info(movie);

        each_movie.classList.add('movie-container');

        let circle_color = rate_color(vote_average);

        let rotation = 'style="transform: rotate(' + ((vote_average / 10) * 180) + 'deg);"';

        let each_html = `
        
        <div class="poster-container">
            <img class="poster" src="${poster_path}" alt="${title}">
            
            <p class="overview">${overview}
            </p>

            <img class="logo ${hide_image}" src="${company_logo}" alt="${company_name}">

            <div class="circle-wrap">
                <div class="circle">
                    <div class="mask half">
                        <div class="fill rotate ${circle_color}" ${rotation} ></div>
                    </div>
                    <div class="mask full rotate" ${rotation} >
                        <div class="fill rotate ${circle_color}" ${rotation} ></div>
                    </div>
                </div>
                <div class="small-circle">${vote_average}</div>
            </div>
        </div>

        <div class="description">
            <h1 id="movie_${id}" class="title">${title}</h1>
            <p class="cast">
        `

        cast.forEach(element => {
            each_html += element.name + ", "
        });

        each_html += `</p></div>`

        each_movie.innerHTML = each_html;

        main_container.appendChild(each_movie)

        document.getElementById("movie_" + id).addEventListener("click", function(){enter_movie(id)})
    })
}

function rate_color(rating) {
    if(rating >= 8){
        return 'green'
    }else if(rating >= 6){
        return 'yellow'
    }else{
        return 'red'
    }
}

//var current_page = 1;

function page_director(pages) {
    let current_page = lfm_page_num;

    let pages_bar = document.getElementById("pages");

    pages_bar.innerHTML = "";

    let page;

    if (current_page > 1){
        page = document.createElement("button");
        page.setAttribute("id", "page-previous");
        page.className = "page-button";
        page.innerHTML = "previous";

        page.addEventListener("click", function(){page_select(current_page - 1)});

        pages_bar.appendChild(page);
    }

    for (let i = ((current_page>2)? current_page-2 : 1); ((i <= ((current_page>2)? current_page+2:5)) && (i<= pages)); i++){
        page = document.createElement("button");
        page.className = "page-button";

        if (i == current_page){
            page.classList.add("current-page");
        }
        page.innerHTML = i;

        page.addEventListener("click", function(){page_select(i)});

        pages_bar.appendChild(page);
    }

    if (current_page < pages){
        page = document.createElement("button");
        page.setAttribute("id", "page-next");
        page.className = "page-button";
        page.innerHTML = "next";

        page.addEventListener("click", function(){page_select(current_page + 1)});

        pages_bar.appendChild(page);
    }

    function page_select(number) {
        current_page = number;

        window.location.href = "index.html?lfm_page=" + lfm_page + "&lfm_page_num=" + number + "&search=" + lfm_search;
    
        
        //call_fetch = fetchAPI(listMovies);

        //url.replace(/&page=\d*/, "");
        //call_fetch(url + "&page=" + number);
    }
}

//enter each movie
function enter_movie(id) {
    window.location.href = "movie.html?movie_id=" + id;
}