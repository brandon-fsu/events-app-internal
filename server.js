'use strict';

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

const Firestore = require("@google-cloud/firestore");

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
// create the server
const app = express();

// the backend server will parse json, not a form request
app.use(bodyParser.json());

const firestore = new Firestore(
    {
        projectId: process.env.GOOGLE_CLOUD_PROJECT
    }
)

// mock events data - for a real solution this data should be coming 
// from a cloud data store
var mockEvents = {
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
    // res.json(mockEvents);
    getEvents(req, res);
});

// Adds an event - in a real solution, this would insert into a cloud datastore.
// Currently this simply adds an event to the mock array in memory
// this will produce unexpected behavior in a stateless kubernetes cluster. 
app.post('/event', (req, res) => {
    // create a new object from the json data and add an id
    const ev = { 
        title: req.body.title, 
        description: req.body.description,
        location: req.body.location,
        time: req.body.time,
        priority: req.body.priority,
        id : uuidv4()
     }
     console.log(ev);
     firestore.collection("Events").add(ev).then(ret =>{
         getEvents(req, res);
     });
    // add to the mock array
    // mockEvents.events.push(ev);
    // return the complete array
    // res.json(mockEvents);
});

app.post('/delete', (req, res) => {
    let id = req.body.id;
    // delete from the mock array
    console.log('start delete');
    const events_coll = firestore.collection('Events');
    const doc_query = events_coll.where('id', '==', id);
    // console.log(doc_query)
    doc_query.get().then((querySnapshot)=>{
        console.log(querySnapshot);
        querySnapshot.forEach((doc) => {
            doc.ref.delete().then(ret =>{
                getEvents(req, res);
                });
            });
    });   
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

function getEvents(req, res) {
    firestore.collection("Events").get()
        .then((snapshot) => {
            if(!snapshot.empty) {
                const ret = {events: []};
                snapshot.docs.forEach(element => {
                    ret.events.push(element.data());
                }, this);
                console.log(ret)
                res.json(ret);
                mockEvents = ret;
            } else {
                res.json(mockEvents);
            }
        })
        .catch((err) => {
            console.error('Error getting events', err);
            res.json(mockEvents);
        });
};

const PORT = 8082;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;