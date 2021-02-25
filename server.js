'use strict';

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// create the server
const app = express();

// the backend server will parse json, not a form request
app.use(bodyParser.json());

// mock events data - for a real solution this data should be coming 
// from a cloud data store
const mockEvents = {
    events: [
        { 
            title: 'an event', 
            id: 1, 
            description: 'something really cool', 
            location: "The House", 
            time: "4:30PM",
            priority: "low" 
        },
        { 
            title: 'another event', 
            id: 2, 
            description: 'something even cooler', 
            location: "Batcave", 
            time: "8:00PM",
            priority: "medium"
        },
        { 
            title: 'The Joker Attacks event', 
            id: 2, 
            description: 'Joker robs Gotham bank', 
            location: "Gotham Bank & Trust", 
            time: "The Witching Hour",
            priority: "high"
        }
    ]
};




// health endpoint - returns an empty array
app.get('/', (req, res) => {
    res.json([]);
});

// version endpoint to provide easy convient method to demonstrating tests pass/fail
app.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});


// mock events endpoint. this would be replaced by a call to a datastore
// if you went on to develop this as a real application.
app.get('/events', (req, res) => {
    res.json(mockEvents);
});

// Adds an event - in a real solution, this would insert into a cloud datastore.
// Currently this simply adds an event to the mock array in memory
// this will produce unexpected behavior in a stateless kubernetes cluster. 
app.post('/event', (req, res) => {
    // create a new object from the json data and add an id
    const ev = { 
        title: req.body.title, 
        description: req.body.description,
        location: req.body.title,
        time: req.body.time,
        priority: req.body.priority,
        id : mockEvents.events.length + 1
     }
     console.log(ev);
    // add to the mock array
    mockEvents.events.push(ev);
    // return the complete array
    res.json(mockEvents);
});

app.post('/delete', (req, res) => {
    let id = req.body.id;
    // delete from the mock array
    for(let i=0; i< mockEvents.events.length; i++){
        if (mockEvents.events[i].id == id) {
            console.log('found');
            mockEvents.events.splice(i, 1);
        }
    }
    // return the complete array
    res.json(mockEvents);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

const PORT = 8082;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;