/*

  This is the second iframe in the podlogin structure.  This code (or
  an equivalent) can be served from the pod itself to avoid any need
  for CORS.  iframe.js looks for it there by loading
  $pod/.well-known/podlogin.html (and maybe podlogin.$pod ?)

*/

function main() {

	//
	// MESSAGE PASSING TO LOGIN INFRAME (OUR PARENT)
	//

	var loginOrigin = null;
	var login = null;

	var loginConfig = null; 
	var previousMessageSeq = -1;

	var sendToLogin = function (m) {

		// only occurs in debugging
		if (login === null) { return; }

		//console.log("isending",m,loginOrigin);
		login.postMessage(m, loginOrigin);
		console.log("<<login", m);
	}

	var mode = "icon";

	window.addEventListener("message", function(event) {

		if (loginOrigin === null) {
			loginOrigin = event.origin;
			// yes, it's really the STRING "null" when coming from 
			// file:/// in firefox
			if (loginOrigin == "null") loginOrigin = "*";
			login = event.source;
			d.innerHTML = ""
		} else if (loginOrigin === "*") {
			// pass
		} else if (event.origin !== loginOrigin) {
			return;
		}

		console.log('>>podlogin ', event.data);

		var message = event.data
		
		if (message.seq) {
			if (message.seq === previousMessageSeq) {
				return;
			} else {
				previousMessageSeq = message.seq;
			}
		}
		
		if (message.op == "podlogin-ping" {
			sendToLogin({op:"podlogin-pong", inResponseTo:message.seq});
		}

		console.log('podlogin UNHANDLED', message);

	}, false);

};


function onready() {
	if (document.readyState == 'complete' ||
		document.readystate == 'interactive') {
		main();
	} else {
		document.addEventListener("DOMContentLoaded", function(event) {
			main();
		});
	}
}

onready();
