
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

		/*
		console.log('>>RAWlogin', event.data, event.origin);

		if (appOrigin === "*") {
			appOrigin = event.origin;
			if (appOrigin == "null") appOrigin = "*";   // file: in firefox
		} else if (event.origin !== appOrigin) {
			return; // wrong origin, someone is messing around
			// (might just be from the pod, in which case we handle
			// it with a different EventListener)
		}
		*/

		console.log('>>login', event.data);

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

		if (message.toPod) {
			sendToPod(message);
		} else if (message.toApp) {
			sendToApp(message);
		} else {
			console.log('UNHANDLED', message);
		}

	}, false);


	//
	// MESSAGE PASSING TO POD
	//

	var podURL = "";
	var poddiv = document.createElement("div");
	var podiframe = document.body.appendChild(poddiv);
	var podorigin = "*";	// for now
	var connectToPod = function (url, whenDone) {

		podURL = url;

		var podframeurl = podURL+"/.well-known/podlogin.html";
		// during testing
		podframeurl = "podlogin.html";

		window.addEventListener("message", function(event) {

			if (podorigin === "*" && event.origin === podorigin) {
				console.log("login<< ", event.data);
				
				if (event.data.op === "awake") {
					podorigin = event.origin;
					whenDone();
					return;
				}
			
				sendToApp(event.data);
			}

		});

		poddiv = document.createElement("div");
		podiframe = document.createElement("iframe");
		podiframe.setAttribute("src", podframeurl);
		podiframe.style.width = "1px";
		podiframe.style.height = "1px";
		podiframe.style.overflow = "hidden";
		poddiv.appendChild(podiframe);
		document.body.appendChild(poddiv);
	}

	var disconnectFromPod = function (m) {
		document.body.removeChild(poddiv);
	}

	var sendToPod = function (m) {
		console.log("login>>", m);
		podiframe.contentWindow.postMessage(m, podorigin);
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
			height:"20em",   // wild guess  :-(
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

	var errorDiv = document.getElementById("error");
	errorDiv.style.display = "none";

	document.body.style.margin = "0";
	document.body.style.padding = "0";

	icon = document.getElementById("icon");
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

	var panel = document.getElementById("panel");
	document.body.style.backgroundColor = "white";
	panel.style.backgroundColor = "white";
	panel.style.padding = "1em";
	icon.style.fontFamily = "Arial";
	var closer = document.getElementById('x')
	closer.addEventListener("click", function (e) {	
		mode = "icon";
		render();
		requestIcon();
	});
	var podurlElement = document.getElementById('podurl')
	podurlElement.addEventListener("keypress", function(e) {
		var key = e.which || e.keyCode;
		if (key == 13) {
			newurl();
		}
	});
	podurlElement.addEventListener("blur", function(e) {
		newurl();
	});
	var newurl = function () {
		var podurl = podurlElement.value;
		if (podurl == "") return;
		console.log('got url', podurl);
		document.getElementById('podurlprompt').style.display="none";
		document.getElementById('podprogress').style.display="block";
		document.getElementById('podprogress').innerHTML = "Connecting...";
		var out = document.getElementById('selectedpodurl');
		var now = Date.now();
		var tx = podurl;
		console.log(podurl, now, tx);

		while (out.firstChild) { out.removeChild(out.firstChild); }
		out.appendChild(document.createTextNode(tx));
			//.innerHTML="<"+podurl+">";
		//document.getElementById('selectedpodurl').innerHTML="<"+podurl+">";
		document.getElementById('selectedpod').style.display="block";
		connectToPod(podurl, function() {
			document.getElementById('podprogress').style.display="none";
			// sendToApp(op:'connected-to-pod');  // but not necessary authenticated so what's the point?
		});
	};
	document.getElementById('changepodbutton').addEventListener("click", function(e) {
		document.getElementById('podurlprompt').style.display="block";
		document.getElementById('selectedpod').style.display="none";
		disconnectFromPod();
	});
	panel.style.display = "none";

	/*
		button = document.createElement('button');
		var t = document.createTextNode("X");
		button.appendChild(t); 
		
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
