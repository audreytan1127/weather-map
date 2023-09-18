$(() => {

    //Global Variables

    //loads map
    const map = initializeMap();

    //markers created will be stored into variable marker
    const marker = createMarker();

    //popups created will be stored into variable popup
    const popup = createPopup();



    //Functions

    //function that initializes the map to center on codeup (class exercise)
    function initializeMap() {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const mapOptions = {

            //only accepts ID so no need for hashtag
            container: 'map',

            style: 'mapbox://styles/mapbox/streets-v12', //style URL (there are predefined styles)

            zoom: 10, //zoom it starts at

            center: [-98.4912, 29.4252], //starting coordinates at codeup SA
        }
        return new mapboxgl.Map(mapOptions); //created new map object and stored global variable
    }



    // //function to make a marker for codeup (class exercise)
    function createMarker() {

        //function that creates a marker at codeup
        return new mapboxgl.Marker()

            //sets the coords for codeup
            .setLngLat([-98.4912, 29.4252])

            //adds marker to map
            .addTo(map);

    }



// //function to create a popup for codeup (class exercise)
    function createPopup() {

        //creates popup
        return new mapboxgl.Popup()

            //sets coords at codeup
            .setLngLat([-98.4912, 29.4252])

            //adds html elements to popup and prints content into popup
            .setHTML(`
            <div>
            <h1>Codeup</h1>
            <p> Here is codeup!</p>
            </div>
`);
    }




//function that brings center of map to Paris
    function goToParis() {

        //geocode takes in ('place', token) and like ajax.done(), the .then((response) =>{code for what to do with data})
        geocode('Paris', MAPBOX_TOKEN).then((data) => {

            //console logs coords of paris
            console.log(data);

            //brings paris to the center of the map
            map.setCenter(data);
        })
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

    //function that uses the mapbox API geocode function to take in the string 'the alamo, san antonio' to mark the alamo
    //get coords to set a marker and popup at that location
    function markAlamo() {

        //geocode finds the alamo in san antonio
        geocode('The Alamo, San Antonio', MAPBOX_TOKEN).then((data) => {

            //declare variable that creates a new popup for the alamo
            const alamoPopup = new mapboxgl.Popup()

                //sets the text in the popup
                .setHTML(`<p>Remember the Alamo</p>`);

            //creates the variable for the alamo marker
            const alamoMarker = new mapboxgl.Marker()

                //sets the coords with the data extrapolated from geocode
                .setLngLat(data)

                //adds the marker to the map
                .addTo(map)

                //sets the popup text to popup along with the marker
                .setPopup(alamoPopup);

            //sets the popup to appear on the map when button is pressed
            alamoPopup.addTo(map);
        });
    }




    //Events

    //when button 'take me to paris' is pressed: centers paris on the map thru function goToParis
    document.querySelector('#geocode-button').addEventListener('click', goToParis);

    //when button 'show address' is pressed : prints the center location's address into the h1
    //thru function findAndPrintAddress
    document.querySelector('#reverse-geocode-button').addEventListener('click', findAndPrintAddress)

    //when button 'mark the alamo' is pressed: marker and popup for the alamo comes up onto map
    //thru function markAlamo
    document.querySelector('#mark-alamo').addEventListener('click', markAlamo);




    //Runs when program loads

    //sets the beginning zoom to 10, enough to see dt SA
    map.setZoom(10);

    //sets popup to work when marker is clicked
    marker.setPopup(popup);



});