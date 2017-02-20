const CRLF = '\u000d\u000a';
const SEPARATOR = '|';

var net = require('net');
const EventEmitter2 = require('eventemitter2').EventEmitter2;
const merge = require('utils-merge');
const xmlStringParser = require('xml2js').parseString;

/**
 * LightingController
 *
 * emits:
 * 	- connected
 * 	- disconnected
 *  - error
 *  	'BAD PASSWORD'
 *  	'SOCKET'
 *  	'BUTTON LIST XML PARSE FAILED'
 *  	'UNKNOWN ERROR'
 *  - unknownEvent
 *  
 *  - bpm
 *  - beatOn
 *  - beatOff
 *  - buttonList
 *  - buttonPress
 *  - buttonRelease
 *  - faderChange
 *  - interfaceChange
 */
class LightingControllerEmitter extends EventEmitter2 {
	constructor(args) {
		const defaultSettings = {
			port: 7348,
			ip: '127.0.0.1',
			extApp: 'thelightingcontrollerclient',
			password: ''
		};
		super();
		this.settings = merge(defaultSettings, args);
		this.bufferedData = '';
	}

	connect() {
		this.client = new net.Socket();
		this.client.setEncoding('utf8');
		this.client.on('data', data => this.onSocketData(data));
		this.client.connect(this.settings.port, this.settings.ip, () => this.hello());
		this.client.on('close', () => this.onSocketClose());
		this.client.on('error', error => this.onSocketError(error));
	}

	onSocketData(data) {
		this.bufferedData += data;
		this.checkParse();
	}

	onSocketClose() {
		this.connected = false;
		this.emit('disconnected');
	}

	onSocketError(error) {
		this.emit('error', {
			type: 'SOCKET',
			error: error
		})
	}

	sendSocketMessage(message) {
		this.client.write(message + CRLF);
	}

	checkParse() {
		const lineEnd = this.bufferedData.indexOf(CRLF);
		if (lineEnd > -1) {
			this.extractLine(lineEnd);
			//check again if we had a line to parse
			this.checkParse();
		}
	}

	extractLine(lineEnd) {
		const line = this.bufferedData.substring(0, lineEnd);
		this.bufferedData = this.bufferedData.slice(lineEnd + CRLF.length);
		this.parseLine(line);
	}

	/**
	 * parseLine
	 * @param  {string} line the line to parse
	 *
	 * Network messages sent by Live application :
	 *	- "BPM" : Sent to the external application to ask the current BPM.
	 *	Response of the external application : "BPM|{bpm}".
	 
	 *	- "BEAT_ON" / “BEAT_OFF” : Sent to start/stop the sending of the real time beats by the
	 *	external application.
	 *	* Response of the external application : "BEAT" at each beat.
	 
	 *	- "BUTTON_PRESS|{button_name}" : Sent when a button is pressed in Live application.
	 *	(use if you need)
	 
	 *	- "BUTTON_RELEASE|{button_name}" : Sent when a button is released in Live
	 *	application.
	 *	(use if you need)
	 
	 *	- "FADER_CHANGE|{#fader}|" : Sent when a master fader position has changed in Live
	 *	application.
	 *	(use if you need)
	 
	 *	- “INTERFACE_CHANGE” : Sent to inform a change in Live interface (new button, button
	 *	delete, button rename, nb of master faders,, and so on …).
	 *	(use if you need)
	 */
	parseLine(line) {
		let cmd = line;
		let data;
		if (line.indexOf(SEPARATOR) > -1) {
			const splitLine = line.split(SEPARATOR);
			cmd = splitLine[0];
			data = splitLine[1];
		}
		switch (cmd) {
			case 'HELLO':
				this.connected = true;
				this.emit('connected', data);
				break;
			case 'BEAT_ON':
				this.emit('beatOn', data);
				break;
			case 'BEAT_OFF':
				this.emit('beatOff', data);
				break;
			case 'BUTTON_LIST':
				this.onButtonList(data);
				break;
			case 'BUTTON_PRESS':
				this.emit('buttonPress', data);
				break;
			case 'BUTTON_RELEASE':
				this.emit('buttonRelease', data);
				break;
			case 'FADER_CHANGE':
				this.emit('faderChange', {
					fader: data,
					value: line.split(SEPARATOR)[2]
				});
				break;
			case 'INTERFACE_CHANGE':
				this.emit('interfaceChange', data);
				break;
			case 'ERROR':
				this.onError({
					type: data
				});
				break;
			case 'BPM':
				this.emit('bpm', data);
				break;
			default:
				this.emit('unknownEvent', line);
				break;
		}
	}

	onError(errorData) {
		if (!errorData.type) {
			errorData.type = 'UNKNOWN ERROR';
		}
		this.emit('error', errorData);
	}


	onButtonList(line) {
		xmlStringParser(line, (err, result) => {
			if (err) {
				return this.onError({
					type: 'BUTTON LIST XML PARSE FAILED',
					originalXML: line
				});
			}
			this.emit('buttonList', result);
		});
	}



	/**
	 * @method hello
	 * 
	 * "HELLO|{ExtApp}|{password}" : Must be sent immediately after the TCP connection
	 * has established otherwise the response "ERROR|NOT LOGGED" will be returned.
	 * {ExtApp} is the name of the external application. The password has to be sent in clear.
	 * Response of Live : "HELLO" if OK else "ERROR|BAD PASSWORD".
	 * 
	 */
	hello() {
		this.sendSocketMessage('HELLO|' + this.settings.extApp + SEPARATOR + this.settings.password);
	}

	/**
	 * @method bpm
	 *
	 * "BPM|{bpm}" : Sent at each song start or at each "BPM" message from Live.
	 * This assigns the new BPM value in the “manual BPM” section of Live.
	 */
	bpm(bpm) {
		this.sendSocketMessage('BPM' + SEPARATOR + bpm);
	}

	/**
	 * @method beat
	 * 
	 * "BEAT" : Sent at each beat after receiving a "BEAT_ON" message from Live and stopped
	 * after receiving a "BEAT_OFF" message from Live.
	 * This increments the beat in the “auto BPM” section of Live.
	 */
	beat() {
		this.sendSocketMessage('BEAT');
	}

	freeze() {
		this.sendSocketMessage('FREEZE_ON');
	}

	unfreeze() {
		this.sendSocketMessage('FREEZE_OFF');
	}

	autoBpmOn() {
		this.sendSocketMessage('AUTO_BPM_ON');
	}

	autoBpmOff() {
		this.sendSocketMessage('AUTO_BPM_OFF');
	}

	/**
	 * @method cue
	 *
	 * "CUE|{cue_name}" : Sent at each meeting of a cue point in the external application.
	 * This toggles the button with the name {cue_name} in Live.
	 *
	 * note: This just toggles whatever button name is passed to it.  TLC software will
	 * still fire buttonPress/buttonRelease events to the client when this is used.  Also
	 * aliased as the (more accurate) buttonToggle.  This name is just to match the official docs.
	 * 
	 */
	cue(cueName) {
		this.sendSocketMessage('CUE' + SEPARATOR + cueName);
	}

	/**
	 * @method buttonToggle
	 * @aliasOf cue
	 */
	buttonToggle(buttonName) {
		this.cue(buttonName);
	}

	/**
	 * @method buttonPress
	 *
	 * "BUTTON_PRESS|{button_name}" : Sent when a button is pressed in the external application.
	 * This presses the button with the name {button_name} in Live.
	 */
	buttonPress(buttonName) {
		this.sendSocketMessage('BUTTON_PRESS' + SEPARATOR + buttonName);
	}

	/**
	 * @method buttonRelease
	 *
	 * "BUTTON_RELEASE|{button_name}" : Sent when a button is released in the external application.
	 * This releases the button with the name {button_name} in Live.
	 */
	buttonRelease(buttonName) {
		this.sendSocketMessage('BUTTON_RELEASE' + SEPARATOR + buttonName);
	}

	/**
	 * @method faderChange
	 *
	 * "FADER_CHANGE|{#fader}|{position}" : Sent when a master fader position has changed in the
	 * external application.
	 * This changes the position of the master fader in Live
	 */
	faderChange(fader, position) {
		this.sendSocketMessage('FADER_CHANGE' + SEPARATOR + fader + SEPARATOR + position);
	}

	/**
	 * @method buttonList
	 *
	 * "BUTTON_LIST" : Sent to ask Live for its button and master faders list
	 * Response of Live : “BUTTON_LIST|” followed by a XML feed with the following format :
	 *
	 *	 <?xml version="1.0" encoding="UTF-8"?>
	 *		<buttons>
	 *			<page name="head" columns="2" colbuttons_1="2" colbuttons_2="2">
	 *				<button index="0" flash="0" pressed="0" line="1" column="1" color="#80FFFF">
	 *					Button name 1
	 *				</button>
	 *				<button index="1" flash="0" pressed="0" line="2" column="1" color="#80FFFF">
	 *					Button name 2
	 *				</button>
	 *				.
	 *				.
	 *				.
	 *			</page>
	 *			.
	 *			.
	 *			.
	 *			<fader value=”0”>
	 *				Fader name 1
	 *			</fader>
	 *			<fader value=”50”>
	 *				Fader name 2
	 *			</fader>
	 *			.
	 *			.
	 *			.
	 *
	 *	<page> balise parameters :
	 *	“name” : name of the page
	 *	“columns” : nb columns in page in Live application
	 *	“colbuttons_x” : nb of buttons in the column x in Live application
	 *		
	 *	<button> balise parameters :
	 *	“index” : numeric id of the button
	 *	“flash” : flash type button (monostable – push button)
	 *	“pressed” : state of the button : 0 = released, 1 = pressed
	 *	“line” : line of the button in Live application
	 *	“column” : column of the button in Live application
	 *	“color” : color of the button in Live application (HTML format)
	 *
	 *	<fader> balise parameters :
	 *	“value” : numeric value of the fader position
	 *	(use only parameters you need)
	 */
	buttonList() {
		this.sendSocketMessage('BUTTON_LIST');
	}
}

module.exports = LightingControllerEmitter;
