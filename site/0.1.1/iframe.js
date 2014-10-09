
function main() {

	var mode = "icon";

	//
	// MESSAGE PASSING WITH APP
	//

	var appOrigin = "*"; // to start; later locked in
	var app = parent;

	var appConfig = null; 

	var sendToApp = function (m) {
		console.log("<<login", m);
		app.postMessage(m, "*");   // appOrigin?
	}

	window.addEventListener("message", function(event) {

		if (appOrigin === "*") {
			appOrigin = event.origin;
			if (appOrigin == "null") appOrigin = "*";   // file: in firefox
		} else if (event.origin !== appOrigin) {
			return; // wrong origin, someone is messing around
		}

		console.log('>>login ', event.data);

		var message = event.data
		
		if (message.op == "options") {

			appConfig = message.data;

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
		
		// TODO
	}

	var disconnectFromPod = function (m) {
		
		// TODO
	}

	var sendToPod = function (m) {
		console.log("login>>", m);
		podiframe.contentWindow.postMessage(m, podOrigin);
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

	// not currently used, but...   maybe soon?
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
	//d.innerHTML = "<p>Waiting.</p>";
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
	icon.style.display = "none";
	document.body.appendChild(icon);

	var panel = document.createElement("div");
	document.body.style.backgroundColor = "white";
	panel.style.backgroundColor = "white";
	panel.style.padding = "1em";
	panel.innerHTML = '<div style="float:right" id="x">x</div><h2>Crosscloud Pod Control</h2><p id="podurlprompt">Your Pod URL: <input id="podurl" type="text" size="30"></input></p>';
	document.body.appendChild(panel);
	var closer = document.getElementById('x')
	closer.addEventListener("click", function (e) {	
		console.log('panel clicked');
		mode = "icon";
		render();
		requestIcon();
	});
	var loginElement = document.getElementById('podurl');
	loginElement.addEventListener("keypress", function(e) {
		var key = e.which || e.keyCode;
		if (key == 13) {
			console.log('got url');
			document.getElementById('podurlprompt').style.display="none";
			connectToPod(loginElement.value);
			// display some progress...
			// 
		}
	});
	panel.style.display = "none";

	/*
		button = document.createElement('button');
		var t = document.createTextNode("X");
		button.appendChild(t); 
		d.appendChild(button);
		
		button.onclick = requestSmall;
	*/	


	// maybe tell them if we're already logged in?
	sendToApp({op:"send-options"});
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
