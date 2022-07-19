const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios')

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/status', (request, response) => response.json({ clients: clients.length }));
app.get('/events', eventHandler);
app.post('/fact', addFact);

const PORT = 3001;

let clients = [];
let facts = [];

app.listen(PORT, () => {
    console.log(`Facts Events service listening at http://localhost:${PORT}`)
})

function eventHandler(request, response, next) {
    // console.log(request)

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    }
    response.writeHead(200, headers)

    const data = `data: ${JSON.stringify(facts)}`

    response.write(data)

    const clientId = Date.now()

    const newClient = {
        id: clientId,
        response
    }

    clients.push(newClient)

    request.on('close', () => {
        console.log(`${clientId} connection closed`);
        clients = clients.filter(client => client.id != clientId);
    });
}

function sendEventsToAll(newFact) {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(newFact)}\n\n`));
}

async function addFact(request, response, next) {
    const newFact = request.body;
    console.log(newFact)

    facts.push(newFact)
    response.json(newFact)
    return sendEventsToAll(newFact)
}

//// SEND FACTS

let count 
let source = 'Math.random'
setInterval(() => {
    console.log(new Date().toString(), "////////count")
    try {
        count = Math.floor(Math.random() * 100) 
        
        var config = {
            method: 'post',
            url: 'http://localhost:3001/fact',
            headers: {
                'Content-Type': 'application/json'
            },
            data: [{"info": `happy number #${count}`, "source": source}]
        };

        axios(config)
    } catch (error) {
        console.log(error)
    }

}, 5000);
