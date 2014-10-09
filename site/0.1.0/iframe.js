
function main() {

	//
	// MESSAGE PASSING TO APP
	//

	var appOrigin = null;
	var app = null;

	var appConfig = null; 
	var previousMessageSeq = -1;

	var sendToApp = function (m) {

		// only occurs in debugging
		if (app === null) { return; }

		//console.log("isending",m,appOrigin);
		app.postMessage(m, appOrigin);
		console.log("<<login", m);
	}

	var mode = "icon";

	window.addEventListener("message", function(event) {

		if (appOrigin === null) {
			appOrigin = event.origin;
			// yes, it's really the STRING "null" when coming from 
			// file:/// in firefox
			if (appOrigin == "null") appOrigin = "*";
			app = event.source;
			d.innerHTML = ""
		} else if (appOrigin === "*") {
			// pass
		} else if (event.origin !== appOrigin) {
			return;
		}

		console.log('>>login ', event.data);
		//var c = document.createTextNode(JSON.stringify(event.data))
		//d.appendChild(c);

		var message = event.data
		
		if (message.seq) {
			if (message.seq === previousMessageSeq) {
				return;
			} else {
				previousMessageSeq = message.seq;
			}
		}
		
		if (message.op == "login-config") {

			appConfig = message;

			// does local-storage think we're logged in?
			// TODO

			// if so, are we actually?
			// TODO

			if (appConfig.loginRequired) {
				mode="panel";
				requestLarge();
			} else {
				mode="icon";
				requestIcon();
			}
			return
		} 

		// if not logged in, is this an error, or is it queued?

		//sendToPod(message);
		console.log('UNHANDLED', message);

	}, false);


	//
	// MESSAGE PASSING TO POD
	//

	var podURL = "";
	var poddiv = document.createElement("div");
	document.body.appendChild(poddiv);
	var connectToPod = function (url, whenDone) {
		// For now we're going to assume the URL has no path
		// so we can just use it as the origin.  
		
	}

	var disconnectFromPod = function (m) {
		
	}

	var sendToPod = function (m) {
		podiframe.contentWindow.postMessage(m, podOrigin);
		console.log("login>>", m);
	}

	// 
	// APPEARANCE
	//


	document.addEventListener("resize", function (event) {
		// doesn't seem to work
		console.log("iframe resized");
	});

	var requestLarge = function() {
		sendToApp({op:"control-iframe", properties:{
			position: "fixed",
			overflow: "scroll",
			right:"2.5%", 
			top:"15%", 
			height:null, // stop it from being constrained
			width:"90%"}});
		render();
	};							  
	var requestSmall = function() {
		sendToApp({op:"control-iframe", properties:{
			position: "absolute", 
			right:"4px", 
			top:"4px", 
			height:"32px", 
			width:"192px"}})
		render();
	}
	var requestIcon = function() {
		sendToApp({op:"control-iframe", properties:{
			position: "fixed", 
			overflow: "hidden",
			right:"4px", 
			top:"4px", 
			height:"10px", 
			width:"20px", 
			borderRadius:"4px", 
			boxShadow:"2px 2px 6px #000"}})
		render();
	}

	var render = function() {
		console.log('RENDER CALLED, mode', mode, d);

		if (mode === "icon") {
			panel.style.display="none";
			icon.style.display="block";
			return;
		}

		if (mode === "panel") {
			icon.style.display="none";
			panel.style.display="block";
			return;
		}
	}


	var b = document.body;

	var errorMessageElement = document.getElementById("error");
	errorMessageElement.style.display = "none";

	var d = document.createElement("div");
	d.innerHTML = "<p>Waiting.</p>";
	document.body.appendChild(d)
	document.body.style.margin = "0";
	document.body.style.padding = "0";

	icon = document.createElement("div");
	icon.innerHTML = "Pod";
	icon.style.margin = "0";
	icon.style.padding = "1px"
	icon.style.backgroundColor = "blue";
	icon.style.color = "white";
	icon.style.fontSize = "8px";
	icon.style.fontFamily = "Arial";
	icon.style.alignContent ="space-around";
	icon.style.textAlign = "center";
	icon.addEventListener("click", function (e) {	
		console.log('icon clicked');
		mode = "panel";
		render();
		requestLarge();
	});
	icon.addEventListener("mouseenter", function (e) {	
		icon.style.backgroundColor = "#3388cc";
	});
	icon.addEventListener("mouseleave", function (e) {	
		icon.style.backgroundColor = "blue";
	});
	//icon.style.display = "none";
	document.body.appendChild(icon);

	var panel = document.createElement("div");
	panel.style.backgroundColor = "white";
	panel.style.padding = "1em";
	panel.innerHTML = '<div style="float:right" id="x">x</div><h2>Crosscloud Pod Control Panel</h2><p>Please Login: ....</p>';
	document.body.appendChild(panel);
	var closer = document.getElementById('x')
	closer.addEventListener("click", function (e) {	
		console.log('panel clicked');
		mode = "icon";
		render();
		requestIcon();
	});
	//panel.style.display = "none";

	/*
		button = document.createElement('button');
		var t = document.createTextNode("X");
		button.appendChild(t); 
		d.appendChild(button);
		
		button.onclick = requestSmall;
	*/	

}

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

console.log("Parent", parent);
console.log("Parent", parent);