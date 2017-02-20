const mockery = require('mockery');
mockery.enable({
	warnOnReplace: false,
    warnOnUnregistered: false
});

const netMock = {
	Socket: class Socket {
		constructor() {
			this.encoding = '';
			this.onMethods = {};
			this.writtenData = [];
		}

		setEncoding(encoding) {
			this.encoding = encoding;
		}

		on(name, cb) {
			this.onMethods[name] = cb;
		}
		connect(port, ip, callback) {
			this.connectCalled = arguments;
			callback();
		}
		write(data){
			this.writtenData.push(data);
		}
	}
};
mockery.registerMock('net', netMock);
