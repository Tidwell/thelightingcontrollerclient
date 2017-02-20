const LightingController = require('./');

const myCtrl = new LightingController({
	password: '1234'
});

myCtrl.onAny((event, value) => {
	console.log(event, value);
});
myCtrl.on('connected', function() {
	console.log('connected')
	// myCtrl.cue('lasers');

	// setTimeout(function() {
	// 	myCtrl.cue('lasers')
	// },5000);
	myCtrl.buttonList();
	// 
	
	//myCtrl.bpm(400);
	//
});
// myCtrl.on('beatOn', function(){
// 	console.log('beatOn')
// 	console.log('feezing')
// 	setInterval(function() {
// 		console.log('sending beat')
// 		myCtrl.beat();
// 	}, 1000)
// });
myCtrl.on('buttonList', function(btns){
	console.log('buttonList')
	console.log(JSON.stringify(btns, null, 4));
	// myCtrl.freeze();
	// setTimeout(function() {
	// 	myCtrl.unfreeze();
	// },5000)
});



// //error
// myCtrl.on('error', function(err){
// 	console.log('error', err);
// });

// //unknown command
// myCtrl.on('unknownEvent', function(data) {
// 	console.log('unknown event', data)
// });

myCtrl.connect();

