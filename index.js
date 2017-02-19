const CRLF = '\u000d\u000a';

var net = require('net');
const readline = require('readline');
const EventEmitter = require('events');
const merge = require('utils-merge');

class LightingControllerEmitter extends EventEmitter {
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
		this.client.on('data', data => this.onData(data));
		this.client.connect(7348, '127.0.0.1', () => this.onConnect());
		this.client.on('close', function() {
			console.log('Connection closed');
		});
	}
	onData(data) {
		this.bufferedData += data;
		this.checkParse();
	}
	onConnect() {
		this.client.write('HELLO|'+this.settings.extApp+'|'+ this.settings.password + CRLF);
	}

	checkParse() {
		//console.log('checking parse of ', bufferedData)
		const lineEnd = this.bufferedData.indexOf(CRLF);
		if (lineEnd > -1) {
			this.parseAsLine(lineEnd);
		}
	}

	parseAsLine(lineEnd) {
		const line = this.bufferedData.substring(0,lineEnd);
		this.bufferedData = this.bufferedData.slice(lineEnd+CRLF.length);
		this.onLine(line);
		this.checkParse();
	}

	onLine(line) {
		switch (line) {
			case 'HELLO':
				this.emit('connected');
			break;
			default:
				this.emit('line', line);
			break;
		}
	}

	getButtonList() {
		this.client.write('BUTTON_LIST' + CRLF);
	}
}

module.exports = LightingControllerEmitter;
