#thelightingcontrollerclient

A node.js client library for communicating with The Lighting Controller software products (ShowXpress, QuickDmx, and SweetLight).  This library is not created, supported, or endorsed by Chauvet, Showtec, SweetLight, or The Lighting Controller.

This was created using The Lighting Controller's publicly documented [Protocol Definition](http://download.thelightingcontroller.com/software/External_Application/Protocol.pdf).


1. [Install](#install)
2. [Example](#example)
3. [Instantiation](#instantiation)
4. [Methods](#methods)
 - [client.connect](#clientconnect)
 - [client.autoBpmOn](#clientautobpmon)
 - [client.autoBpmOff](#clientautobpmoff)
 - [client.beat](#clientbeat)
 - [client.bpm](#clientbpmnumber-beatsperminute)
 - [client.buttonList](#clientbuttonlist)
 - [client.buttonPress](#clientbuttonpressstring-buttonname)
 - [client.buttonRelease](#clientbuttonreleasestring-buttonname)
 - [client.buttonToggle](#clientbuttontogglestring-buttonname)
 - [client.cue](#clientcuestring-cuename)
 - [client.freeze](#clientfreeze)
 - [client.unfreeze](#clientunfreeze)
 - [client.faderChange](#clientfaderchangestring-fadername-number-fadervalue)
5. [Events](#events)
 - [connected](#connected)
 - [disconnected](#disconnected)
 - [error](#error)
 - [beatOn](#beaton)
 - [beatOff](#beatoff)
 - [bpm](#bpm)
 - [buttonList](#buttonlist)
 - [buttonPress](#buttonpress)
 - [buttonRelease](#buttonRelease)
 - [faderChange](#faderchange)
 - [interfaceChange](#interfacechange)
 - [unknownEvent](#unknownevent)
6. [Development](#development)
7. [Known Live Bugs](#bugs-in-the-live-software)
8. [Unknown Features](#unknown-features)


# Install
``$ npm install thelightingcontrollerclient``


---


# Example

```js
//import the client
const LightingController = require('thelightingcontrollerclient');

//create a new instance of the client
const client = new LightingController({
	password: '1234'
});

//subscribe to certain events, for a full list of events, see below
client.on('connected', () => {
	client.buttonList(); //get the button list
});

//print to console when we get the buttons
client.on('buttonList', (buttons) => {
	console.log(JSON.stringify(buttons, null, 2));
});
```

The client is an instance of [EventEmitter2](https://github.com/asyncly/EventEmitter2). You can use onAny to subscribe to all events and click around in Live to see what is sent to the client.  This also allows for usage of methods like .once, .many, .removeAllListeners, and all other EventEmitter2 methods.  See the EventEmitter2 docs for a list of methods for interacting with the EventEmitter.

```js
client.onAny((event, value) => {
	console.log(event, value);
});
```


---


# Instantiation

When creating an instance of the client, you should pass a configuration object.  The following defaults have been configured, you should pass any properties that you need to overwrite.

```js
const LightingController = require('thelightingcontrollerclient');
const client = new LightingController({
	port: 7348,
	ip: '127.0.0.1',
	extApp: 'thelightingcontrollerclient',
	password: ''
});
```


---


# Methods

###client.connect()
Establishes a connection to the Live application.  On success, will fire a 'connected' event

```js
 	client.connect();
```


###client.autoBpmOn()
Enables Automatic BPM detection.

```js
 	client.autoBpmOn();
```


###client.autoBpmOff()
Disables Automatic BPM detection.

```js
 	client.autoBpmOff();
```


###client.beat()
Increments the beat in the "auto BPM" section of Live.
Send after receiving 'beatOn' event from Live and stop sending after receiving a 'beatOff' event.

```js
 	client.beat();
```


###client.bpm(Number beatsPerMinute)
Assigns the new BPM value in the "manual BPM" section of Live.
Send at each song start or when recieving a 'bpm' event from Live.

```js
 	client.bpm(120);
```


###client.buttonList()
Send to ask Live for the button and master faders list.  On success, will fire a 'buttonList' event

```js
 	client.buttonList();
```


###client.buttonPress(String buttonName)
Send to press the button with the name {buttonName} in Live.

```js
 	client.buttonPress('button one');
```


###client.buttonRelease(String buttonName)
Send to release the button with the name {buttonName} in Live.

```js
 	client.buttonRelease('button one');
```


###client.buttonToggle(String buttonName)
Send to toggle the button with the name {buttonName} in Live.  This is an alias of .cue()

```js
 	client.buttonToggle('button one');
```


###client.cue(String cueName)
Send to toggle the button with the name {buttonName} in Live.  This is an alias of .buttonToggle()

```js
 	client.cue('button one');
```


###client.freeze()
Send to Freeze the Live board

```js
 	client.freeze();
```


###client.unfreeze()
Send to Un-Freeze the Live board

```js
 	client.unfreeze();
```


###client.faderChange(String faderName, Number faderValue)
Send to change the position of the {faderName} fader in Live to {faderValue}.  {faderValue} is a percentage between -100 and 100

```js
 	client.faderChange('fader one', 50);
```


---


# Events

###connected
The client has connected and successfully authenticated with Live.
 
```js
 	client.on('connected', () => {
	});
```


###disconnected
The client has disconnected from Live.

```js
	client.on('disconnected', () => {
	});
```


###error
The client has encoutered an error.

All errorObjects will have a `type`, one of:
- **BAD PASSWORD** - Response from Live that the password for Live was invalid
- **SOCKET** - The client was unable to establish a connection to Live
- **BUTTON LIST XML PARSE FAILED** - The client recieved an xml response from Live that it was unable to parse
- **UNKNOWN ERROR** - The client threw an error but was unable to determine the type.  Check the other properties of the error object to determine what went wrong.
- **CLIENT ERROR** - Data passed to a method was invalid and was not sent to Live.  The ``error`` proprty will contain a human-readable definition of the error.

errorObjects may also contain an `error` property. This is the original error object thrown by whatever encountered the error.  Not all errors have this property

errorObjects may also contain a `data` property. This is the data that was being processed when the error occured.  Not all errors have this property.

```js
	client.on('error', (errorObject) => {
		//example errorObject for calling client.bpm(-100);
		{
			type: 'CLIENT ERROR',
			error: 'invalid bpm value',
			data: -100
		}
	
	});
```


###beatOn
The client recieved a signal that it can start sending real time beats for live to use in BPM calculations. Use .beat() to respond.  *Note* The AutoBPM feature of the Live software only works on a PC.

```js
	client.on('beatOn', () => {
	});
```


###beatOff
The client recieved a signal that it should stop sending real time beats.  *Note* The AutoBPM feature of the Live software only works on a PC.

```js
 	client.on('beatOff', () => {
	});
```


###bpm
The client recieved a request for the current BPM.  Use .bpm(Number) to respond.

```js
	client.on('bpm', () => {
	});
```


###buttonList
The client recieved a response to calling .buttonList() containing the Live button and master faders list.

```js
	client.on('buttonList', (buttonListObject) => {
		//example buttonListObject:

		{
		   	pages: [
		        {
		            name: String
		            columns: Number
		            columnButtons: {
						1: Number,
						2: Number,
						.
						.
						.
		            },
		            buttons [
		            	{
			            	name: String,
			            	index: Number,
			            	flash: Boolean,
			            	pressed: Boolean,
			            	line: Number,
			            	column: Number,
			            	color: String (hex ex #000000)
			            },
			            .
			            .
			            .
			        ]
		        },
		        .
		        .
		        .
		    ],
			faders: [
				{
		            name: String,
		            value: Boolean
		        },
		        .
		        .
		        .
		    ]
		}
	});
```


###buttonPress
A button was pressed

```js
 	client.on('buttonPress', (buttonName) => {
 		//String buttonName The name of the button that was pressed
	});
```


###buttonRelease
A button was released

```js
 	client.on('buttonPress', (buttonName) => {
		//String buttonName The name of the button that was released
	});
```


###faderChange
A fader was moved in value.

```js
 	client.on('faderChange', (faderObject) => {
		//Example faderObject:
		{
			name: String,
			value: Number
		}
	});
```
		

###interfaceChange
The interface has changed in the Live software - generally a hint to call .buttonList()

```js
 	client.on('interfaceChange', () => {
	});
```


###unknownEvent
The client encountered a socketMessage it was unable to parse.  Could potentially occur if Live is upated and the client library has yet to be updated to support new events.  Allows for parsing the message manually.

```js
	client.on('unknownEvent', (socketMessage) => {
		//the raw socket message.  See the Protocol Definition for parsing information.
	});
```


---


# Development

[![Build Status](https://travis-ci.org/Tidwell/thelightingcontrollerclient.svg?branch=master)](https://travis-ci.org/Tidwell/thelightingcontrollerclient)

Clone the repo

```bash
	$ git clone https://github.com/Tidwell/thelightingcontrollerclient.git
```

Run tests

```bash
	$ npm test
```

Run coverage report

```bash
	$ npm run-script coverage
```


---


# Bugs in the Live Software


A bug report has been opened for these issues with TheLightingController, but until they are fixed in the software, you may encounter these issues:

- Adjusting a fader on a client app does not re-broadcast a FADER_CHANGE event (it does broadcast if a fader changes using Live)

- client Freeze event is not documented
	'FREEZE_ON'
	'FREEZE_OFF'
	
- Freeze event is not broadcast or re-broadcast.  (sending FREEZE_ON or FREEZE_OFF from a client app does not send a event to other client apps AND toggling FREEZE in Live does not send an event to client apps)

- client AutoBPM event is not documented
	'AUTO_BPM_ON'
	'AUTO_BPM_OFF'

- AutoBPM toggle event is not broadcast or re-broadcast.  (sending AUTO_BPM_ON or AUTO_BPM_OFF from a client app does not send an event to other client apps AND toggling AUTOBPM in Live does not send an event to client apps)


---


# Unknown Features
---

I need to test these on a PC (where AutoBPM works)

- Sending BEAT event does nothing? (windows only??)
- Have not seen a BPM or BEAT_OFF message (windows only??)
