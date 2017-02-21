//import the client
const LightingController = require('../');

//create a new instance of the client
const client = new LightingController({
    password: '1234'
});

//subscribe to certain events, for a full list of events, see below
client.on('connected', () => {});

client.onAny((event, value) => {
    console.log(event, value);
});

client.connect();
