"use strict";
/*
  
  Functions for accessing a world of linked data through the user's
  personal online database (pod).  Apps can store whatever data they
  want in the user's pod, and query for data from other apps in both
  this user's pod and in other pods which are directly or indirectly
  linked.

  This library defines crosscloud.PodClient().  Typically you'll
  instantiate this and use it throughout the app, like:

     var pod = new crosscloud.PodClient();

	 pod.push({'name':'Alice Example', 'email':'alice@example.com'},
              function (item, err) { ... callback ... });

  For more details see http://crosscloud.org/latest/spec/js (TODO)

*/

// structured to work in the browser (creating the global
// 'crosscloud') or in node.js with exports.
// See http://caolanmcmahon.com/posts/writing_for_node_and_the_browser/
(function(exports){

	exports.version = '0.1.1';

	//
	//
	//  SET UP IFRAME
	//
	//  (factor this out into iframeParent and iframeChild libraries?)
	//
	
	var safeOrigin = "http://podlogin.org"
	// safeOrigin = "http://localhost"
	var iframeSource = safeOrigin+"/"+exports.version+"/iframe.html"

	//
	// Possible options include
	//
	//  -- app identification
	//  -- default pod providers
	//  -- offered micropod provider
	//
	exports.PodClient = function PodClient(options){
		if ( !(this instanceof PodClient) ) {
			throw new Error("Constructor called as a function. Must use 'new'");
		}
	
		var that = this;

		that.callbacks = {};
		that.callbackHandleCount = 0;
		that.options = options || {};

		window.addEventListener("message", function(event) {
			//console.log("got message, checking origin", event);

			if (event.origin !== safeOrigin) return;

			console.log("app<< ", event.data);

			// special messages we handle

			if (event.data.op === "control-iframe") {
				that._iframeSet(event.data.properties);
				return;
			}

			if (event.data.op === "send-options") {
				that._send({op:"options", data:that.options});
				return;
			}

			// other messages handled via callbacks set by pod._newCallback()

			var callback = that.callbacks[event.data.calling];
			if (callback) {
				if (event.data.releaseCallback) {
					delete that.callbacks[event.data.calling];
				}
				callback(event.data)
			} else {
				console.log('crosscloud.js: received postMessage with unallocated callback handle', event.data.calling);
			}
		}, false);

		if (document.readyState == 'complete' ||
			document.readystate == 'interactive') {
			//console.log('was ready', options)
			that._buildiframe(options)
		} else {
			//console.log('not ready', options)
			document.addEventListener("DOMContentLoaded", function(event) {
				//console.log('ready now', options)
				that._buildiframe(options);
			});
		}
	}

	var pod = exports.PodClient.prototype;

	pod._buildiframe = function(options) {
		var d = this.iframediv = document.createElement("div");
		var i = this.iframe = document.createElement("iframe");
		i.setAttribute("src", iframeSource);
		i.setAttribute("allowtransparency", false);  // doesn't work
		this._iframeStyle()
		d.appendChild(i);
		document.body.appendChild(d);
    };

	pod._iframeSet = function(settings) {
		var that = this;
		//console.log('setting iframe properties', settings);
		["top", "left", "right", "position", "width", "height"].forEach(function(prop) {
			if (prop in settings) {
				//console.log('setting on div',prop,settings[prop], this.iframediv);
				this.iframediv.style[prop] = settings[prop]
			};
		}, this);
		["borderRadius", "boxShadow", "width", "height", "overflow"].forEach(function(prop) {
			if (prop in settings) {
				//console.log('setting on iframe',prop,settings[prop], this.iframe);
				this.iframe.style[prop] = settings[prop]
			};
		}, this);
	}
		

	// the frame can override some of these with iframeSetProperties,
	// but let's pick the others and set some defaults.
	pod._iframeStyle = function() {
		var ds = this.iframediv.style
		var s = this.iframe.style

		ds.position = "absolute";
		ds.right = "4px";
		ds.top = "4px";

		s.scrolling = "no";
		s.overflow = "hidden";
		this.iframe.scrolling = "no";
		this.iframe.overflow = "hidden";

		// s.transform = "rotate(5deg)";    :-)

		s.boxShadow = "2px 2px 6px #000";
		s.borderRadius = "2px";
		s.padding = "0";
		s.margin = "0";
		s.border = "none";
		s.width = 2+"px";
		s.height = 2+"px";
	}

	pod._send = function(message) {
		console.log("app>> ", message);
		this.iframe.contentWindow.postMessage(message, safeOrigin);
	}

	pod._newCallback = function(cb) {
		var handle = this.callbackHandleCount++;
		this.callbacks[handle] = cb;
	}


	pod.test = function(a) {
		//console.log("a was",a);
	}


	pod.search = function(search) {
		var msg = { op:"search" };

		if (search.allResults) {
			msg.allResults = this._newCallback(search.allResults);
		}

		msg.maxCallsPerSecond = 5;
		if (search.maxCallsPerSecond) {
			msg.maxCallsPerSecond = search.maxCallsPerSecond;
		}

		this._send(msg);
	}

	pod.push = function(page, callback) {
		this._send({op:"push", 
					data: page, 
					callback:this._newCallback(callback)
				   });
	}

	pod.watch = function(pageOrId, callback) {
		this._send({op:"pull", 
					data: pageOrId, 
					callback:this._newCallback(callback)
				   });
	}


})(typeof exports === 'undefined'? this['crosscloud']={}: exports);
