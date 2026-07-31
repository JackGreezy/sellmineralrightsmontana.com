/*! Developed by Illimar Pihlamäe | e-mail: illimar@idra.pri.ee | Euroland Estonia © 2014 | e-mail: illimar@euroland.com */
var EurolandToolIntegrationObject = new (function() {
	
	var This = this
		,iFrameArr = [] //an array, that holds all of the iframes
		,hasScrollBar = false
		,IE_Version = getDocumentModeIE()
		,hasListiners = false
		,eurolandDomainRegex = /^(https?:\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)*(?:euroland(ir)?)(?:\.[a-zA-Z]{2,}){1,2}(:\d+)?$/i
		,dummyCallback = function() {}
	;
	
	function removeHash(url) {
		var index = url.indexOf('#');
		if(index > -1) {
			url = url.substring(0, index);
		}
		return url
	}

	function messageCall(e) {
		if(!e) e = window.event;
		
		if(!eurolandDomainRegex.test(e.origin)) {
			return;
		}
		
		var obj, item, offset;
		try {
			obj = JSON.parse(e.data);
		} catch(e) {
			return;
		}
		
		if(obj.iFrame) {
			if(typeof obj.iFrame.height == 'number') {
				if(typeof obj.iFrame.index == 'number' && iFrameArr.length > obj.iFrame.index) {
					item = iFrameArr[obj.iFrame.index];
					if(item.height < 0) {
						item.height = parseFloat(item.iFrame.offsetHeight);
					}
					offset = obj.iFrame.height - item.height;
					item.iFrame.height = obj.iFrame.height;
					item.height = obj.iFrame.height;
					item.iFrame.style.height = obj.iFrame.height + 'px';
					
					if(item.callback != dummyCallback) {
						item.callback(offset);
					}
				}
			}
		}
		if(obj.scrollTo) {
			if(typeof obj.scrollTo.index == 'number' && iFrameArr.length > obj.scrollTo.index)
			{
				item = iFrameArr[obj.scrollTo.index];
				var posIsNumber = Object.prototype.toString.call(obj.scrollTo.scrollY) === '[object Number]';
				var scrollTo = (Object.prototype.toString.call(obj.scrollTo.scrollY) === '[object String]'
					&& ['top', 'bottom'].indexOf(obj.scrollTo.scrollY) !== -1)
					? item.iFrame.scrollIntoView.bind(item.iFrame)
					: posIsNumber
					? window.scrollTo.bind(window)
					: function(){};
				var frameSrollY = item.iFrame.getBoundingClientRect().top + window.scrollY;
				scrollTo({
					behavior: 'smooth', 
					block: obj.scrollTo.scrollY === 'top' ? 'start' : 'end', 
					inline: 'nearest',
					top: frameSrollY + (posIsNumber ? obj.scrollTo.scrollY : 0),
					left: 0
				});
			}
			
		}
	};

	function getDocumentModeIE() {
	/*
		Returns the IE's DocumentMode for IE, for non IE 0 is returned.
	*/
		if(document.all) {
			return typeof document.documentMode == 'undefined' ? getIE_Version() : Math.floor(parseFloat(document.documentMode));
		} 		
		return 0;
	}
	
	function getIE_Version() {
	/*
		Returns the current IE version. Returns 0 if the browser is not a IE.
	*/
		if(!document.all) //if the browser is not a IE returns 0
			return 0;
		if(IE_Version != null) //if the browser version has already been found returns that
			return IE_Version;
		
		//Finds out the IE version
		var index
			,browser = navigator.userAgent
		;		
		
		index = browser.search('MSIE');
		if(index == -1)
			return 0;
		
		IE_Version = browser.substring(index + 4, browser.indexOf(';', index));
		IE_Version = Math.floor(parseFloat(IE_Version));
		return IE_Version;
	}
	
	function setIFrame(iFrame, resizeCallback, isHeightToParent) {
	/*
		Sets the IFrame in the object
		iFrame - the HTML DOM object of the IFrame
		
		reziseCallback - Function, the callback that will be called with the iframe's offset passed to it
		isHeightToParent - Boolean, if set to TRUE the AutoHeight will ask the height to be sent to the parent and not into the top window
	*/
		var obj = {
			iFrame : iFrame
			,index : iFrameArr.length
			,height : -1 //the current height of the iframe
			,callback : resizeCallback
		}, strActivationMessage;
		
		iFrame.width = "100%"; 
		iFrame.allowTransparency = true;
		iFrame.style.background = 'transparent';
		// iFrame.style.border = '0px #000 solid';
		// iFrame.style.overflow = 'hidden';
		// iFrame.setAttribute('frameborder', '0');
		iFrame.setAttribute('scrolling', 'no');
		//iFrame.scrolling = 'no';
		//iFrame.frameBorder = 0;
		
		//Usually it's a IE fix, but this is here actually to make sure that in iPhones the IFrmae actually takes the portrait width and not the landscape width.
		if(IE_Version && IE_Version < 7) {
			iFrame.style.width = "100%";
		} else {
			iFrame.style.minWidth = "100%";
			iFrame.style.width = "1px";
		}
		
		iFrame.style.maxHeight = 'none';
		iFrame.style.minHeight = '0px';
		
		iFrameArr.push(obj);
		
		//makes the activation message
		strActivationMessage = "ActivateEurolandToolAutoSizeObject-" + obj.index;
		if(isHeightToParent) {
			strActivationMessage += '-1';
		}
		
		//sends the activation message to the tool
		iFrame.contentWindow.postMessage(strActivationMessage, '*');
		
		//just to be safe sends the activation message to the Tool again onload
		iFrame.onload = function() {
			iFrame.contentWindow.postMessage(strActivationMessage, '*');
		}
	}
	
	this.set = function(iFrameID, reziseCallback, isHeightToParent) {
	/*
		Sets a tool to run in a spesific container
		iFrameID - String/HTML DOM Object, aider the ID of the iframe in question or the iframe itself as HTML DOM Object
		
		reziseCallback - [Optional] Function, the callback that will be called with the iframe's offset passed to it
		isHeightToParent - [Optional] Boolean, if set to TRUE the AutoHeight will ask the height to be sent to the parent and not into the top window
	*/
		var iFrame;
		
		if(!window.postMessage || IE_Version && IE_Version < 8) {
			return;
		}
		
		if(typeof reziseCallback != 'function') {
			reziseCallback = dummyCallback;
		}
		if(typeof isHeightToParent != 'boolean') {
			isHeightToParent = false;
		}
		
		switch(typeof iFrameID) {
			case 'string':
				try {
					iFrame = document.getElementById(iFrameID);
				} catch(e) {
					return false;
				}
				break;
			case 'object': 
				if(iFrameID == null)
					return false;
				iFrame = iFrameID;
				break;
			default:
				return false;
		}
		
		if(typeof iFrame != 'object' || iFrame == null || !iFrame.nodeName || iFrame.nodeName.toLowerCase() != 'iframe')
			return;		
		
		if(!hasListiners) {
			hasListiners = true;
			if(window.addEventListener) {
				window.addEventListener('message', messageCall);
			} else {
				window.attachEvent('onmessage', messageCall);
			}
		}		
		
		setIFrame(iFrame, reziseCallback, isHeightToParent);
	};
})();

//Adds in JSON support if missing
var JSON;if(!JSON){JSON={};}(function(){'use strict';function f(n){return n<10?'0'+n:n;}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());

//Adds in a jQuery plugin
if (typeof jQuery == 'function') {
	(function ($) {
		/*
			Creates the [EurolandCommoditiesPeersIndices] Object
		*/
			
		// $.fn.EurolandIFrameAutoHeight = function() {
			
			// for(var i = 0; i < this.length; i++) {
				// EurolandToolIntegrationObject.set(this[i]);
			// }
			// return this;
		// };
		
		$.fn.extend({
			EurolandIFrameAutoHeight : function(resizeCallback) {
				
				if(typeof resizeCallback != 'function') {
					resizeCallback = null;
				}
				
				for(var i = 0; i < this.length; i++) {
					EurolandToolIntegrationObject.set(this[i], resizeCallback);
				}
				return this;
			}
		})

	}(jQuery));
}