#TheLightingControllerClient
--

A node.js client library for communicating with The Lighting Controller software products (ShowXpress, QuickDmx, and SweetLight).  This library is not created, supported, or endorsed by Chauvet, Showtec, SweetLight, or The Lighting Controller.

This was created using The Lighting Controller's publically documented [Protocol Definition](http://download.thelightingcontroller.com/software/External_Application/Protocol.pdf).


##Install
``$ npm install thelightingcontrollerclient``


##Example

```js
//import the client
const LightingController = require('thelightingcontrollerclient');

//create a new instance of the client
const myCtrl = new LightingController({
	password: '1234'
});

//subscribe to certain events, for a full list of events, see below
myCtrl.on('connected', () => {
	myCtrl.buttonList(); //get the button list
});

//the client is an instance of [EventEmitter2](https://github.com/asyncly/EventEmitter2). You can use onAny to subscribe to all events and click around in Live to see what is sent to the client.
myCtrl.onAny((event, value) => {
	console.log(event, value);
});
```


##Events


###connected
The client has connected and successfully authenticated with Live.

 
```js
 	myCtrl.on('connected', () => {
	});
```


###disconnected
The client has disconnected from Live.

```js
	myCtrl.on('disconnected', () => {
	});
```


###error
The client has encoutered an error.

```js
	myCtrl.on('error', (errorObject) => {
		//errorObject will be an object containing:
		{
			type: String, // one of: 'BAD PASSWORD', 'SOCKET', 'BUTTON LIST XML PARSE FAILED', 'UNKNOWN ERROR'
			error: Object, // the original error object thrown by whatever encountered the error, not all errors have this property
			data: Mixed // the data that was being processed when the error occured, not all errors have this property
		}
	
	});
```


###unknownEvent
The client encountered a socketMessage it was unable to parse.  Could potentially occur if Live is upated and the client library has yet to be updated to support new events.  Allows for parsing the message manually.

```js
	myCtrl.on('unknownEvent', (socketMessage) => {
	});
```


###bpm
The client recieved a request for the current BPM.  Use .bpm(Number) to respond.

```js
	myCtrl.on('bpm', () => {
	});
```


###beatOn
The client recieved a signal that it can start sending real time beats for live to use in BPM calculations. Use .beat() to respond.  *Note* The AutoBPM feature of the Live software only works on a PC.

```js
	myCtrl.on('beatOn', () => {
	});
```


###beatOff
The client recieved a signal that it should stop sending real time beats.  *Note* The AutoBPM feature of the Live software only works on a PC.

```js
 	myCtrl.on('beatOff', () => {
	});
```


###buttonList
The client recieved a response to calling .buttonList() containing the Live button and master faders list.

```js
	myCtrl.on('buttonList', (buttonListObject) => {
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
 	myCtrl.on('buttonPress', (buttonName) => {
 		//String buttonName The name of the button that was pressed
	});
```


###buttonRelease
A button was released

```js
 	myCtrl.on('buttonPress', (buttonName) => {
		//String buttonName The name of the button that was released
	});
```


###faderChange
A fader was moved in value.

```js
 	myCtrl.on('faderChange', (faderObject) => {
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
 	myCtrl.on('interfaceChange', () => {
	});
```


##Bugs in the Live Software
---

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



##Unknown Features
---

I need to test these on a PC (where AutoBPM works)

- Sending BEAT event does nothing? (windows only??)
- Have not seen a BPM or BEAT_OFF message (windows only??)
