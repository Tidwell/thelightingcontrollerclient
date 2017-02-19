const LightingController = require('./');

const myCtrl = new LightingController({
	password: '1234'
});
myCtrl.on('connected', function() {
	console.log('connected')
	myCtrl.getButtonList();
});
myCtrl.on('line', function(line) {
	console.log('unknown line', line)
});
myCtrl.connect();

