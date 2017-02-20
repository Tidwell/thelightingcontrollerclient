const xml = '<?xml version="1.0" encoding="UTF-8"?><buttons><page name="EFFECTS" columns="2" colbuttons_1="1" colbuttons_2="1"><button index="0" flash="0" pressed="0" line="1" column="1" color="#FFFFFF">lasers</button><button index="1" flash="0" pressed="0" line="1" column="2" color="#17E726">lightning</button></page><page name="ELLIPS" columns="1" colbuttons_1="6"><button index="2" flash="0" pressed="0" line="1" column="1" color="#FFFFFF">ellip_1</button><button index="3" flash="0" pressed="0" line="2" column="1" color="#FFFFFF">ellip_2</button><button index="4" flash="0" pressed="0" line="3" column="1" color="#FFFFFF">ellip_3</button><button index="5" flash="0" pressed="0" line="4" column="1" color="#FFFFFF">ellip_4</button><button index="6" flash="0" pressed="0" line="5" column="1" color="#FFFFFF">ellip_5</button><button index="7" flash="0" pressed="0" line="6" column="1" color="#FFFFFF">ellip_6</button></page><page name="GLOBAL" columns="2" colbuttons_1="1" colbuttons_2="2"><button index="8" flash="0" pressed="0" line="1" column="1" color="#000000">BLACKOUT</button><button index="9" flash="0" pressed="0" line="1" column="2" color="#2DD140">ALL~ELLIPS</button><button index="10" flash="0" pressed="0" line="2" column="2" color="#FFFFFF">WASH</button></page><page name="Page_7" columns="2" colbuttons_1="1" colbuttons_2="1"><button index="11" flash="0" pressed="0" line="1" column="1" color="#223CDC">baby_blue</button><button index="12" flash="0" pressed="0" line="1" column="2" color="#1035EE">demo</button></page><page name="SINGLE_LIGHT" columns="3" colbuttons_1="2" colbuttons_2="1" colbuttons_3="1"><button index="14" flash="0" pressed="0" line="2" column="1" color="#FFFFFF">FOH~BLUE</button><button index="15" flash="0" pressed="0" line="1" column="1" color="#FFFFFF">FOH~RED</button><button index="16" flash="0" pressed="0" line="1" column="2" color="#FFFFFF">R~PAR~BLUE</button><button index="17" flash="0" pressed="0" line="1" column="3" color="#FFFFFF">R~PAR~RED</button></page><page name="SPOTS" columns="1" colbuttons_1="1"><button index="18" flash="0" pressed="0" line="1" column="1" color="#FFFFFF">SPOT~OFF</button></page><page name="ZONES" columns="5" colbuttons_1="1" colbuttons_2="1" colbuttons_3="2" colbuttons_4="1" colbuttons_5="1"><button index="19" flash="0" pressed="0" line="1" column="1" color="#FFFFFF">LR TANK #1</button><button index="20" flash="0" pressed="0" line="1" column="3" color="#FFFFFF">LR CENTER #1</button><button index="21" flash="0" pressed="0" line="1" column="5" color="#FFFFFF">LR ELEVATOR #1</button><button index="22" flash="0" pressed="0" line="2" column="3" color="#FFFFFF">2/5</button><button index="23" flash="0" pressed="0" line="1" column="2" color="#FFFFFF">2/3</button><button index="24" flash="0" pressed="0" line="1" column="4" color="#FFFFFF">4/5</button></page><fader value="0">ELLIP DIMMER</fader><fader value="0">BACK PAR DIMMER</fader><fader value="0">Master fader 3</fader><fader value="0">Master fader 4</fader></buttons>';
const CRLF = '\u000d\u000a';
const SEPARATOR = '|';
var net = require('net');

var socket;

var bufferedData = '';
function onSocketData(data) {
	bufferedData += data;
	checkParse();
}
function checkParse() {
	const lineEnd = bufferedData.indexOf(CRLF);
	if (lineEnd > -1) {
		extractLine(lineEnd);
		//check again if we had a line to parse
		checkParse();
	}
}

function extractLine(lineEnd) {
	const line = bufferedData.substring(0, lineEnd);
	bufferedData = bufferedData.slice(lineEnd + CRLF.length);
	parseLine(line);
}

function parseLine(line) {
	let cmd = line;
	let data;
	if (line.indexOf(SEPARATOR) > -1) {
		const splitLine = line.split(SEPARATOR);
		cmd = splitLine[0];
		data = splitLine[1];
	}
	switch (cmd) {
		case 'HELLO':
			console.log('sent hello')
			socket.write('HELLO'+CRLF);
		break;
		case 'BUTTON_LIST':
			console.log('sending btns')
			socket.write('BUTTON_LIST'+SEPARATOR+ xml+CRLF);
		break;
		default:
		console.log(line);
		break;
	}
}
var server = net.createServer(function(s) {
	socket = s;
	s.on('data', onSocketData);
});

server.listen(7348, '192.168.0.4');
