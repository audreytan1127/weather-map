"use strict"
$(() => {


/////////////////////     VARIABLES //////////////////////////////////////////////

// open weather link
    const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast';

    //loads map
    const map = initializeMap();

    //markers created will be stored into variable marker
    const marker = createMarker();

    //coordinates for the alamo downtown san antonio
    const ALAMO_COORDINATES = ['29.4260', '-98.4861'];

    //obtains the URL with the alamo coordinates
    const URL = getWeatherURL(...ALAMO_COORDINATES);

    // finds div to print city name
    const grabCityDiv = document.querySelector('#city');

    //find div to print current weather stats
    const grabTodayWeather = document.querySelector('#today-weather');

    //find div to print five-day forecast
    const fiveDayForecast = document.querySelector('#five-day-forecast');


///////////////////     FUNCTIONS   //////////////////////////////////////////////

    //function that initializes the map to center on codeup (class exercise)
    function initializeMap() {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const mapOptions = {

            //only accepts ID so no need for hashtag
            container: 'map',

            style: 'mapbox://styles/mapbox/streets-v12', //style URL (there are predefined styles)

            zoom: 10, //zoom it starts at

            center: [-98.4861, 29.4260], //starting coordinates at the alamo
        }
        return new mapboxgl.Map(mapOptions); //created new map object and stored global variable
    }

    // //function to make a marker starting at the Alamo
    function createMarker() {

        //function that creates a marker at codeup
        return new mapboxgl.Marker({draggable: true})

            //sets the coords for the alamo
            .setLngLat([-98.4861, 29.4260])

            //adds marker to map
            .addTo(map);

    }

    //function that takes in coordinates from center of map and prints on the screen the address
    function findAndPrintAddress() {

        //set variable of coords to the center of the map (will grab the coords of the location in the center of the map)
        const coords = map.getCenter();

        //logs coords of the location at the center of the map
        console.log(coords);

        //reverse geocode will find the address of the coords, also takes (coordinates, token) as parameters
        //also needs .then((response)=>{code block of what to do with the response}); like ajax requests
        reverseGeocode(coords, MAPBOX_TOKEN).then((data) => {

            //logs the address of the coords
            console.log(data);

            //prints the address between the h1 element tags
            document.querySelector('h1').innerHTML = `${data}`;
        });
    }

// Simple way to create URL for request based on coordinates
    function getWeatherURL(lat, lon) {
        return `${OPEN_WEATHER_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${OPEN_WEATHER_APPID}`;
    }


//FUNCTION TO UPDATE WEATHER AND CITY NAME TO MARKER LOCATION
    function onDragEnd() {
        const lngLat = marker.getLngLat();
        //sets the open weather url to the lng and lat to marker coords
        $.ajax(getWeatherURL(lngLat["lat"], lngLat["lng"]))
            .done((markerResponse) => {

                //updates city name to where marker lands
                renderDivCity(markerResponse.city.name);

                renderCurrentConditions(markerResponse.list[0].main.temp, markerResponse.list[0].main.feels_like, markerResponse.list[0].weather[0].description, markerResponse.list[0].wind.speed);

                //declare variable to hold current weather for initial city
                let markerWeather = []
                //loop through the marker response list  to print info onto webpage
                markerResponse.list.forEach((date, indexNum) => {
                    //for each day (each block goes by 3 hours, 24 hours in a day = 8 blocks)
                    if (indexNum % 8 === 0) {
                        //declare the constant minMaxTemps and set equal to function which gets info needed from api
                        const minMaxTemps = returnMinMaxTemps(markerResponse);

                        markerWeather += '<div class="five-day-card col-sm-12 col-md-6 col-lg-2">'
                        markerWeather += `<ul class="five-day-weather-items text-start">`

                        //declare constant and pass in the index of each 3-hour block and divide each by 8 to skip 24 hours
                        markerWeather += `<li>Date: <div>${minMaxTemps[indexNum / 8].date}</div></li>`;
                        markerWeather += `<li>Minimum Temp: <div>${minMaxTemps[indexNum / 8].min} F</div></li>`;
                        markerWeather += `<li>Maximum Temp: <div> ${minMaxTemps[indexNum / 8].max} F</div></li>`;

                        //going to add multiple divs with data points into empty array
                        markerWeather += `<li>Today it is: <div>${date.weather[0].description}</div></li>`
                        markerWeather += `<li>Feels like: <div>${date.main.feels_like} F</div></li>`
                        markerWeather += `<li>Humidity: <div>${date.main.humidity} %</div></li>`
                        markerWeather += `</ul>`
                        markerWeather += `</div>`
                        // }
                    }
                });
                $('#five-day-forecast').html(markerWeather);
            }).fail(console.error);


        // coordinates.style.display = 'block';
        // coordinates.innerHTML = `Longitude: ${lngLat.lng}<br />Latitude: ${lngLat.lat}`;
    }

    marker.on('dragend', onDragEnd);


    //CREATED FUNCTIONS FOR INITIAL CITY AND ITS WEATHER CONDITIONS
    //renders city name in an h1 in div with #city
    function renderDivCity(cityName) {
        grabCityDiv.innerHTML =
            `<h1 class="city-title text-center">${cityName}</h1>`
    };

    //render current weather conditions
    function renderCurrentConditions(currentTemp, feelsLike, weatherDescription, windSpeed) {
        grabTodayWeather.innerHTML =
            `
                <div class="current-conditions card"
                <div class ="d-flex flex-column justify-center ">
                <h1 class="text-center">Current Temperature: ${currentTemp} F</h1>
                <div class="text-center">Feels like: ${feelsLike} F</div>
                <div class="text-center">${weatherDescription}</div>
                <div class="text-center">Wind: ${windSpeed} MPH</div>
                </div>
             `
    };


    //CALLS FUNCTIONS CREATED FOR INITIAL MAP TO PRINT CITY NAME AND CONDITIONS
//request data from API response and do something with the response
    $.ajax(URL).done(data => {
        //call function to get city name
        renderDivCity(data.city.name);
        //call function to print current weather conditions into #today-weather
        renderCurrentConditions(data.list[0].main.temp, data.list[0].main.feels_like, data.list[0].weather[0].description, data.list[0].wind.speed);

    }).fail(console.error);


//INITIAL CITY FIVE-DAY WEATHER FORECAST
//finds humidity, temp, and feels like for five days
    $.ajax(getWeatherURL(...ALAMO_COORDINATES))
        .done((data) => {
            //declare variable to hold current weather for initial city
            let currentCityWeather = []
            data.list.forEach((day, index) => {
                //for each day (each block goes by 3 hours, 24 hours in a day = 8 blocks)
                if (index % 8 === 0) {
                    //declare the constant minMaxTemps and set equal to function which gets info needed from api
                    const minMaxTemps = returnMinMaxTemps(data);
                    currentCityWeather += '<div class="five-day-card col-sm-12 col-md-6 col-lg-2">'
                    currentCityWeather += `<ul class="five-day-weather-items text-start">`
                    //declare constant and pass in the index of each 3-hour block and divide each by 8 to skip 24 hours
                    currentCityWeather += `<li>Date: <div>${minMaxTemps[index / 8].date}</div></li>`;
                    currentCityWeather += `<li>Minimum Temp: <div>${minMaxTemps[index / 8].min} F</div></li>`;
                    currentCityWeather += `<li>Maximum Temp: <div> ${minMaxTemps[index / 8].max} F</div></li>`;
                    //going to add multiple divs with data points into empty array
                    currentCityWeather += `<li>Today it is: <div>${day.weather[0].description}</div></li>`
                    currentCityWeather += `<li>Feels like: <div>${day.main.feels_like} F</div></li>`
                    currentCityWeather += `<li>Humidity: <div>${day.main.humidity} %</div></li>`
                    currentCityWeather += `</ul>`
                    currentCityWeather += `</div>`
                }
            });
            $('#five-day-forecast').html(currentCityWeather);
        }).fail(console.error);


/////   FUNCTIONS TO find min and max temps
    function returnMinMaxTemps({list}) {
        const minMaxTempDays = [];

        // loops through 40 three hour blocks of forecast and creates a new temperature object for each new day
        list.forEach(({dt_txt, main: {temp_max, temp_min}}) => {
            const [date, time] = dt_txt.split(' '); // splits the date time string
            if (minMaxTempDays.length === 0 || time.startsWith('00')) {
                // add a new forecast day for each new date
                minMaxTempDays.push({date, min: temp_min, max: temp_max});
            } else {
                // replace the current days min and max temps if a higher max or lower min is found throughout the day
                const currentMinMaxTemp = minMaxTempDays[minMaxTempDays.length - 1];
                const {min, max} = currentMinMaxTemp;
                if (min > temp_min) currentMinMaxTemp.min = temp_min;
                if (max < temp_max) currentMinMaxTemp.max = temp_max;
            }
        });

        return minMaxTempDays;
    };
//finds minimum and maximum temps for the next five days and uses above function to log info
    $.ajax(getWeatherURL(...ALAMO_COORDINATES))
        .done(data => {
            const minMaxTemps = returnMinMaxTemps(data);
            minMaxTemps.forEach(minMaxTemp => {
                console.log(minMaxTemp);
            });
        })
        .fail(console.error);
/////////////////       END OF FUNCTIONS to find min and max temps


//USER INPUT IN SEARCH BOX WILL ADJUST MAP AND FIVE-DAY FORECAST
//make search box work with user input
    $('#search-button').click(function () {
        //stores user search input into a variable
        const userInput = $('#search-input').val();

        //geocodes the coords for user search input
        geocode(userInput, MAPBOX_TOKEN).then((data) => {
            //makes a new popup and marker for user search input on map
            const popup = new mapboxgl.Popup()
            marker
                .setLngLat(data)
                .setPopup(popup)
                .addTo(map);
            popup.addTo(map);

            //gets map to redirect to users search input city
            map.flyTo({
                center: data,
                zoom: 14,
                speed: 1,
                essential: true
            })

            //FIVE-DAY FORECAST FOR USER SEARCH INPUT
            // ajax request (getWeatherURL(data: gets coords but need to flip the lat & lon.))
            $.ajax(getWeatherURL(data[1], data[0]))
                .done((data) => {
                    //what response API is giving for user input in search bar
                    console.log(data);

                    let html = []

                    //create new variable to store info to print onto webpage from forEach loop
                    //loop through data list by each day
                    data.list.forEach((day, index) => {
                        //for each day (each block goes by 3 hours, 24 hours in a day = 8 blocks)
                        if (index % 8 === 0) {
                            //declare the constant minMaxTemps and set equal to function which gets info needed from api
                            const minMaxTemps = returnMinMaxTemps(data);
                            //call constant html and pass in the index of each 3-hour block and divide each by 8 to skip 24 hours
                            html += '<div class="five-day-card">'
                            html += `<ul class="five-day-weather-items">`
                            html += `<li>Date: <div>${minMaxTemps[index / 8].date}</div></li>`;
                            html += `<li>Minimum Temp: <div>${minMaxTemps[index / 8].min} F</div></li>`;
                            html += `<li>Maximum Temp: <div>${minMaxTemps[index / 8].max} F</div></li>`;
                            //going to add multiple divs with data points into empty array
                            html += `<li>Today it is: <div>${day.weather[0].description}</div></li>`
                            html += `<li>Feels like: <div>${day.main.feels_like} F</div></li>`
                            html += `<li>Humidity: ${day.main.humidity} %</li>`
                            html += `</ul>`
                            html += `</div>`

                        }
                    });
                    //add html array data into html of div with ID of five-day-forecast
                    $('#five-day-forecast').html(html);

                    //changes city name into user input
                    renderDivCity(data.city.name);

                    // changes current weather div to city user searched
                    renderCurrentConditions(data.list[0].main.temp, data.list[0].main.feels_like, data.list[0].weather[0].description, data.list[0].wind.speed);

                })
                .fail(console.error);
        });

    });


//PRESSING GO TO THE SHIRE WILL GO TO THE SHIRE
    //BULLETS DO NOT CHANGE CURRENTLY! WILL CONTINUE WORKING ON FUNCTIONALITY OF BUTTON
    $('#go-to-shire').click(function goToTheShire() {
        $('.page-wrapper').css('background-image', 'url( "../css/img/the-shire.jpg")');
        // $('.five-day-weather-items').attr("src",  "../img/lotr-ring-logo.jpg");
        $(".logo").attr("src", "../css/img/eye-lord-GIF-unscreen.gif").addClass("sauron-logo");
        $(".text-center").addClass("lotr-current-weather");

        console.log('inside the function');
        //geocodes the coords for Tongoriro National Park New Zealand
        geocode('Tongoriro National Park New Zealand', MAPBOX_TOKEN).then((data) => {
            //makes a new popup and marker for user search input on map
            const popup = new mapboxgl.Popup()
            marker
                .setLngLat(data)
                .setPopup(popup)
                .addTo(map);
            popup.addTo(map);

            //gets map to redirect to new zealand
            map.flyTo({
                center: data,
                zoom: 14,
                speed: 1,
                essential: true
            })


            //FIVE-DAY FORECAST FOR tongariro natl park new zealand
            // ajax request (getWeatherURL(data: gets coords but need to flip the lat & lon.))
            $.ajax(getWeatherURL(data[1], data[0]))
                .done((data) => {
                    //what response API is giving for tongoriro natl park
                    console.log(data);

                    let html = []

                    //create new variable to store info to print onto webpage from forEach loop
                    //loop through data list by each day
                    data.list.forEach((day, index) => {
                        //for each day (each block goes by 3 hours, 24 hours in a day = 8 blocks)
                        if (index % 8 === 0) {
                            //declare the constant minMaxTemps and set equal to function which gets info needed from api
                            const minMaxTemps = returnMinMaxTemps(data);
                            //call constant html and pass in the index of each 3-hour block and divide each by 8 to skip 24 hours
                            html += '<div class="five-day-card">'
                            html += `<ul class="five-day-weather-items">`
                            html += `<li class="change-lotr">Date: <div>${minMaxTemps[index / 8].date}</div></li>`;
                            html += `<li class="change-lotr">Minimum Temp: <div>${minMaxTemps[index / 8].min} F</div></li>`;
                            html += `<li class="change-lotr">Maximum Temp: <div>${minMaxTemps[index / 8].max} F</div></li>`;
                            //going to add multiple divs with data points into empty array
                            html += `<li class="change-lotr">Today it is: <div>${day.weather[0].description}</div></li>`
                            html += `<li class="change-lotr">Feels like: <div>${day.main.feels_like} F</div></li>`
                            html += `<li class="change-lotr">Humidity: ${day.main.humidity} %</li>`
                            html += `</ul>`
                            html += `</div>`

                        }
                    });
                    //add html array data into html of div with ID of five-day-forecast
                    $('#five-day-forecast').html(html);

                    //changes city name into natl park
                    renderDivCity(data.city.name);

                    // changes current weather div to natl park
                    renderCurrentConditions(data.list[0].main.temp, data.list[0].main.feels_like, data.list[0].weather[0].description, data.list[0].wind.speed);

                })
                .fail(console.error);
        });
    });


///////////////////////////    EVENTS      /////////////////////////////////////////////

    //make this query selector use the users click target on the map find the weather for the city closest to the marker
    document.querySelector('#go-to-shire').addEventListener('click', goToTheShire)

///////////////     LOAD ASAP      //////////////////////////////
    marker.setPopup(popup);


});