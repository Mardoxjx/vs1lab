/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };



    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier API Key eintragen
    var apiKey = "9uPJBG9Pa98o0gj4RLDppSGbbOrq6Hrt";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        var : getGetLocationMapSrc = function(lat, long, tags, zoom){
            return getLocationMapSrc(lat, long, tags, zoom);
        },


        updateLocation: function() {
            var error = function(errorCode){
                alert(errorCode);
            }


            function success(position){
                document.getElementById("longitude").value = getLongitude(position);
                document.getElementById("latitude").value = getLatitude(position);

                var taglist_json = document.getElementById("result-img").getAttribute("data-tags");
                taglist_json = taglist_json.substring(0,taglist_json.length-1);
                var taglist_array = JSON.parse(taglist_json);
                var url = getLocationMapSrc(getLatitude(position), getLongitude(position), taglist_array);
                document.getElementById("result-img").src = url;

                document.getElementById("discoveryLongitude").value = getLongitude(position);
                document.getElementById("discoveryLatitude").value = getLatitude(position);

            };
            function error(errorMessage) {
                alert(errorMessage);

            };


            if(!document.getElementById("latitude").value || !document.getElementById("longitude").value) {
                tryLocate(success, error);
            }
            else {
                var taglist_json = document.getElementById("result-img").getAttribute("data-tags");
                taglist_json = taglist_json.substring(0, taglist_json.length - 1);
                var taglist_array = JSON.parse(taglist_json);
                var url = getLocationMapSrc(document.getElementById("latitude").value,document.getElementById("longitude").value , taglist_array);
                document.getElementById("result-img").src = url;
            }



        }

    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);


/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
    gtaLocator.updateLocation();
    document.getElementById("tagging-button").addEventListener("click", ajaxTagging);
    document.getElementById("search-term-button").addEventListener("click", ajaxDiscovery);

    // TODO Hier den Aufruf für updateLocation einfügen
});

function ajaxTagging() {
    console.log("ajax tagging");
    var data = {
        latitude : document.getElementById("latitude").value,
        longitude : document.getElementById("longitude").value,
        name : document.getElementById("name").value,
        hashtag : document.getElementById("hashtag").value
    };
    data = JSON.stringify(data);
    var ajax = new XMLHttpRequest();


    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            ajaxDiscovery(false);

            //TODO
        }
    }

    ajax.open("POST", "/geotags", true);//TODO

    ajax.setRequestHeader("Content-type","application/json");
    ajax.send(data);

}

function ajaxDiscovery(filterOn=true) {
    console.log("ajax discovery")
    var ajax = new XMLHttpRequest();
    if(!filterOn){
        document.getElementById("search-term").value = "";
    }

    var data = {
        latitude: document.getElementById("discoveryLatitude").value,
        longitude: document.getElementById("discoveryLongitude").value,
        name: document.getElementById("search-term").value
    }

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            var parsedData = JSON.parse(ajax.responseText);
            console.log("parsed Data: " + parsedData + typeof(parsedData));
            console.log("response Text: " + ajax.responseText + typeof(ajax.responseText));
            updateList(parsedData);

        }
    }
    if(!data.name){
        ajax.open("GET", `/geotags`, true);
    }
    else {
        ajax.open("GET", `/geotags?name=${data.name}&latitude=${data.latitude}&longitude=${data.longitude}`, true);
    }
    ajax.send();

}

function updateList(arr){
    console.log("updateList");
    console.log("array lenght: " + arr.length);
    var resultContainer = document.getElementById("results");
    resultContainer.innerHTML = "";
    for(var i = 0; i<arr.length; i++){
        var li = updateList2(arr[i].name, arr[i].latitude, arr[i].longitude, arr[i].hashtag);
        resultContainer.appendChild(li);
    }
    var url = getGetLocationMapSrc(arr[0].latitude, arr[0].longitude, arr);
    document.getElementById("result-img").src = url;

}

function updateList2(name,latitude,longitude,hashtag){
    console.log("updateList2");
    var newLi = document.createElement("li");
    newLi.textContent = (name + " (" + latitude + ", " + longitude + ") " + hashtag);
    return newLi;
}