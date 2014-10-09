/*

  This is the second iframe in the podlogin structure.  This code (or
  an equivalent) can be served from the pod itself to avoid any need
  for CORS.  iframe.js looks for it there by loading
  $pod/.well-known/podlogin.html (and maybe podlogin.$pod ?)


  TODO: figure out if we can do meaningful checks on origins

*/

function main() {

	//
	// MESSAGE PASSING TO LOGIN INFRAME (OUR PARENT)
	//

	var sendToApp = function (m) {
		m.toApp = true;
		console.log("<<podlogin", m);
		parent.postMessage(m, "*");
	}

	window.addEventListener("message", function(event) {

		console.log('>>podlogin ', event.data);

		var message = event.data
		
		if (message.op === "pop") {
			console.log("POP");
			window.open("http://www.w3.org/");
			// fails because of pop-up blockers; needs to be in event tree?
			return;
		}

		console.log('podlogin UNHANDLED', message);
	}, false);

	sendToApp({op:"awake"});
};


// we don't even really need the DOM in this version, but we might at
// some point be displaying some pod status info ourselves.
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
