const LightingController = require('../');
const CRLF = '\u000d\u000a';
const SEPARATOR = '|';

let client;

describe("TheLightingControllerClient", () => {
	beforeEach(() => {
		client = new LightingController();
	});
	describe('Class structure', () => {
		it('should contain default settings', () => {
			expect(client.settings.port).toBe(7348);
			expect(client.settings.ip).toBe('127.0.0.1');
			expect(client.settings.extApp).toBe('thelightingcontrollerclient');
			expect(client.settings.password).toBe('');
		});

		it('should overwrite settings with anything passed in', () => {
			client = new LightingController({
				ip: '123.456.8.9',
				password: '6789'
			});
			expect(client.settings.port).toBe(7348);
			expect(client.settings.ip).toBe('123.456.8.9');
			expect(client.settings.extApp).toBe('thelightingcontrollerclient');
			expect(client.settings.password).toBe('6789');
		});

		it('should create an empty data buffer', () => {
			expect(client.bufferedData).toBe('');
		});

		it('should set the connected status to false', () => {
			expect(client.connected).toBe(false);
		});
	});

	describe('connect method', () => {
		it('should set the encoding to utf8', () => {
			client.connect();
			expect(client.client.encoding).toBe('utf8');
		});

		it('should register data, close, and error event handlers', () => {
			client.connect();
			expect(typeof client.client.onMethods.data).toBe('function');
			expect(typeof client.client.onMethods.close).toBe('function');
			expect(typeof client.client.onMethods.error).toBe('function');
		});

		it('should pass the port and ip and set up a callback when connecting with the socket client', () => {
			spyOn(client, '_hello');
			client.connect();
			expect(client.client.connectCalled[0]).toBe(7348);
			expect(client.client.connectCalled[1]).toBe('127.0.0.1');
			expect(typeof client.client.connectCalled[2]).toBe('function');
			expect(client._hello).toHaveBeenCalled();
		});
	});

	describe('_onSocketData method', () => {
		it('should augment the bufferedData', () => {
			const data = 'some data';
			client._onSocketData(data);
			expect(client.bufferedData).toBe(data);
		});

		it('should continue appending on multiple calls', () => {
			const data = 'some data';
			client._onSocketData(data);
			client._onSocketData(data);
			expect(client.bufferedData).toBe(data + data);
		});

		it('should call to check if it needs to parse', () => {
			spyOn(client, '_checkParse');
			client._onSocketData();
			expect(client._checkParse).toHaveBeenCalled();
		});
	});

	describe('_onSocketClose method', () => {
		it('should set the connected status to closed', () => {
			client.connected = true;
			client._onSocketClose();
			expect(client.connected).toBe(false);
		});

		it('should emit a disconnected event', () => {
			let eventFired = false;
			client.on('disconnected', () => {
				eventFired = true;
			});
			client._onSocketClose();
			expect(eventFired).toBe(true);
		});
	});

	describe('_onSocketError method', () => {
		it('should fire an error event of type socket', () => {
			let eventFired = false;
			let evnt = null;
			client.on('error', (ev) => {
				evnt = ev;
				eventFired = true;
			});
			client._onSocketError();
			expect(eventFired).toBe(true);
			expect(evnt.type).toBe('SOCKET');
		});

		it('should proxy the error object through as the error property', () => {
			let eventFired = false;
			let evnt = null;
			client.on('error', (ev) => {
				evnt = ev;
				eventFired = true;
			});
			const errorObj = {};
			client._onSocketError(errorObj);
			expect(eventFired).toBe(true);
			expect(evnt.error).toBe(errorObj);
		});

		it('should proxy through _onError', () => {
			spyOn(client, '_onError');
			const err = {};
			client._onSocketError(err);
			expect(client._onError).toHaveBeenCalledWith({
				type: 'SOCKET',
				error: err
			});
		})
	});

	describe('_sendSocketMessage method', () => {
		it('should proxy to client.write appending CRLF', () => {
			client.connect();
			spyOn(client.client, 'write').and.callFake(() => {});
			client._sendSocketMessage('test');
			expect(client.client.write).toHaveBeenCalledWith('test' + CRLF);
		});
	});

	describe('_checkParse method', () => {
		beforeEach(() => {
			client.connect();
			spyOn(client, '_extractLine').and.callThrough();
			spyOn(client, '_checkParse').and.callThrough();
		});
		it('should check the bufferedDatam for a CRLF and do nothing if it isnt found', () => {
			client.bufferedData = 'test';
			client._checkParse();
			expect(client.bufferedData).toBe('test');

			expect(client._extractLine).not.toHaveBeenCalled();
			expect(client._checkParse.calls.count()).toBe(1);
		});

		it('should pass the location it found to _extractLine if it is found', () => {
			client.bufferedData = 'test' + CRLF;
			client._checkParse();

			expect(client._extractLine).toHaveBeenCalledWith(4);
		});

		it('should run again if found', () => {
			client.bufferedData = 'test' + CRLF;
			client._checkParse();

			expect(client._checkParse.calls.count()).toBe(2);
		});
	});

	describe('_extractLine method', () => {
		beforeEach(() => {
			client.connect();
			spyOn(client, '_parseLine').and.callThrough();
		});

		it('should cut off up to the index that is passed to it plus the length of the CRLF from the buffer', () => {
			client.bufferedData = '0123' + CRLF + '456789';
			client._extractLine(4);
			expect(client.bufferedData).toBe('456789');
		});

		it('should pass what was cut from the buffer to the parser', () => {
			client.bufferedData = '0123' + CRLF + '456789';
			client._extractLine(4);
			expect(client._parseLine).toHaveBeenCalledWith('0123');
		});
	});

	describe('_parseLine method', () => {
		it('should just emit events with no data for lines without data or side effects', () => {
			const cmds = [{
				line: 'BEAT_ON',
				event: 'beatOn'
			}, {
				line: 'BEAT_OFF',
				event: 'beatOff'
			}, {
				line: 'INTERFACE_CHANGE',
				event: 'interfaceChange'
			}, {
				line: 'BPM',
				event: 'bpm'
			}];

			cmds.forEach((cmd) => {
				let eventFired = false;
				let data = null;
				client.on(cmd.event, (d) => {
					data = d;
					eventFired = true;
				});
				client._parseLine(cmd.line);
				expect(eventFired).toBe(true);
				expect(data).toBe(undefined);
			});
		});

		it('should set connected to true on a HELLO event', () => {
			let eventFired = false;
			let data = null;
			client.on('connected', (d) => {
				data = d;
				eventFired = true;
			});
			expect(client.connected).toBe(false);
			client._parseLine('HELLO');
			expect(eventFired).toBe(true);
			expect(data).toBe(undefined);
			expect(client.connected).toBe(true);
		});

		it('should emit events with data parsed after the | for lines with single arguments', () => {
			const cmds = [{
				line: 'BUTTON_PRESS|my button',
				event: 'buttonPress',
				data: 'my button'
			}, {
				line: 'BUTTON_RELEASE|my other button',
				event: 'buttonRelease',
				data: 'my other button'
			}];

			cmds.forEach((cmd) => {
				let eventFired = false;
				let data = null;
				client.on(cmd.event, (d) => {
					data = d;
					eventFired = true;
				});
				client._parseLine(cmd.line);
				expect(eventFired).toBe(true);
				expect(data).toBe(cmd.data);
			});
		});

		it('should emit faderChange with both arguments', () => {
			const cmds = [{
				line: 'FADER_CHANGE|my fader|25',
				event: 'faderChange',
				data: {
					name: 'my fader',
					value: 25
				}
			}];

			cmds.forEach((cmd) => {
				let eventFired = false;
				let data = null;
				client.on(cmd.event, (d) => {
					data = d;
					eventFired = true;
				});
				client._parseLine(cmd.line);
				expect(eventFired).toBe(true);
				expect(data).toEqual(cmd.data);
			});
		});

		it('should emit an error on ERROR event', () => {
			const cmds = [{
				line: 'ERROR|BAD PASSWORD',
				event: 'error',
				data: {
					type: 'BAD PASSWORD'
				}
			}];

			cmds.forEach((cmd) => {
				let eventFired = false;
				let data = null;
				client.on(cmd.event, (d) => {
					data = d;
					eventFired = true;
				});
				client._parseLine(cmd.line);
				expect(eventFired).toBe(true);
				expect(data).toEqual(cmd.data);
			});
		});

		it('should emit an unknownEvent if the command doesnt match', () => {
			const line = 'SOMETHINGELSE|with some data|or more|data';
			let eventFired = false;
			let data = null;
			client.on('unknownEvent', (d) => {
				data = d;
				eventFired = true;
			});
			client._parseLine(line);
			expect(eventFired).toBe(true);
			expect(data).toBe(line);
		});

		it('should call _onButtonList for a BUTTON_LIST event', () => {
			const line = '<xml blablabla><buttons><bla>';
			spyOn(client, '_onButtonList');
			client._parseLine('BUTTON_LIST|' + line);
			expect(client._onButtonList).toHaveBeenCalledWith(line);
		});
	});

	describe('_onError', () => {

	});

	describe('_onButtonList', () => {

	});

	describe('_hello', () => {

	});

	//ADD ALL OTHER SENDING METHODS

});
