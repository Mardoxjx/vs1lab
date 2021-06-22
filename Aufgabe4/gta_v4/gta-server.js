/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false

}));


// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static('public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function GeoTag(name, latitude, longitude, hashtag){
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;

}


// TODO: CODE ERGÄNZEN

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */
var speicher = [];

function searchByRadius(radius, latitude, longitude){
    var array = [];
    var j = 0;

    for(var i = 0; i<speicher.length; i++){
        var y = Math.abs(speicher[i].latitude - latitude);
        var x = Math.abs(speicher[i].longitude - longitude);
        var abstand = Math.sqrt(x*x + y*y);
        if(abstand <= radius){
            array[j] = speicher[i];
            j++;
        }
    }
    return array;
}
function searchByName(name){
    var array = [];
    var j = 0;
    for(var i = 0; i<speicher.length; i++){
        var bool = name === speicher[i].name;
        if(bool){
            array[j] = speicher[i];
            j++;
        }

    }
    return array;
}

function addGeoTag(geoTag_Element){
    speicher.push(geoTag_Element);
}

function removeGeoTag(geoTag_Element){
    for(var i = 0; i < speicher.length; i++){
        if(geoTag_Element === speicher[i]){
          speicher.splice(i);
        }
    }
}


// TODO: CODE ERGÄNZEN

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: speicher,
        latitude: [],
        longitude: [],
        name: [],
        hashtag: []

    });
});


/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */
const radius = 100;
const defLat = 48.963758399999996;
const defLong = 8.6104901;

// TODO: CODE ERGÄNZEN START
app.post('/tagging', function(req, res,next){
    var geoTag = new GeoTag(req.body.name, req.body.latitude, req.body.longitude,req.body.hashtag);
    addGeoTag(geoTag);
    var arr = [];
    arr = searchByRadius(radius, req.body.latitude || defLat, req.body.longitude || defLong);
    res.render('gta', {
        taglist: arr,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        name: req.body.name,
        hashtag: req.body.hashtag

    });
});


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN
app.post('/discovery', function(req, res){
    var arr = [];
    if(req.body != undefined){
        arr = searchByName(req.body.box);
    }
    else{
        arr = searchByRadius(radius, req.body.dLat || defLat, req.body.dLong || defLong);
    }
    res.render('gta', {
        taglist: arr,
        longitude: [],
        latitude:[],
        name:[],
        hashtag:[]
    });

});

let geotags = [];

let id = 0;

// /geotags POST
app.post('/geotags' ,function (req,res){
    geotags.push({
        id : id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        name: req.body.name,
        hashtag: req.body.hashtag
    });
    id++;
    res.status(201);
    res.end();

});


// /geotags GET
app.get('/geotags' ,function (req,res){
    if(!req.query.name){
        res.json(geotags);
    }
    else{
        var dataName = req.query.name;
        var arr = [];
        var j = 0;
        for(var i = 0; i<geotags.length;i++){
            if(geotags[i].name == dataName){
                arr[j] = geotags[i];
                j++;
            }
        }
        res.json(arr);
    }
    res.status(202);
    res.end();

});

app.get('/geotags/:id', function (req,res){
    var id = req.params.id;
    var result;
    for(var i = 0; i<geotags.length;i++){
        if(geotags[i].id == id){
            result = geotags[i];
        }
    }
    res.json(result);
    res.status(202);
    res.end();
});

app.put('/geotags/:id', function (req,res){
    var id = req.params.id;
    for(var i = 0; i<geotags.length;i++){
        if(geotags[i].id == id){
            geotags[i] = {
                id : id,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                name: req.body.name,
                hashtag: req.body.hashtag
            };

        }
    }

    res.status(202);
    res.end();

});

app.delete('/geotags/:id', function (req,res){
    //TODO
    var id = req.params.id;
    for(var i = 0; i<geotags.length;i++) {
        if (geotags[i].id == id) {
            geotags.splice(i, 1);
        }
    }
    res.status(202);
    res.end();
});











/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
