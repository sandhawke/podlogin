"use strict";

var pod = new crosscloud.PodClient({loginRequired:true});

function foo() {

	console.log(10000000);
	var statusMessage = document.createElement("div");
	var m1 = document.createElement("div");

	document.body.appendChild(m1);
	
	var write = function (parent, text) {
		var e = document.createElement("p");
		e.innerHTML=text;
		parent.appendChild(e);
	};
	
	write(m1, "status:");

	console.log(10000001);

	pod.onLogin(function () {write(m1, "logged in"+pod.getUserId())});
	pod.onLogin(function () {console.log("100")});
	console.log("10");


	pod.onLogout(function () {write(m1, "logged out")});

	statusMessage.style.position = "fixed";
	statusMessage.style.left = "3px";
	statusMessage.style.bottom = "3px";
	document.body.appendChild(statusMessage);
	
	pod.onLogin(function () {statusMessage.innerHTML = pod.getUserId();});
	//pod.onLogout(function (){statusMessage.innerHTML = "---";});

  // pod.query(...)

  // pod.watch(...)


};
document.addEventListener("DOMContentLoaded", foo);
