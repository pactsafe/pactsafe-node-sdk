(function() {
    var _json = JSON || {};
    _json._stringify = _json.stringify || function(obj) {  
      var t = typeof obj;
      if (t !== "object" || obj === null) {
        if (t === "string") obj = '"' + obj + '"';
        return String(obj);
      }
      else {
        var n,
          v,
          json = [],
          arr = (obj && obj.constructor == Array);
        for (n in obj) {
          v = obj[n];
          t = typeof v;
          if (t === "string") v = '"' + v + '"';
          else if (t === "object" && v !== null) v = _json._stringify(v);
          json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
      }
    };
    _json._parse = _json.parse || function(text) {
      var j = null;
      text = String(text);
      rx_dangerous.lastIndex = 0;
      if (rx_dangerous.test(text)) {
        text = text.replace(rx_dangerous, function(a) {
          return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      if (rx_one.test(text.replace(rx_two, '@').replace(rx_three, ']').replace(rx_four, ''))) j = eval('(' + text + ')');
      return j;
    };
    var rx_one = /^[\],:{}\s]*$/,
      rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      rx_four = /(?:^|:|,)(?:\s*\[)+/g,
      rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var noop = function() {},
      log = function(a) {
        if (typeof console != 'undefined' && typeof console.log == 'function') {
          try { console.log(a); }
          catch (ex) {}
        }
      },
      isFunction = function(a) {
        return "function" == typeof a;
      },
      isArray = function(a) {
        return "[object Array]" == Object.prototype.toString.call(Object(a));
      },
      isNode = function(a) {
        return (typeof Node === "object" ? a instanceof Node : a && typeof a === "object" && typeof a.nodeType === "number" && typeof a.nodeName === "string");
      },
      isElement = function(a) {
        return (typeof HTMLElement === "object" ? a instanceof HTMLElement : a && typeof a === "object" && a !== null && a.nodeType === 1 && typeof a.nodeName === "string");
      },
      isString = function(str) {
        return void 0 != str && -1 < (str.constructor + "").indexOf("String");
      },
      isBlank = function(str) {
        return void 0 == str || -1 === (str.constructor + "").indexOf("String") || (/^\s*$/).test(str);
      },
      isFalsy = function(a) {
        return void 0 === a || null === a || (typeof a !== "string" && typeof a !== "number") || (typeof a === "number" && isNaN(a)) || Infinity == a || (-1 < (a.constructor + "").indexOf("String") && (/^\s*$/).test(a));
      },
      startsWith = function(a, b) {
        return 0 == a.indexOf(b);
      },
      toObject = function(a, b) {
        if (1 == b.length && null != b[0] && "object" === typeof b[0] && !isArray(b[0])) return b[0];
        for (var c = {}, d = Math.min(a.length + 1, b.length), e = 0; e < d; e++) {
          if (isArray(b[e])) {
            e < a.length && (c[a[e]] = b[e]);
          }  
          else if ("object" === typeof b[e] && null != b[e]) {
            for (var g in b[e]) b[e].hasOwnProperty(g) && (c[g] = b[e][g]);
            break;
          }
          else e < a.length && (c[a[e]] = b[e]);
        }
        return c;
      },
      getElement = function(sel) {
        var el = null;
        if (isElement(sel) || isNode(sel)) el = sel;
        else if (!isBlank(sel)) {
          el = document.getElementById(sel);
          if (!el) {
            el = document.getElementsByName(sel);
            el = (el && 0 < el.length) ? el[0] : null;
          }
        }
        return el;        
      },
      getElementSelector = function(el) {
        return (isElement(el) || isNode(el)) ? (el.hasAttribute('id') ? getAttribute(el, 'id') : (el.hasAttribute('name') ? getAttribute(el, 'name') : null)) : null;
      },
      getByClassName = function(el, className) {
        return el.getElementsByClassName(className);
      },
      tryEncodeURIComponent = function(a) {
        var v = a;
        if (isFunction(a)) v = a();
        if (typeof v === 'object' && !isArray(v)) v = _json._stringify(v);
        if (encodeURIComponent instanceof Function) return encodeURIComponent(v);
        return v;
      },
      removeUnicodeSpaces = function(a) {
        return a ? a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "") : "";
      },
      encodeParentheses = function(a) {
        return tryEncodeURIComponent(a).replace(/\(/g, "%28").replace(/\)/g, "%29");
      },
      createBeaconImage = function(src) {
        var b = document.createElement("img");
        b.width = 1;
        b.height = 1;
        b.src = src;
        return b;
      },
      createScriptElement = function(src, callback) {
        if (src) {
          var c = document.createElement("script");
          c.type = "text/javascript";
          c.async = !0;
          c.src = src;
          callback && isFunction(callback) && (c.onerror = callback);
          var d = document.getElementsByTagName("script")[0];
          d.parentNode.insertBefore(c, d);
        }
      },
      listenTo = function(obj, eventName, callback, useCapture) {
        try {
          stopListening(obj, eventName, callback);
          obj.addEventListener ? obj.addEventListener(eventName, callback, !!useCapture) : obj.attachEvent && obj.attachEvent("on" + eventName, callback);
        }
        catch (err) {}
      },
      stopListening = function(obj, eventName, callback) {
        try {
          obj.removeEventListener ? obj.removeEventListener(eventName, callback, !1) : obj.detachEvent && obj.detachEvent("on" + eventName, callback);
        }
        catch (err) {}
      },
      emit = function(eventName, data, obj) {
        try {
          obj = obj || document;
          obj.dispatchEvent && obj.dispatchEvent(createEvent(eventName, data));
        }
        catch (err) {}
      },
      getAttribute = function(el, a, v) {
        if (el) v = el.getAttribute(a);
        return v;
      },
      setAttribute = function(el, a, v) {
        if (el) {
          if (isArray(a) && isArray(v)) {
            if (a.length < v.length) v = v.slice(0, a.length - 1);
            for (var i = 0; i < a.length; i++) el.setAttribute(a[i], v[i]);
          }
          else el.setAttribute(a, v);
        }
      },
      addClass = function(el, c) {
        var classArr = null, classStr = '', c = '' + c;
        classArr = el.className.split(' ');
        if (classArr.indexOf(c) !== -1) return;
        classStr = el.className + ' ' + c;
        el.className = classStr.trim();
      },
      removeClass = function(el, c) {
        var classArr = null, classStr = '', c = '' + c;
        classArr = el.className.split(' ');
        if (classArr.indexOf(c) === -1) return;
        for (var i = 0; i < classArr.length; i++) {
          if (classArr[i] && classArr[i] != c) classStr += classArr[i] + ' ';
        }
        el.className = classStr.trim();
      },
      hasClass = function(el, c) {
        var classArr = null, classStr = '', c = '' + c;
        classArr = el.className.split(' ');
        return classArr.indexOf(c) !== -1;
      },
      findInputByType = function(el, tag, type, f, els) {
        f = null;
        if (el) {
          els = el.getElementsByTagName(tag);
          for (var i = 0; i < els.length; i++) {
            if (type == (getAttribute(els[i], 'type') || '').toLowerCase()) {
              f = els[i];
              break;
            }
          }
        }
        return f;
      },
      isHTTPS = function() {
        return "https:" == document.location.protocol;
      },
      getHostname = function() {
        var a = "" + document.location.hostname;
        return 0 == a.indexOf("www.") ? a.substring(4) : a;
      },
      getReferrer = function(alwaysSend) {
        var referrer = document.referrer;
        if (/^https?:\/\//i.test(referrer)) {
          if (alwaysSend) return referrer;
          var a = "//" + document.location.hostname;
          var c = referrer.indexOf(a);
          if (5 == c || 6 == c) {
            if (a = referrer.charAt(c + a.length), "/" == a || "?" == a || "" == a || ":" == a) return; 
          }
          return referrer;
        }
      },
      generateRandomValue = function() {
        return Math.round(2147483647 * Math.random());
      },
      generateCacheBuster = function() {
        try {
          var a = new Uint32Array(1);
          window.crypto.getRandomValues(a);
          return a[0] & 2147483647;
        }
        catch (err) {
          return generateRandomValue();
        }
      },
      hashValue = function(a) {
        var b = 1, c = 0, d;
        if (a) for (b = 0, d = a.length - 1; 0 <= d; d--) c = a.charCodeAt(d), b = (b << 6 & 268435455) + c + (c << 14), c = b & 266338304, b = 0 != c ? b ^ c >> 21 : b;
        return b;
      };
        
    /**
     * Generic Data Object class.
     */
    var DataObject = function() {
      this.keys = [];
      this.values = {};
      this.overrides = {};
    };
    DataObject.prototype.set = function(name, value, override) {
      if (this.keys.indexOf('' + name) < 0) this.keys.push('' + name);
      override ? this.overrides[":" + name] = value : this.values[":" + name] = value;
    };
    DataObject.prototype.get = function(name) {
      return this.overrides.hasOwnProperty(":" + name) ? this.overrides[":" + name] : this.values[":" + name];
    };
    DataObject.prototype.map = function(callback) {
      for (var b = 0; b < this.keys.length; b++) {
        var key = this.keys[b],
          value = this.get(key);
        void 0 != value && callback(key, value);
      }
    };
    
    /**
     * Helper functions.
     */
    var generateBrowserHash = function() {
      for (var a = window.navigator.userAgent + (document.cookie ? document.cookie : "") + (document.referrer ? document.referrer : ""), b = a.length, c = window.history.length; 0 < c;) a += c-- ^ b++;
      return hashValue(a);
    };
    
    var objectIdIndex = parseInt(Math.random() * 0xFFFFFF, 10);
    var maxBits = [];
    for (var i = 0; i < 64; i++) maxBits[i] = Math.pow(2, i);
    var hexTable = [];
    for (var i = 0; i < 256; i++) hexTable[i] = (i <= 15 ? '0' : '') + i.toString(16);
        
    var generateObjectId = function(time) {
        if ('number' != typeof time) time = parseInt(((new Date).getTime() / 1E3), 10);
        objectIdIndex = (objectIdIndex + 1) % 0xFFFFFF;
        var time4Bytes = encodeInt(time, 32, true, true),
          machine3Bytes = encodeInt(parseInt(Math.random() * 0xFFFFFF, 10), 24, false),
          pid2Bytes = encodeInt(Math.floor(Math.random() * 100000), 16, true),
          index3Bytes = encodeInt(objectIdIndex, 24, false, true),
          id = time4Bytes + machine3Bytes + pid2Bytes + index3Bytes,
          hexString = '';
        for (var i = 0; i < id.length; i++) hexString += hexTable[id.charCodeAt(i)];
        return hexString;
      },
      encodeInt = function(data, bits, signed, forceBigEndian) {
      	var max = maxBits[bits];
        if (data >= max || data < -(max / 2)) data = 0;
      	if (data < 0) data += max;
      	for (var r = []; data; r[r.length] = String.fromCharCode(data % 256), data = Math.floor(data / 256));
      	for (bits = -(-bits >> 3) - r.length; bits--; r[r.length] = "\0");
        return (forceBigEndian ? r.reverse() : r).join("");
      },
      validateObjectId = function(id) {
        if (id == null) return !1;
        if (id != null && 'number' != typeof id && (id.length != 12 && id.length != 24)) return !1;
        else return (typeof id == 'string' && id.length == 24) ? isValidObjectId.test(id) : !0;
      };
    
    var isOptedOut = function(siteId) {
      if (window._psPrefs && window._psPrefs.ioo && window._psPrefs.ioo() || siteId && !0 === window["ps-disable-" + siteId]) return !0;
      try {
        if (window.external && window.external._psPrefs && "oo" == window.external._psPrefs) return !0;
      }
      catch (err) {}
      return !1;
    };
    var getCookieByName = function(name) {
        var cookieValues = [],
          cookies = document.cookie.split(";");
        name = new RegExp("^\\s*" + name + "=\\s*(.*?)\\s*$");
        for (var d = 0; d < cookies.length; d++) {
          var cookieMatch = cookies[d].match(name);
          cookieMatch && cookieValues.push(cookieMatch[1]);
        }
        return cookieValues;
      },    
      createCookie = function(name, value, path, domain, siteId, expiration) {
        var valid = isOptedOut(siteId) ? !1 : "/" == path && psDomain.test(domain) ? !1 : !0;
        if (!valid) return !1;
        value && 1200 < value.length && (value = value.substring(0, 1200));
        var cookieString = name + "=" + value + "; path=" + path + "; ";
        expiration && (cookieString += "expires=" + (new Date((new Date).getTime() + expiration)).toGMTString() + "; ");
        domain && "none" != domain && (cookieString += "domain=" + domain + ";");
        var changed,
          originalCookie = document.cookie;
        document.cookie = cookieString;
        if (!(changed = originalCookie != document.cookie)) {
          block: {
            var cookieValues = getCookieByName(name);
            for (var i = 0; i < cookieValues.length; i++) {
              if (value == cookieValues[i]) {
                changed = !0;
                break block;
              }
            }
            changed = !1;
          }
        }
        return changed;
      },
      _debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        var later = function() {
          var last = (new Date).getTime() - timestamp;
          if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
          }
          else {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
              if (!timeout) context = args = null;
            }
          }
        };
        return function() {
          context = this;
          args = arguments;
          timestamp = (new Date).getTime();
          var callNow = immediate && !timeout;
          if (!timeout) timeout = setTimeout(later, wait);
          if (callNow) {
            result = func.apply(context, args);
            context = args = null;
          }
          return result;
        };
      },
      _throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
          previous = options.leading === false ? 0 : (new Date).getTime();
          timeout = null;
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        };
        return function() {
          var now = (new Date).getTime();
          if (!previous && options.leading === false) previous = now;
          var remaining = wait - (now - previous);
          context = this;
          args = arguments;
          if (remaining <= 0 || remaining > wait) {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          }
          else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
          }
          return result;
        };
      },
      psDomain = /^(www\.)?pactsafe(\.io?)?(\.[a-z]{2})?$/,
      isValidSiteId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      isValidObjectId = /^[0-9a-fA-F]{24}$/;
    
    /**
     * Transport functions.
     */
    var transportHost = function() {
        return (_forceSSL || isHTTPS() ? "https:" : "http:") + "//" + _PactSafe.envAPI;
      },
      lengthError = function(a) {
        this.name = "request_size";
        this.message = a + "-8192";
      },
      sendDefault = function(parameters, transportAddress, payload, eventType, context, callback) {
        callback = callback || noop;
        if (2036 >= payload.length) sendWithImage(parameters, transportAddress, payload, eventType, context, callback);
        else if (8192 >= payload.length || parameters.get(_force_send)) sendWithBeacon(parameters, transportAddress, payload, eventType, context, callback) || sendWithXHR(parameters, transportAddress, payload, eventType, context, callback) || sendWithImage(parameters, transportAddress, payload, eventType, context, callback);
        else throw beaconSendError(parameters, "request_size", payload.length), new lengthError(payload.length);
      },
      sendWithImage = function(parameters, transportAddress, payload, eventType, context, callback) {
        if (parameters && parameters.get(_test_mode)) {
          log('sendWithImage: ' + eventType + ': ' + payload);
          if (parameters.get(_log_only)) return callback(null, eventType, context);
        }
        var img = createBeaconImage(transportAddress + "?" + payload);
        img.onload = img.onerror = function() {
          img.onload = null;
          img.onerror = null;
          callback(null, eventType, context);
        }
      },
      sendWithXHR = function(parameters, transportAddress, payload, eventType, context, callback) {
        if (parameters && parameters.get(_test_mode)) {
          log('sendWithXHR: ' + eventType + ': ' + payload);
          if (parameters.get(_log_only) && 'retrieve' != eventType) return (callback(null, eventType, context), !0);
        }
        if (!window.XMLHttpRequest) return !1;
        var xhr = new window.XMLHttpRequest;
        if (!("withCredentials" in xhr)) return !1;
        if (8192 < payload.length && !parameters.get(_force_send)) {
          throw beaconSendError(parameters, "request_size", payload.length), new lengthError(payload.length);
          return !1;
        }
        xhr.open("POST", transportAddress, !0);
        xhr.withCredentials = !0;
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.onreadystatechange = function() {
          if (4 == xhr.readyState) {
            try {
              var uuid = this.getResponseHeader('X-Signer-UUID');
              if (uuid && parameters.get(_uuid) != uuid) generateUUID(parameters, uuid);
            }
            catch (err) {}
            callback(null, eventType, context, this);
            xhr = null;
          }
        };
        xhr.send(payload);
        return !0;
      },
      sendWithBeacon = function(parameters, transportAddress, payload, eventType, context, callback) {
        if (parameters && parameters.get(_test_mode)) {
          if (!window.navigator.sendBeacon) return !1;
          log('sendWithBeacon: ' + eventType + ': ' + payload);
          if (parameters.get(_log_only)) return (callback(null, eventType, context), !0);
        }
        return window.navigator.sendBeacon ? window.navigator.sendBeacon(transportAddress, payload) ? (callback(null, eventType, context), !0) : !1 : !1;
      },
      beaconSendError = function(parameters, errorCode, details, errorMsg) {
        var optedOut = parameters ? isOptedOut(parameters.get(_site_id)) : isOptedOut('?');
        if (!optedOut) {
          var payload = ["et=error", "_err=" + errorCode, "_v=ps1", "aip=1"];
          parameters && (payload.push("sig=" + parameters.get(_signer_id)), payload.push("sid=" + parameters.get(_site_id)));
          details && payload.push("_dtl=" + details);
          errorMsg && payload.push("_msg=" + tryEncodeURIComponent(errorMsg.substring(0, 100)));
          payload.push("nc=" + generateRandomValue());
          sendWithImage(parameters, transportHost() + "/send", payload.join("&"), null, null, noop);
          if (parameters && parameters.get(_event_callback)) parameters.get(_event_callback)(errorMsg, parameters.get(_event_type), parameters.get(_context));
        }
      },
      translationExists = function(transportAddress, callback) {
        if (!window.XMLHttpRequest) return !1;
        var xhr = new window.XMLHttpRequest;
        xhr.open("GET", transportAddress, !0);
        xhr.withCredentials = !1;
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.onreadystatechange = function() {
          if (4 == xhr.readyState) {
            callback(this.responseText && this.responseText.indexOf('<Contents>') > -1);
            xhr = null;
          }
        };
        xhr.send();
        return !0;
      };
      
    /**
     * Site Task Store class.
     */
    var TaskStore = function() {
      this.functions = [];
    };
    TaskStore.prototype.add = function(taskFunction) {
      this.functions.push(taskFunction);
    };
    TaskStore.prototype.executeTasks = function(parameters) {
      var f = null, taskFunction = null, e = null;
      try {
        for (var i = 0; i < this.functions.length; i++) {
          f = this.functions[i];
          taskFunction = parameters.get(f);
          taskFunction && isFunction(taskFunction) && taskFunction.call(window, parameters);
        }
      }
      catch (err) {
        e = err;
        var msg = 'Command aborted on: ' + f + ', Error: ' + (err || '').toString();
        trigger('error', msg, parameters.get(_event_type), parameters.get(_context));
        if (parameters.get(_test_mode)) log(msg);
      }
      var cb = parameters.get(_event_callback);
      cb != noop && isFunction(cb) && cb.call(this, e, parameters.get(_event_type), parameters.get(_context)) && parameters.set(_event_callback, noop, !0);
    };

    /**
     * Task functions.
     */
    function optOutFilter(parameters) {
      if (isOptedOut(getParameterValue(parameters, _site_id))) throw "opted_out";
    }

    function isValidProtocol() {
      var a = document.location.protocol;
      if ("http:" != a && "https:" != a) throw "invalid_protocol";
    }

    function buildAction(parameters) {
      try {
        if (!window.navigator.sendBeacon) window.XMLHttpRequest && "withCredentials" in new window.XMLHttpRequest;
      }
      catch (err) {}
      parameters.set(_send_count, getParameterNumber(parameters, _send_count) + 1);
      var qsParams = [];
      ParameterDefinitionMap.map(function(key, paramDef) {
        if (paramDef.shortName) {
          var value = parameters.get(key);
          void 0 != value && value != paramDef.defaultValue && ("boolean" == typeof value && (value *= 1), qsParams.push(paramDef.shortName + "=" + tryEncodeURIComponent(value)));
        }
      });
      qsParams.push("nc=" + generateCacheBuster());
      parameters.set(_event_payload, qsParams.join("&"), !0);
    }

    function sendAction(parameters) {
      var transportAddress = getParameterValue(parameters, _transport_url) || transportHost() + "/send",
        transportType = getParameterValue(parameters, _transport),
        eventType = getParameterValue(parameters, _event_type),
        context = parameters.get(_context),
        payload = getParameterValue(parameters, _event_payload),
        callback = parameters.get(_event_callback) || noop,
        isRetrieve = ("retrieve" == eventType);
      !transportType && window.navigator.sendBeacon && (transportType = "beacon");
      
      if (isRetrieve) sendWithXHR(parameters, transportAddress, payload, eventType, context, callback);
      else if (parameters.get(_disable_sending)) callback(null, eventType, context, payload);
      else if (transportType) {
        "image" == transportType ? sendWithImage(parameters, transportAddress, payload, eventType, context, callback) : "xhr" == transportType && sendWithXHR(parameters, transportAddress, payload, eventType, context, callback) || "beacon" == transportType && sendWithBeacon(parameters, transportAddress, payload, eventType, context, callback) || sendDefault(parameters, transportAddress, payload, eventType, context, callback);
      }
      else sendDefault(parameters, transportAddress, payload, eventType, context, callback);
      parameters.set(_event_callback, noop, !0);
    }
    
    function validatePreviewState() {
      if (window.navigator && "preview" == window.navigator.loadPurpose) throw "preview_state";
    }
    
    var anonymousEvents = [ 'visited', 'displayed' ];
    
    function validateRequiredParameters(parameters) {
      var sid = parameters.get(_site_id),
        sig = parameters.get(_signer_id),
        et = parameters.get(_event_type),
        xtu = parameters.get(_external_url);
      if (isFalsy(sid)) throw "missing_site_id";
      if (isFalsy(sig) && anonymousEvents.indexOf(et) === -1) throw "missing_signer_id";
      if (parameters.get(_external) && (!xtu || !xtu.length)) throw "missing_external_url";
    };

    function enforceRateLimit(parameters) {
      var eventsCalled = getParameterNumber(parameters, _events_called);
      500 <= eventsCalled;
      var eventType = getParameterValue(parameters, _event_type);
      if ("agreed" != eventType && "disagreed" != eventType) {
        var sendsAvailable = getParameterNumber(parameters, _sends_available),
          now = (new Date).getTime(),
          lastSent = getParameterNumber(parameters, _last_sent);
        0 == lastSent && parameters.set(_last_sent, now);
        var replenished = Math.round(2 * (now - lastSent) / 1E3);
        0 < replenished && (sendsAvailable = Math.min(sendsAvailable + replenished, 20), parameters.set(_last_sent, now)); 
        if (0 >= sendsAvailable) throw "rate_limit_exceeded";
        parameters.set(_sends_available, --sendsAvailable);
      }
      parameters.set(_events_called, ++eventsCalled);
    };
    
    function getFlashVersion() {
      var a, b, c;
      if ((c = (c = window.navigator) ? c.plugins : null) && c.length) {
        for (var d = 0; d < c.length && !b; d++) {
          var e = c[d]; - 1 < e.name.indexOf("Shockwave Flash") && (b = e.description);
        }
      }
      if (!b) try { a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"), b = a.GetVariable("$version"); } catch (err) {}
      if (!b) try { a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"), b = "WIN 6,0,21,0", a.AllowScriptAccess = "always", b = a.GetVariable("$version"); } catch (err) {}
      if (!b) try { a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"), b = a.GetVariable("$version"); } catch (err) {}
      b && (a = b.match(/[\d]+/g)) && 3 <= a.length && (b = a[0] + "." + a[1] + " r" + a[2]);
      return b || void 0;
    };
    
    /* Timing Functions */
    var runTiming = function(parameters, callback) {
        var c = Math.min(getParameterNumber(parameters, _speed_sample_rate), 100);
        if (!(hashValue(getParameterValue(parameters, _uuid)) % 100 >= c) && (c = {}, setPageLoadTiming(c) || setExternalPageLoadTiming(c))) {
          var d = c[_loadStep1];
          void 0 == d || Infinity == d || isNaN(d) || (0 < d ? (validateNumber(c, _loadStep3), validateNumber(c, _loadStep6), validateNumber(c, _loadStep5), validateNumber(c, _loadStep2), validateNumber(c, _loadStep4), validateNumber(c, _loadStep7), validateNumber(c, _loadStep8), callback(c)) : listenTo(window, "load", function() {
            runTiming(parameters, callback)
          }, !1));
        }
      },
      setPageLoadTiming = function(parameters) {
        var b = window.performance || window.webkitPerformance,
            b = b && b.timing;
        if (!b) return !1;
        var c = b.navigationStart;
        if (0 == c) return !1;
        parameters[_loadStep1] = b.loadEventStart - c;
        parameters[_loadStep3] = b.domainLookupEnd - b.domainLookupStart;
        parameters[_loadStep6] = b.connectEnd - b.connectStart;
        parameters[_loadStep5] = b.responseStart - b.requestStart;
        parameters[_loadStep2] = b.responseEnd - b.responseStart;
        parameters[_loadStep4] = b.fetchStart - c;
        parameters[_loadStep7] = b.domInteractive - c;
        parameters[_loadStep8] = b.domContentLoadedEventStart - c;
        return !0;
      },
      setExternalPageLoadTiming = function(parameters) {
        if (window.top != window) return !1;
        var b = window.external,
            c = b && b.onloadT;
        b && !b.isValidLoadTime && (c = void 0);
        2147483648 < c && (c = void 0);
        0 < c && b.setPageReadyTime();
        if (void 0 == c) return !1;
        parameters[_loadStep1] = c;
        return !0;
      },
      validateNumber = function(a, b) {
        var c = a[b];
        if (isNaN(c) || Infinity == c || 0 > c) a[b] = void 0;
      },
      sendTiming = function(site) {
        return function(parameters) {
          "displayed" != parameters.get(_event_type) || site.initiatedTiming || (site.initiatedTiming = !0, runTiming(parameters, function(results) {
            site.send("timing", results);
          }));
        }
      };
    
    var generateUUID = function(parameters, uuid) {        
        if ("cookie" == getParameterValue(parameters, _storage)) {
          uuidSet = !1;
          var uuidValue;
          block: {
            var psrValue = getCookieByName(getParameterValue(parameters, _cookie_name));
            if (psrValue && !(1 > psrValue.length)) {
              var psrCookies = [];
              for (var i = 0; i < psrValue.length; i++) {                
                var val,
                  parts = psrValue[i].split(".");
                
                var currentPart = parts.shift();
                if ("ps" == currentPart && 1 < parts.length) {
                  currentPart = parts.shift().split("-");
                  1 == currentPart.length && (currentPart[1] = "1");
                  currentPart[0] *= 1;
                  currentPart[1] *= 1;
                  val = {
                    levels: currentPart,
                    value: parts.join(".")
                  };
                }
                else val = void 0;
                val && psrCookies.push(val);
              }
              if (1 == psrCookies.length) {
                uuidValue = psrCookies[0].value;
                break block;
              }
              if (0 < psrCookies.length) {
                var domainCount = countDomainParts(getParameterValue(parameters, _cookie_domain));
                psrCookies = returnHighestLevelCookie(psrCookies, domainCount, 0);
                if (1 == psrCookies.length) {
                  uuidValue = psrCookies[0].value;
                  break block;
                }
                var pathCount = countPathParts(getParameterValue(parameters, _cookie_path));
                psrCookies = returnHighestLevelCookie(psrCookies, pathCount, 1);
                uuidValue = psrCookies[0] && psrCookies[0].value;
                break block;
              }
            }
            uuidValue = void 0;
          }
          uuidValue && (parameters.data.set(_uuid, uuidValue), uuidSet = !0);
        }
        uuid && parameters.data.set(_uuid, tryEncodeURIComponent(uuid));
        parameters.get(_uuid) || parameters.data.set(_uuid, generateObjectId());        
        setUUIDCookie(parameters);
      },
      setSystemInfo = function(parameters) {
        var b = window.navigator,
          c = window.screen,
          d = document.location;
        
        parameters.set(_referrer, getReferrer(parameters.get(_send_referrer)));
        
        if (document.location) {
          var e = document.location.pathname || "";
          "/" != e.charAt(0) && (e = "/" + e);
          parameters.set(_page_url, document.location.protocol + "//" + document.location.hostname + e + document.location.search);
          parameters.set(_page_domain, document.location.host);
          parameters.set(_page_path, document.location.pathname);
        }
        
        window.screen && parameters.set(_screen_resolution, window.screen.width + "x" + window.screen.height);
        window.screen && parameters.set(_screen_color_depth, window.screen.colorDepth + "-bit");
        var c = document.documentElement,
          g = (e = document.body) && e.clientWidth && e.clientHeight,
          ca = [];
        document.documentElement && document.documentElement.clientWidth && document.documentElement.clientHeight && ("CSS1Compat" === document.compatMode || !g) ? ca = [document.documentElement.clientWidth, document.documentElement.clientHeight] : g && (ca = [e.clientWidth, e.clientHeight]);
        c = 0 >= ca[0] || 0 >= ca[1] ? "" : ca.join("x");
        parameters.set(_screen_dimensions, c);
        parameters.set(_flash_version, getFlashVersion());
        parameters.set(_page_encoding, document.characterSet || document.charset);
        parameters.set(_java_enabled, window.navigator && "function" === typeof window.navigator.javaEnabled && window.navigator.javaEnabled() || !1);
        parameters.set(_browser_locale, getBrowserLocale());
        parameters.set(_browser_timezone, ((new Date).getTimezoneOffset() / 60));
        parameters.set(_operating_system, detectOperatingSystem());
        parameters.set(_environment, detectEnvironment());
      },
      getBrowserLocale = function() {
        return (window.navigator && (window.navigator.language || window.navigator.browserLanguage) || "").toLowerCase();
      },
      detectOperatingSystem = function() {
        var os = "Unknown";
        if (window.navigator && window.navigator.appVersion) {
          var av = window.navigator.appVersion;
          if (-1 < av.indexOf("Win")) os = "Windows";
          else if (-1 < av.indexOf("Mac")) os = "MacOS";
          else if (-1 < av.indexOf("X11")) os = "UNIX";
          else if (-1 < av.indexOf("Linux")) os = "Linux";
        }
        return os;
      },
      detectEnvironment = function() {
        var env = "desktop";
        if (!window.navigator) env = "other";
        else if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(window.navigator.userAgent)) env = "mobile";
        return env;
      };
    
    /* Cookie Functions */
    var uuidSet = !1,
      setUUIDCookie = function(parameters) {
        if ("cookie" == getParameterValue(parameters, _storage)) {
          var name = getParameterValue(parameters, _cookie_name),
            value = generateCookieValue(parameters),
            path = prependSlash(getParameterValue(parameters, _cookie_path)),
            domain = trimPeriod(getParameterValue(parameters, _cookie_domain)),
            expiration = 1E3 * getParameterNumber(parameters, _cookie_expires),
            siteId = getParameterValue(parameters, _site_id);
          if ("auto" != domain) createCookie(name, value, path, domain, siteId, expiration) && (uuidSet = !0);
          else {
            var levels,
              tld;
            block: {
              subdomains = [];
              domain = getHostname().split(".");
              if (4 == domain.length && (tld = domain[domain.length - 1], parseInt(tld, 10) == tld)) {
                levels = ["none"];
                break block;
              }
              for (var level = domain.length - 2; 0 <= level; level--) subdomains.push(domain.slice(level).join("."));
              subdomains.push("none");
              levels = subdomains;
            }
            for (var i = 0; i < levels.length; i++) {
              if (domain = levels[i], parameters.data.set(_cookie_domain, domain), value = generateCookieValue(parameters), createCookie(name, value, path, domain, siteId, expiration)) {
                uuidSet = !0;
                return;
              }
            }
            parameters.data.set(_cookie_domain, "auto");
          }
        }
      },
      validateUUIDCookie = function(parameters) {
        if ("cookie" == getParameterValue(parameters, _storage) && !uuidSet && (setUUIDCookie(parameters), !uuidSet)) throw "uuid_error";
      },
      generateCookieValue = function(parameters) {
        var uuid = encodeParentheses(getParameterValue(parameters, _uuid)),
          domainLevels = countDomainParts(getParameterValue(parameters, _cookie_domain)),
          pathLevels = countPathParts(getParameterValue(parameters, _cookie_path));
        1 < pathLevels && (domainLevels += "-" + pathLevels);
        return ["ps", domainLevels, uuid].join(".");
      },
      returnHighestLevelCookie = function(cookiesArray, domainPathCount, domainPathIndex) {        
        for (var matches = [], lowestMatches = [], lowestCount, i = 0; i < cookiesArray.length; i++) {
          var parts = cookiesArray[i];
          if (parts.levels[domainPathIndex] == domainPathCount) matches.push(parts);
          else (void 0 == lowestCount || parts.levels[domainPathIndex] < lowestCount) ? (lowestMatches = [parts], lowestCount = parts.levels[domainPathIndex]) : parts.levels[domainPathIndex] == lowestCount && lowestMatches.push(parts);
        }
        return 0 < matches.length ? matches : lowestMatches;
      },
      trimPeriod = function(a) {
        return 0 == a.indexOf(".") ? a.substr(1) : a;
      },
      countDomainParts = function(a) {
        return trimPeriod(a).split(".").length;
      },
      prependSlash = function(path) {
        if (!path) return "/";
        1 < path.length && path.lastIndexOf("/") == path.length - 1 && (path = path.substr(0, path.length - 1));
        0 != path.indexOf("/") && (path = "/" + path);
        return path;
      },
      countPathParts = function(path) {
        path = prependSlash(path);
        return "/" == path ? 1 : path.split("/").length;
      };
    
    /**
     * Site Parameter Store class.
     */
    var ParameterStore = function(context) {
        this.data = new DataObject
        if (context) this.context = context;
      },
      ParameterDefinitionMap = new DataObject,
      ParameterDefinitions = [];
    
    ParameterStore.prototype.get = function(name) {
      var paramDef = getParameterDefinition(name),
        value = this.data.get(name);
        paramDef && void 0 == value && (value = isFunction(paramDef.defaultValue) ? paramDef.defaultValue() : paramDef.defaultValue);
      return paramDef && paramDef.getter ? paramDef.getter(this, name, value) : value;
    };
    
    var getParameterValue = function(parameters, name) {
        var value = parameters.get(name);
        return void 0 == value ? "" : "" + value;
      },
      getParameterNumber = function(parameters, name) {
        var value = parameters.get(name);
        return void 0 == value || "" === value ? 0 : 1 * value;
      };
      
    ParameterStore.prototype.set = function(name, value, override) {
      if (name) {
        if ("object" == typeof name) {
          for (var key in name) name.hasOwnProperty(key) && setParameterValue(this, key, name[key], override);
        }
        else setParameterValue(this, name, value, override);
      }
    };
    
    var setParameterValue = function(params, name, value, override) {
      if (void 0 != value) {
        switch (name) {
          case _site_id:
            isValidSiteId.test(value);
        }
      }
      var paramDef = getParameterDefinition(name);
      paramDef && paramDef.setter ? paramDef.setter(params, name, value, override) : params.data.set(name, value, override);
    };
    
    ParameterStore.prototype.toObject = function() {
      var obj = {}, key, val;
      for (var i = 0; i < this.data.keys.length; i++) {
        key = this.data.keys[i];
        val = this.get(key);
        if (!isFunction(val)) obj[key] = val;
      }
      return obj;
    };
    
    /**
     * Parameter Definition class.
     */
    var ParameterDefinition = function(name, shortName, defaultValue, getter, setter) {
        this.name = name;
        this.shortName = shortName;
        this.getter = getter;
        this.setter = setter;
        this.defaultValue = defaultValue;
      },
      getParameterDefinition = function(name) {
        var paramDef = ParameterDefinitionMap.get(name);
        if (!paramDef) {
          for (var c = 0; c < ParameterDefinitions.length; c++) {
            var d = ParameterDefinitions[c],
                e = d[0].exec(name);
            if (e) {
              paramDef = d[1](e);
              ParameterDefinitionMap.set(paramDef.name, paramDef);
              break;
            }
          }
        }
        return paramDef;
      },
      getParameterName = function(shortName) {
        var found;
        ParameterDefinitionMap.map(function(key, parameter) {
            parameter.shortName == shortName && (found = parameter);
        });
        return found && found.name;
      },
      defineParameter = function(parameter, shortName, defaultValue, getter, setter) {
        parameter = new ParameterDefinition(parameter, shortName, defaultValue, getter, setter);
        ParameterDefinitionMap.set(parameter.name, parameter);
        return parameter.name;
      },
      defineParameterGroup = function(name, paramDef) {
        ParameterDefinitions.push([new RegExp("^" + name + "$"), paramDef]);
      },
      defineProperty = function(propertyName, shortName, defaultValue) {
        return defineParameter(propertyName, shortName, defaultValue, void 0, noop)
      },
      elementGetter = function(parameterStore, name, value) {
        return getElement(value);
      },
      elementSetter = function(parameterStore, name, value, override) {
        var sel = null;
        if (value) sel = isString(value) ? value : getElementSelector(value);
        if (!sel) sel = value;
        parameterStore.data.set(name, sel, override);
      },
      emitSetter = function(parameterStore, name, value, override) {
        parameterStore.data.set(name, value, override);
        if (!override) {
          trigger('set', name, value, (parameterStore.context || parameterStore));
          trigger('set:' + name, value, (parameterStore.context || parameterStore));
          emit('set:' + name, value, parameterStore.get(_element));
          emit('set', { name: name, value: value }, parameterStore.get(_element));
        }
      },
      numberSetter = function(parameterStore, name, value, override) {
        var val = parseInt(value);
        if (val) parameterStore.data.set(name, val, override);
      };

    /**
     * Parameter Definitions.
     */        
    var _globalName = isString(window.PactSafeObject) && removeUnicodeSpaces(window.PactSafeObject) || "_ps",
        _forceSSL = !1;
        
    var _api_version = defineProperty("api_version", "v"),
      _library_version = defineProperty("library_version", "_v"),
      _name = defineProperty("name"),
      _uuid = defineProperty("uuid", "uid"),
      _cookie_name = defineProperty("cookie_name", void 0, "_psr"),
      _cookie_domain = defineProperty("cookie_domain"),
      _cookie_path = defineProperty("cookie_path", void 0, "/"),
      _cookie_expires = defineProperty("cookie_expires", void 0, 63072E3),
      _storage = defineProperty("storage", void 0, "cookie"),
      _sample_rate = defineProperty("sample_rate", "sf", 100),
      _speed_sample_rate = defineProperty("speed_sample_rate", void 0, 1),
      _send_referrer = defineProperty("send_referrer", void 0, !0);
    
    var _site_id = defineParameter("site_id", "sid"),
      _event_type = defineParameter("event_type", "et"),
      _signer_id = defineParameter("signer_id", "sig", void 0, void 0, emitSetter),
      _revisions = defineParameter("revisions", "rev"),
      _versions = defineParameter("versions", "vid"),
      _contracts = defineParameter("contracts", "cid"),
      _group = defineParameter("group", "gid"),
      _request = defineParameter("request", "srid"),
      _custom_data = defineParameter("custom_data", "cus"),
      _non_interaction = defineParameter("non_interaction", "ni"),
      _external = defineParameter("external", "xt"),
      _external_url = defineParameter("external_url", "xtu"),
      _confirmation_email = defineParameter("confirmation_email", "cnf"),
      _test_mode = defineParameter("test_mode", "tm"),
      _log_only = defineParameter("log_only"),
      _disable_sending = defineParameter("disable_sending"),
      _force_send = defineParameter("force_send"),
      _localized = defineParameter("localized", void 0, !1);
      
    var _page_title = defineParameter("page_title", "pat", function() { return document.title || void 0 }),
      _page_url = defineParameter("page_url", "pau"),
      _page_domain = defineParameter("page_domain", "pad"),
      _page_path = defineParameter("page_path", "pap"),
      _page_query = defineParameter("page_query", "paq"),
      _page_encoding = defineParameter("page_encoding", "pae"),
      _hostname = defineParameter("hostname", "hn", getHostname()),
      _referrer = defineParameter("referrer", "ref"),
      _browser_timezone = defineParameter("browser_timezone", "btz"),
      _browser_locale = defineParameter("browser_locale", "bl"),
      _user_agent = defineParameter("user_agent", "bua"),
      _java_enabled = defineParameter("java_enabled", "bje"),
      _flash_version = defineParameter("flash_version", "bfv"),
      _device_fingerprint = defineParameter("device_fingerprint", "df"),
      _operating_system = defineParameter("operating_system", "os"),
      _environment = defineParameter("environment", "env"),
      _screen_color_depth = defineParameter("screen_color_depth", "scd"),
      _screen_resolution = defineParameter("screen_resolution", "res"),
      _screen_dimensions = defineParameter("screen_dimensions", "dim"),
      _cookies = defineParameter("cookies", "ck"),
      _nonce = defineParameter("nonce", "nc");
    
    var _context = defineParameter("_context"),
      _event_callback = defineParameter("event_callback"),
      _event_payload = defineParameter("event_payload"),
      _transport = defineParameter("transport"),
      _transport_url = defineParameter("transport_url");
      
    var _events_called = defineParameter("_ec", void 0, 0),
      _last_sent = defineParameter("_last_sent", void 0, 0),
      _sends_available = defineParameter("_sends_available", void 0, 20),
      _send_count = defineParameter("_s", "_s"),
      _rate = defineParameter("_r", "_r"),
      _ct = defineParameter("_ct", "_ct");
    
    var _loadStep1 = defineParameter("l1", "plt"),
      _loadStep2 = defineParameter("l2", "pdt"),
      _loadStep3 = defineParameter("l3", "dns"),
      _loadStep4 = defineParameter("l4", "rrt"),
      _loadStep5 = defineParameter("l5", "srt"),
      _loadStep6 = defineParameter("l6", "tcp"),
      _loadStep7 = defineParameter("l7", "dit"),
      _loadStep8 = defineParameter("l8", "clt"),
      _timingCategory = defineParameter("timingCategory", "utc"),
      _timingVar = defineParameter("timingVar", "utv"),
      _timingLabel = defineParameter("timingLabel", "utl"),
      _timingValue = defineParameter("timingValue", "utt");
        
    defineParameter("forceSSL", void 0, void 0, function() { return _forceSSL }, function(a, b, c) { _forceSSL = !!c });
    
    defineParameterGroup("\\&(.*)", function(a) {
      var b = new ParameterDefinition(a[0], a[1]),
        c = getParameterName(a[0].substring(1));
      c && (b.getter = function(a) {
          return a.get(c)
        },
        b.setter = function(a, b, g, ca) {
          a.set(c, g, ca)
        },
        b.shortName = void 0);
      return b;
    });
    
    var _key = defineParameter("key", "gkey"),
      _type = defineParameter("type"),
      _selector = defineParameter("selector"),
      _container_selector = defineParameter("container_selector"),
      _element = defineParameter("_element", void 0, void 0, elementGetter, elementSetter),
      _form_selector = defineParameter("form_selector", void 0, void 0, void 0, emitSetter),
      _signer_id_selector = defineParameter("signer_id_selector", void 0, void 0, void 0, emitSetter),
      _contract_html = defineParameter("contract_html"),
      _block_form_submission = defineParameter("block_form_submission"),
      _alert_message = defineParameter("alert_message"),
      _auto_run = defineParameter("auto_run"),
      _display_all = defineParameter("display_all"),
      _agreed = defineParameter("agreed"),
      _send_displayed = defineParameter("send_displayed", void 0, !0),
      _allow_disagreed = defineParameter("allow_disagreed"),
      _hidden_input_selector = defineProperty("hidden_input_selector"),
      _dynamic = defineParameter("dynamic", "dyn"),
      _render_id = defineParameter("render_id", "rdid"),
      _render_data = defineParameter("render_data", "rnd");
    
    var _object_name = defineParameter("object_name"),
      _contract_class = defineParameter("contract_class"),
      _data_attr = defineParameter("data_attr");
    
    var _respondent_id = defineParameter("respondent_id", void 0, void 0, function(p) { return p.get(_signer_id) }, function(p, n, v, o) { p.set(_signer_id, v, o) }),
      _agreements = defineParameter("agreements", void 0, void 0, function(p) { return p.get(_contracts) }, function(p, n, v, o) { p.set(_contracts, v, o) }),
      _agreement_group = defineParameter("agreement_group", void 0, void 0, function(p) { return p.get(_group) }, function(p, n, v, o) { p.set(_group, v, o) }),
      _respondent_id_selector = defineParameter("respondent_id_selector", void 0, void 0, function(p) { return p.get(_signer_id_selector) }, function(p, n, v, o) { p.set(_signer_id_selector, v, o) }),
      _agreement_html = defineParameter("agreement_html", void 0, void 0, function(p) { return p.get(_contract_html) }, function(p, n, v, o) { p.set(_contract_html, v, o) });
    
    var _src = defineProperty("src"),
      _class_name = defineProperty("class_name"),
      _target_selector = defineParameter("target_selector"),
      _style = defineParameter("style"),
      _position = defineParameter("position", void 0, void 0, void 0, emitSetter),
      _stylesheet = defineParameter("stylesheet"),
      _legal_center_url = defineParameter("legal_center_url"),
      _open_legal_center = defineParameter("open_legal_center"),
      _always_visible = defineParameter("always_visible", void 0, void 0, void 0, emitSetter),
      _badge_text = defineParameter("badge_text"),
      _badge_updater = defineParameter("badge_updater"),
      _scroll_element = defineParameter("scroll_element", void 0, void 0, elementGetter, elementSetter),
      _badge_element = defineParameter("badge_element", void 0, void 0, elementGetter, elementSetter),
      _update_interval = defineParameter("update_interval", void 0, 250, void 0, numberSetter),
      _mutation_observer = defineParameter("mutation_observer");
      
    var _optOutTask = defineProperty("_oot"),
      _previewTask = defineParameter("previewTask"),
      _checkProtocolTask = defineParameter("checkProtocolTask"),
      _validationTask = defineParameter("validationTask"),
      _checkStorageTask = defineParameter("checkStorageTask"),
      _rateLimitTask = defineParameter("_rlt"),
      _buildActionTask = defineParameter("buildActionTask"),
      _sendActionTask = defineParameter("sendActionTask"),
      _timingTask = defineParameter("timingTask");
        
    function defineMethod(methodName, obj, actualMethod) {
      obj[methodName] = function() {
        try { return actualMethod.apply(this, arguments) }
        catch (err) { throw beaconSendError(null, "exec", methodName, err && err.name), err; }
      }
    };
    
    /**
     * Site Group Store class.
     */
    var GroupStore = function() {
        this.initialized = new DataObject;
        this.loaded = new DataObject;
      },
      GroupDefinitionMap = new DataObject;
    
    GroupStore.prototype.get = function(key) {
      return this.initialized.get(key);
    };
    
    GroupStore.prototype.add = function(site, key, type, options, callback) {
      var obj;
      if (key) {
        if ('object' == typeof type) obj = type;
        else if (isFunction(type)) obj = new type(options);
        else if (isString(type) && GroupDefinitionMap.get(type)) {
          var factory = GroupDefinitionMap.get(type).factory;
          obj = new factory(options);
        }
      }
      if (obj) {
        obj.site = site;
        this.initialized.set(key, obj);
        trigger('initialized', key, obj);
        emit('initialized', obj, obj.get(_element));
        callback && isFunction(callback) && callback.call(this, null, obj);
      }
    };
    
    GroupStore.prototype.getLoading = function(key) {
      return this.loaded.get(key);
    };
    
    GroupStore.prototype.setLoading = function(key, type) {
      if (key) this.loaded.set(key, type);
    };
    
    /**
     * Group Definition class.
     */
    var GroupDefinition = function(type, factory) {
      this.type = type;
      this.factory = factory;
    };
    
    var defineGroup = function(type, factory) {
      if (!isFunction(factory)) factory = noop;
      var group = new GroupDefinition(type, factory);
      GroupDefinitionMap.set(group.type, group);
      return group.type;
    };
    
    /**
     * Site class.
     */
    var Site = function(options) {
      var self = this;
      self.render = self.render.bind(self);
      
      function setParameter(key, value) {
        self.parameters.data.set(key, value)
      }
      
      function addTask(key, taskFunction) {
        setParameter(key, taskFunction);
        self.tasks.add(key)
      }
      
      self.parameters = new ParameterStore(self);
      self.tasks = new TaskStore;
      self.groups = new GroupStore;
      
      setParameter(_name, options[_name]);
      setParameter(_site_id, removeUnicodeSpaces(options[_site_id]));
      setParameter(_cookie_name, options[_cookie_name]);
      setParameter(_cookie_domain, options[_cookie_domain] || 'auto');
      setParameter(_cookie_path, options[_cookie_path]);
      setParameter(_cookie_expires, options[_cookie_expires]);
      setParameter(_sample_rate, options[_sample_rate]);
      setParameter(_speed_sample_rate, options[_speed_sample_rate]);
      setParameter(_send_referrer, options[_send_referrer]);
      setParameter(_localized, options[_localized]);
      setParameter(_storage, options[_storage]);
      setParameter(_signer_id, options[_signer_id] || options[_respondent_id]);
      setParameter(_custom_data, options[_custom_data]);
      setParameter(_event_callback, options[_event_callback]);
      setParameter(_test_mode, options[_test_mode]);
      setParameter(_log_only, options[_log_only]);
      setParameter(_disable_sending, options[_disable_sending]);
      setParameter(_force_send, options[_force_send]);
      setParameter(_dynamic, options[_dynamic]);
      setParameter(_transport, options[_transport] || 'xhr');
      setParameter(_transport_url, options[_transport_url]);
      setParameter(_api_version, 1);
      setParameter(_library_version, "ps1");
      
      addTask(_optOutTask, optOutFilter);
      addTask(_previewTask, validatePreviewState);
      addTask(_checkProtocolTask, isValidProtocol);
      addTask(_validationTask, validateRequiredParameters);
      addTask(_checkStorageTask, validateUUIDCookie);
      addTask(_rateLimitTask, enforceRateLimit);
      addTask(_buildActionTask, buildAction);
      addTask(_sendActionTask, sendAction);
      addTask(_timingTask, sendTiming(self));
      
      generateUUID(self.parameters, options[_uuid]);
      setSystemInfo(self.parameters);
      
      _listenTo('set:' + _signer_id, self.render);
    };
        
    Site.prototype.get = function(name) {
      return this.parameters.get(name);
    };
    
    Site.prototype.set = function(name, value) {
      this.parameters.set(name, value);
    };
    
    Site.prototype.getByKey = function(key) {
      return this.groups.get(key);
    };
    
    Site.prototype.getAllGroups = function() {
      var groups = [];
      this.groups.initialized.map(function(k, g) { groups.push(g); });
      return groups;
    };
    
    var sendCommandOptions = {
      agreed: [_contracts, _versions, _group, _event_callback],
      disagreed: [_contracts, _versions, _group, _event_callback],
      displayed: [_contracts, _versions, _group, _event_callback],
      updated: [],
      retrieve: [_contracts, _event_callback],
      visited: [_contracts, _versions, _group, _event_callback],
      timing: [_timingCategory, _timingVar, _timingValue, _timingLabel]
    };
    
    Site.prototype.send = function(a) {
      if (!(1 > arguments.length)) {
        var eventType, overrides, callback;
        if ("string" === typeof arguments[0]) {
          eventType = arguments[0];
          overrides = [].slice.call(arguments, 1);
        }
        else {
          eventType = arguments[0] && arguments[0][_event_type];
          overrides = arguments;
        }
        if (eventType) {
          overrides = toObject(sendCommandOptions[eventType] || [], overrides);
          callback = overrides[_event_callback] || this.parameters.get(_event_callback) || noop;
          overrides[_event_type] = eventType;
          overrides[_context] = overrides[_context] || this;
          overrides[_event_callback] = wrapCallback(callback, overrides);
          this.parameters.set(overrides, void 0, !0);
          this.tasks.executeTasks(this.parameters);
          this.parameters.data.overrides = {};
        }
      }
    };
        
    Site.prototype.retrieve = function(a) {
      if (!(1 > arguments.length)) {
        var eventType = "retrieve",
          overrides = toObject(sendCommandOptions[eventType], arguments),
          callback = overrides[_event_callback] || this.parameters.get(_event_callback) || noop;
        overrides[_event_type] = eventType;
        overrides[_transport_url] = transportHost() + "/" + eventType;
        overrides[_transport] = "xhr";
        overrides[_event_callback] = parseRetrieve(callback);
        overrides[_context] = overrides[_context] || this;
        this.parameters.set(overrides, void 0, !0);
        this.tasks.executeTasks(this.parameters);
        this.parameters.data.overrides = {};
      }
    };
    
    Site.prototype.initialize = function(a) {
      if (!(2 > arguments.length)) {
        var groupName = arguments[0],
          groupType = arguments[1],
          groupOptions = (arguments.length > 2 && 'object' == typeof arguments[2]) ? arguments[2] : {},
          loaded = this.groups.getLoading(groupName),
          cb = noop;
          
        if (loaded !== !1) {
          if (loaded && loaded !== !0) {
            if (loaded[_event_callback] && isFunction(loaded[_event_callback])) cb = loaded[_event_callback];
            if ('object' == typeof loaded) {
              for (var k in loaded) if (loaded.hasOwnProperty(k)) groupOptions[k] = loaded[k];
            }
          }
          if (!loaded) this.groups.setLoading(groupName, !0);
          this.groups.add(this, groupName, groupType, groupOptions, cb);
        }
      }
    };
    
    var loadCommandOptions = [_selector, _event_callback];
    
    Site.prototype.load = function(a) {
      if (!(1 > arguments.length)) {
        var groupName = arguments[0], opts, cb, val, host, prefix, fname, loc, dyn;
        if (!isBlank(groupName)) {
          if (arguments.length == 3 && isFunction(arguments[2])) {
            opts = toObject(loadCommandOptions, [arguments[1]]);
            opts[_event_callback] = arguments[2];
          }
          else opts = toObject(loadCommandOptions, [].slice.call(arguments, 1));
          opts[_key] = groupName;
          cb = (opts[_event_callback] && isFunction(opts[_event_callback])) ? opts[_event_callback] : noop;
          
          if (!this.groups.getLoading(groupName)) {
            this.groups.setLoading(groupName, opts);
            this.parameters.set(opts, void 0, !0);
            
            //Build url for dynamic groups
            dyn = this.get(_dynamic);
            host = (_forceSSL || isHTTPS() ? "https:" : "http:") + "//" + (dyn ? _PactSafe.envAPI : _PactSafe.envVault) + "/";
            loc = this.get(_browser_locale);
            if (dyn) {
              prefix = "load/";
              buildAction(this.parameters);
              fname = "group.js?" + this.parameters.get(_event_payload);
            }
            else {
              prefix = "s/" + this.get(_site_id) + "/groups/" + groupName + "/";
              fname = "group.js";
            }
            this.parameters.data.overrides = {};
            
            if (opts[_src] != null) createScriptElement(opts[_src], cb);
            else if (!dyn && this.get(_localized) && loc && loc.indexOf("en") != 0) {
              fname = "group-" + loc + ".js";
              translationExists(host + "?prefix=" + prefix + fname + "&max-keys=1", function(exists) {
                if (!exists) fname = "group.js";
                createScriptElement(host + prefix + fname, cb);
              });
            }
            else createScriptElement(host + prefix + fname, cb);
          }
          else if (this.groups.get(groupName)) cb.call(this, null, this.groups.get(groupName));
          else this.groups.setLoading(groupName, opts);
        }
      }
    };
    
    Site.prototype.render = function(a) {
      var args = [].slice.call(arguments);
      this.groups.initialized.map(function(k, v) {
        if (v.render) v.render.apply(v, args);
      });
    };
    
    var wrapCallback = function(callback, overrides) {
      return function(err, event_type, context, payload) {
        callback(err, event_type, context, payload);
        if (!err) trigger('sent', event_type, { contracts: overrides[_contracts], versions: overrides[_versions], group: overrides[_group] }, context, payload);
      }
    };
    
    var parseRetrieve = function(callback) {
      return function(err, event_type, context, xhr) {
        var responseJSON;
        if (xhr && xhr.response) {
          try {
            responseJSON = _json._parse(xhr.responseText);
          }
          catch (err) {}
        }
        if (!err) trigger('retrieved', responseJSON, xhr, context);
        if (context && isFunction(context.handleRetrieve)) context.handleRetrieve(err, responseJSON, xhr, context);
        callback(err, responseJSON, xhr, context);
      }
    };
    
    /**
     * Custom Events.
     */
    function createEvent(eventName, details) {
      var event;
      if (isFunction(document.defaultView.CustomEvent)) {
        event = new CustomEvent(eventName, {
          'bubbles': !0,
          'cancelable': !1,
          'detail': details
        });
      }
      else if (document.createEvent) {
        event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, !0, !1);
      }
      else if (document.createEventObject) {
        event = document.createEventObject();
        event.eventType = eventName;
      }
      event.eventName = eventName;
      return event;
    }
    
    /**
     * Clickwrap Group class.
     */
    var ClickwrapGroup = function(options) {
      var self = this;
      self.render = self.render.bind(self);
      
      function setParameter(key, value) {
        self.parameters.data.set(key, value);
      }

      self.parameters = new ParameterStore(self);
      self.agreed = new ParameterStore(self);
      self.checked = new ParameterStore(self);
      self.displayed = {};
      self.sent = {};
      
      self.rendered = !1;
      self.inputInjected = !1;
      self.signerIdListening = !1;
      
      setParameter(_object_name, options[_contracts] ? 'contract' : 'agreement');
      setParameter(_contract_class, 'ps-' + self.get(_object_name));
      setParameter(_data_attr, options[_contracts] ? 'cid' : 'aid');
      
      setParameter(_key, options[_key]);
      setParameter(_type, options[_type]);
      setParameter(_group, options[_group] || options[_agreement_group]);
      setParameter(_request, options[_request]);
      setParameter(_container_selector, (options[_selector] || options[_container_selector]));
      setParameter(_form_selector, options[_form_selector]);
      setParameter(_hidden_input_selector, options[_hidden_input_selector] || '__ps-' + self.get(_object_name) + 's');
      setParameter(_element, (options[_selector] || options[_container_selector]));
      setParameter(_signer_id_selector, options[_signer_id_selector] || options[_respondent_id_selector]);
      setParameter(_contracts, options[_contracts] || options[_agreements] || []);
      setParameter(_versions, options[_versions] || []);
      setParameter(_revisions, options[_revisions]);
      setParameter(_contract_html, options[_contract_html] || options[_agreement_html]);
      setParameter(_block_form_submission, options[_block_form_submission]);
      setParameter(_alert_message, options[_alert_message] || '');
      setParameter(_auto_run, options[_auto_run]);
      setParameter(_display_all, options[_display_all]);
      setParameter(_confirmation_email, options[_confirmation_email]);
      setParameter(_send_displayed, options[_send_displayed]);
      setParameter(_allow_disagreed, options[_allow_disagreed]);
      setParameter(_agreed, !1);
      
      setParameter(_dynamic, options[_dynamic]);
      setParameter(_render_id, options[_render_id]);
      setParameter(_render_data, options[_render_data]);
      
      for (var i = 0; i < self.get(_contracts).length; i++) {
        self.agreed.data.set(self.get(_contracts)[i], !1);
        self.checked.data.set(self.get(_contracts)[i], !1);
      }
      
      _PactSafe('onReady', function() { self.listenForElement(self.get(_container_selector), self.render) });
      
      if (self.get(_signer_id_selector)) _PactSafe('onReady', function() { self.listenForElement(self.get(_signer_id_selector), self.listenForSignerId.bind(self)) });
      else _listenTo('set:' + _signer_id_selector, function() { self.listenForElement(self.get(_signer_id_selector), self.listenForSignerId.bind(self)) });
      if (!self.get(_form_selector)) _listenTo('set:' + _form_selector, function() { self.listenForElement(self.get(_form_selector), self.injectHiddenInput.bind(self)) });
    };
    
    ClickwrapGroup.prototype.get = function(name) {
      return this.parameters.get(name);
    };
    
    ClickwrapGroup.prototype.set = function(name, value) {
      this.parameters.set(name, value);
    };
    
    ClickwrapGroup.prototype.send = function(a) {
      var self = this;
      if (!(1 > arguments.length)) {
        var eventType, overrides, cb;
        if ("string" === typeof arguments[0]) {
          eventType = arguments[0];
          overrides = [].slice.call(arguments, 1);
        }
        else {
          eventType = arguments[0] && arguments[0][_event_type];
          overrides = arguments;
        }
        if (eventType) {
          overrides = toObject(sendCommandOptions[eventType] || [], overrides);
          overrides[_contracts] = overrides[_contracts] || self.get(_contracts);
          overrides[_versions] = overrides[_versions] || self.get(_versions);
          overrides[_revisions] = overrides[_revisions] || self.get(_revisions);
          overrides[_group] = self.get(_group);
          overrides[_request] = self.get(_request);
          overrides[_event_type] = eventType;
          overrides[_confirmation_email] = self.get(_confirmation_email);
          overrides[_dynamic] = self.get(_dynamic);
          overrides[_render_id] = self.get(_render_id);
          overrides[_context] = self;
          cb = isFunction(overrides[_event_callback]) ? overrides[_event_callback] : null;
          if (!cb && isFunction(self.site.get(_event_callback))) cb = self.site.get(_event_callback);
          overrides[_event_callback] = function(err) {
            if (!err) {
              if (eventType == 'agreed') {
                var sig = self.site.get(_signer_id);
                for (var i = 0; i < overrides[_contracts].length; i++) {
                  self.agreed.data.set(overrides[_contracts][i], !0);
                  self.sent[overrides[_contracts][i]] = sig;
                }
              }
              else if (eventType == 'disagreed') {
                for (var i = 0; i < overrides[_contracts].length; i++) {
                  self.agreed.data.set(overrides[_contracts][i], !1);
                  self.sent[overrides[_contracts][i]] = !1;
                }
              }
              emit(eventType, overrides, self.get(_element));
            }
            self.updateHiddenInput(!self.block());
            cb && isFunction(cb) && cb.apply(this, arguments);
          };
          self.site.send(eventType, overrides);
        }
      }
    };
    
    ClickwrapGroup.prototype.getData = function() {
      var self = this,
        data = {};
      data[_contracts] = self.get(_contracts);
      data[_versions] = self.get(_versions);
      data[_group] = self.get(_group);
      if (self.get(_revisions)) data[_revisions] = self.get(_revisions);
      if (self.get(_request)) data[_request] = self.get(_request);
      if (self.get(_render_id)) data[_render_id] = self.get(_render_id);
      if (self.get(_render_data)) data[_render_data] = self.get(_render_data);
      return data;
    };
    
    ClickwrapGroup.prototype.getAgreed = function() {
      var self = this,
        contracts = self.get(_contracts),
        versions = self.get(_versions),
        revisions = self.get(_revisions),
        cid = [],
        vid = [],
        rev = [];
      for (var i = 0; i < contracts.length; i++) {
        if (self.agreed.data.get(contracts[i])) {
          cid.push(contracts[i]);
          vid.push(versions[i]);
          if (revisions) rev.push(revisions[i]);
        }
      }
      var data = {};
      data[_contracts] = cid;
      data[_versions] = vid;
      data[_group] = self.get(_group);
      if (revisions) data[_revisions] = rev;
      if (self.get(_request)) data[_request] = self.get(_request);
      if (self.get(_render_id)) data[_render_id] = self.get(_render_id);
      return data;
    };
    
    ClickwrapGroup.prototype.getInvalid = function() {
      var self = this,
        contracts = self.get(_contracts),
        versions = self.get(_versions),
        revisions = self.get(_revisions),
        cid = [],
        vid = [],
        rev = [];
      for (var i = 0; i < contracts.length; i++) {
        if (!self.agreed.data.get(contracts[i])) {
          cid.push(contracts[i]);
          vid.push(versions[i]);
          if (revisions) rev.push(revisions[i]);
        }
      }
      var data = {};
      data[_contracts] = cid;
      data[_versions] = vid;
      data[_group] = self.get(_group);
      if (revisions) data[_revisions] = rev;
      if (self.get(_request)) data[_request] = self.get(_request);
      if (self.get(_render_id)) data[_render_id] = self.get(_render_id);
      return data;
    };
    
    ClickwrapGroup.prototype.getChecked = function(skipAgreed) {
      var self = this,
        contracts = self.get(_contracts),
        versions = self.get(_versions),
        revisions = self.get(_revisions),
        cid = [],
        vid = [],
        rev = [];
      for (var i = 0; i < contracts.length; i++) {
        if (self.checked.data.get(contracts[i]) && (!skipAgreed || !self.agreed.data.get(contracts[i]))) {
          cid.push(contracts[i]);
          vid.push(versions[i]);
          if (revisions) rev.push(revisions[i]);
        }
      }
      var data = {};
      data[_contracts] = cid;
      data[_versions] = vid;
      data[_group] = self.get(_group);
      if (revisions) data[_revisions] = rev;
      if (self.get(_request)) data[_request] = self.get(_request);
      if (self.get(_render_id)) data[_render_id] = self.get(_render_id);
      return data;
    };
    
    ClickwrapGroup.prototype.sendChecked = function(skipAgreed) {
      var self = this,
        data = self.getChecked(skipAgreed);
      if (data[_contracts].length) {
        self.send('agreed', data);
        return !0;
      }
      return !1;
    };
    
    ClickwrapGroup.prototype.sendDisplayed = function() {
      var self = this,
        el = self.get(_element),
        sig = self.site.get(_signer_id) || !1,
        cid = [],
        vid = [],
        rev = [];
      if (el && sig) {
        var cel = self.getContractElements(),
          attr = self.get(_data_attr);
        for (var i = 0; i < cel.length; i++) {
          if (cel[i].style.display == 'block') {
            cid = cid.concat((getAttribute(cel[i], 'data-' + attr) || '').split(','));
            vid = vid.concat((getAttribute(cel[i], 'data-vid') || '').split(','));
            rev = rev.concat((getAttribute(cel[i], 'data-rev') || '').split(','));
          }
        }
        if (cid.length) {
          var data = {};
          data[_contracts] = [];
          data[_versions] = [];
          if (rev.length) data[_revisions] = [];
          for (var i = 0; i < cid.length; i++) {
            if (self.displayed[cid[i]] !== sig) {
              self.displayed[cid[i]] = sig;
              data[_contracts].push(cid[i]);
              data[_versions].push(vid[i]);
              if (rev.length) data[_revisions].push(rev[i]);
            }
          }
          if (self.get(_render_id)) data[_render_id] = self.get(_render_id);
          if (data[_contracts].length && self.get(_send_displayed)) self.send('displayed', data);
        }
      }
    };
    
    ClickwrapGroup.prototype.listenForElement = function(sel, cb) {
      var self = this,
        _found = false,
        _handler = null;
      _handler = function(e, observer) {
        if (_found) return;
        var el = getElement(sel);
        if (el) {
          _found = true;
          if (observer && isFunction(observer.disconnect)) observer.disconnect();
          else stopListening(document, 'DOMNodeInserted', _handler, !1);
          cb && isFunction(cb) && cb.call(this);
        }
      };
      var observer = null;
      if (window.MutationObserver && isFunction(window.MutationObserver)) {
        observer = new MutationObserver(_handler);
        observer.observe(document, { attributes: true, childList: true, subtree: true });
      }
      else listenTo(document, "DOMNodeInserted", _handler, !1);
      _handler(null, observer);
    };
    
    ClickwrapGroup.prototype.listenForSignerId = function() {
      var sigEl = getElement(this.get(_signer_id_selector));
      if (sigEl && !this.signerIdListening) {
        this.signerIdListening = !0;
        if (sigEl.value) this.site.set(_signer_id, sigEl.value);
        listenTo(sigEl, "change", this.handleInput.bind(this));
        listenTo(sigEl, "autofill", this.handleInput.bind(this));
      }
    };

    ClickwrapGroup.prototype.injectHiddenInput = function() {
      var formEl = getElement(this.get(_form_selector));
      if (formEl && !this.inputInjected) {
        this.inputInjected = !0;
        var hiddenInput = document.createElement('input');
        setAttribute(hiddenInput, [ 'type', 'name', 'class' ], [ 'hidden', this.get(_hidden_input_selector), this.get(_hidden_input_selector) ]);
        hiddenInput.value = !1;
        formEl.appendChild(hiddenInput);
      }
      this.updateHiddenInput(!this.block());
    };
    
    ClickwrapGroup.prototype.updateHiddenInput = function(val) {
      var formEl = getElement(this.get(_form_selector)),
        el = this.get(_element),
        changed = this.get(_agreed) != val;
      this.set(_agreed, val);
      if (el) {
        setAttribute(el, 'data-all-agreed', val);
        this.updateAgreedAttributes();
      }
      if (formEl && this.inputInjected) {
        var hiddenInput = getByClassName(formEl, this.get(_hidden_input_selector));
        if (hiddenInput && 0 < hiddenInput.length) hiddenInput[0].value = val;
        if (this.get(_block_form_submission)) {
          var submitBtn = this.getFormSubmit();
          if (submitBtn && !val) submitBtn.setCustomValidity(this.get(_alert_message));
          else if (submitBtn && val) submitBtn.setCustomValidity('');
        }
      }
      if (changed) {
        if (val) trigger('valid', this.getData(), this);
        else trigger('invalid', this.getData(), this);
        emit('validated', val, el);
      }
    };
    
    ClickwrapGroup.prototype.updateAgreedAttributes = function() {
      var el = this.get(_element);
      if (el) {
        var cel = this.getContractElements(),
          cid = [],
          agreed = !1,
          attr = this.get(_data_attr);
        for (var i = 0; i < cel.length; i++) {
          cid = (getAttribute(cel[i], 'data-' + attr) || '').split(',');
          agreed = !0;
          for (var c = 0; c < cid.length; c++) {
            if (this.agreed.data.get(cid[c]) === !1) {
              agreed = !1;
              break;
            }
          }
          setAttribute(cel[i], 'data-agreed', agreed);
        }
      }
    };
    
    ClickwrapGroup.prototype.getContractElements = function() {
      var el = this.get(_element);
      return el ? getByClassName(el, this.get(_contract_class)) : [];
    };
    
    ClickwrapGroup.prototype.getFormSubmit = function() {
      var formEl = getElement(this.get(_form_selector)),
        btn;
      if (formEl) btn = findInputByType(formEl, 'input', 'submit') || findInputByType(formEl, 'button', 'submit');
      return btn;
    };
    
    ClickwrapGroup.prototype.render = function(force) {
      var self = this,
        el = self.get(_element);
      if (!self.rendered || force === !0) {
        self.injectHiddenInput();
        if (el) {
          self.injectHTML(el);
          self.rendered = true;
          trigger('rendered', self);
          emit('rendered', self, el);
        }
      }
      if (self.rendered) {
        if (self.get(_display_all)) self.displayAll();
        if (self.site.get(_signer_id)) {
          if (self.get(_auto_run)) {
            var callback = (isFunction(self.site.get(_event_callback))) ? self.site.get(_event_callback) : noop;
            self.site.retrieve({ contracts: self.get(_contracts), _context: self, event_callback: function() { callback.apply(this, arguments); self.display.apply(self, arguments); } });
          }
          else self.site.retrieve({ contracts: self.get(_contracts), _context: self });
        }
        else {
          var contracts = self.get(_contracts);
          for (var i = 0; i < contracts.length; i++) {
            self.agreed.data.set(contracts[i], !1);
            self.checked.data.set(contracts[i], !1);
          }
        }
      }
    };
    
    ClickwrapGroup.prototype.injectHTML = function(el) {
      if (el) {
        var contracts = this.get(_contracts),
          objName = this.get(_object_name);
        el.innerHTML = this.get(_contract_html);
        var targets = getByClassName(el, 'ps-' + objName + '-target'),
          exp = getByClassName(el, 'ps-expand-button'),
          col = getByClassName(el, 'ps-collapse-button'),
          panes = getByClassName(el, 'ps-' + objName + '-body');
        for (var i = 0; i < targets.length; i++) {
          listenTo(targets[i], 'change', this.handleClick.bind(this), !1);
          if (panes && panes.length > 0) listenTo(targets[i], 'change', this.togglePane.bind(this), !1);
        }
        for (var b = 0; b < exp.length; b++) listenTo(exp[b], 'click', this.togglePane.bind(this), !1);
        for (var b = 0; b < col.length; b++) listenTo(col[b], 'click', this.togglePane.bind(this), !1);
        this.updateHiddenInput(!this.block());
      }
    };
    
    ClickwrapGroup.prototype.retrieveHTML = function(renderData) {
      if (!window.XMLHttpRequest) return !1;
      var self = this,
        xhr = new window.XMLHttpRequest,
        url = transportHost() + '/load/html?';
      if (renderData) self.set(_render_data, renderData);
      var overrides = self.getData();
      self.site.parameters.set(overrides, void 0, !0);
      buildAction(self.site.parameters);  
      url = url + self.site.get(_event_payload);
      self.site.parameters.data.overrides = {};
      xhr.open("GET", url, !0);
      xhr.withCredentials = !1;
      xhr.setRequestHeader("Content-Type", "text/html");
      xhr.onreadystatechange = function() {
        if (4 == xhr.readyState) {
          self.set(_contract_html, this.responseText);
          self.render(true);
          xhr = null;
        }
      };
      xhr.send();
      return !0;
    };
    
    ClickwrapGroup.prototype.handleRetrieve = function(err, data, xhr, context) {
      if (data && 'object' == typeof data) {
        var contracts = this.get(_contracts),
          versions = this.get(_versions),
            cid,
            i;
          
        for (var a in data) {
          if (data.hasOwnProperty(a)) {
            cid = parseInt(a);
            i = contracts.indexOf(cid);
            if (i >= 0) {
              if (!data[a] || (data[a] != versions[i] && data[a] != 'true')) {
                this.agreed.data.set(cid, !1);
              }
              else {
                this.agreed.data.set(cid, !0);
              }
            }
          }
        }
      }
      
      if (!this.site.get(_disable_sending)) this.sendChecked(!0) || this.updateHiddenInput(!this.block());
      else this.updateHiddenInput(!this.block());
    };
    
    ClickwrapGroup.prototype.display = function() {
      if (this.get(_display_all)) this.displayAll();
      else this.displayRequired();
    };
    
    ClickwrapGroup.prototype.displayRequired = function() {
      var el = this.get(_element);
      if (el) {
        var cel = this.getContractElements(),
          hidden = !1,
          cid = [],
          attr = this.get(_data_attr);
          
        for (var i = 0; i < cel.length; i++) {
          cid = (getAttribute(cel[i], 'data-' + attr) || '').split(',');
          if (cid.length) {
            for (var c = 0; c < cid.length; c++) {
              if (this.agreed.data.get(cid[c]) === !1) {
                hidden = (cel[i].style.display != 'block');
                cel[i].style.display = 'block';
                if (hidden) {
                  trigger('displayed', cel[i], this);
                  emit('displayed', this, cel[i]);
                }
                break;
              }
            }
          }
        }
        this.sendDisplayed();
      }
    };
    
    ClickwrapGroup.prototype.displayAll = function() {
      var el = this.get(_element);
      if (el) {
        var cel = this.getContractElements(),
          hidden = !1,
          attr = this.get(_data_attr);
        for (var i = 0; i < cel.length; i++) {
          if (cel[i].hasAttribute('data-' + attr)) {
            hidden = (cel[i].style.display != 'block');
            cel[i].style.display = 'block';
            if (hidden) {
              trigger('displayed', cel[i], this);
              emit('displayed', this, cel[i]);
            }
          }
        }
        this.sendDisplayed();
      }
    };
    
    ClickwrapGroup.prototype.hide = function(contracts) {
      if (!contracts) return;
      contracts = isArray(contracts) ? contracts : [contracts];
      var el = this.get(_element);
      if (el) {
        var cel = this.getContractElements(),
          hidden = !1,
          cid,
          arr = [],
          attr = this.get(_data_attr);
        for (var i = 0; i < cel.length; i++) {
          arr = (getAttribute(cel[i], 'data-' + attr) || '').split(',');
          for (var c = 0; c < arr.length; c++) {
            cid = parseInt(arr[c]);
            if (!isNaN(cid) && -1 < contracts.indexOf(cid)) {
              hidden = (cel[i].style.display == 'none');
              cel[i].style.display = 'none';
              if (!hidden) {
                trigger('hidden', cel[i], this);
                emit('hidden', this, cel[i]);
              }
              break;
            }
          }
        }
      }
    };
    
    ClickwrapGroup.prototype.hideAll = function() {
      var el = this.get(_element);
      if (el) {
        var cel = this.getContractElements(),
          hidden = !1,
          attr = this.get(_data_attr);
        for (var i = 0; i < cel.length; i++) {
          if (cel[i].hasAttribute('data-' + attr)) {
            hidden = (cel[i].style.display == 'none');
            cel[i].style.display = 'none';
            if (!hidden) {
              trigger('hidden', cel[i], this);
              emit('hidden', this, cel[i]);
            }
          }
        }
      }
    };
    
    ClickwrapGroup.prototype.handleClick = function(evt) {
      if (evt && evt.target) {
        var self = this,
          sig = self.site.get(_signer_id) || !0,
          cid = [],
          vid = [],
          rev = [],
          data = {},
          agreed = evt.target.checked,
          pairs = evt.target.value.split(',');
        for (var i = 0, v = null; i < pairs.length; i++) {
          v = pairs[i].split(':');
          if (agreed && self.sent[v[0]] !== sig) {
            cid.push(v[0]);
            vid.push(v[1]);
            if (v.length > 2) rev.push(v[2]);
          }
          self.checked.data.set(v[0], agreed);
        }
        emit((agreed ? 'checked' : 'unchecked'), self, evt.target);
        if (cid.length) {
          data[_contracts] = cid;
          data[_versions] = vid;
          if (rev.length) data[_revisions] = rev;
          if (self.get(_render_id)) data[_render_id] = self.get(_render_id);
          if (agreed) self.send('agreed', data);
          else if (self.get(_allow_disagreed)) self.send('disagreed', data);
        }
        else self.updateHiddenInput(!self.block());
      }
    };
    
    ClickwrapGroup.prototype.togglePane = function(evt) {
      if (evt && evt.target) {
        var self = this,
          objName = self.get(_object_name), conClass = self.get(_contract_class), parentEl = evt.target.parentElement, el = null, eb = null, cb = null;
        
        while (parentEl) {
          if (hasClass(parentEl, conClass)) {
            el = getByClassName(parentEl, 'ps-' + objName + '-body');
            el = (el && el.length > 0) ? el[0] : null;
            eb = getByClassName(parentEl, 'ps-expand-button');
            eb = (eb && eb.length > 0) ? eb[0] : null;
            cb = getByClassName(parentEl, 'ps-collapse-button');
            cb = (cb && cb.length > 0) ? cb[0] : null;
            
            if (hasClass(evt.target, 'ps-collapse-button') || (hasClass(evt.target, 'ps-' + objName + '-target') && evt.target.checked)) {
              if (el) el.style.display = 'none';
              if (cb) cb.style.display = 'none';
              if (eb) eb.style.display = 'inline-block';
              removeClass(parentEl, 'ps-expanded');
            }
            else if (hasClass(evt.target, 'ps-expand-button') || (hasClass(evt.target, 'ps-' + objName + '-target') && !evt.target.checked)) {
              if (el) el.style.display = 'block';
              if (eb) eb.style.display = 'none';
              if (cb) cb.style.display = 'inline-block';
              addClass(parentEl, 'ps-expanded');
            }
            break;
          }
          parentEl = parentEl.parentElement;
        }
      }
    };
    
    ClickwrapGroup.prototype.handleInput = function(evt) {
      if (evt && evt.target) this.site.set(_signer_id, evt.target.value);
    };
    
    ClickwrapGroup.prototype.block = function() {
      var block = !1,
        validate_checked = this.get(_display_all),
        contracts = this.get(_contracts);
      if (contracts) {
        for (var i = 0; i < contracts.length; i++) {
          if (!this.agreed.data.get(contracts[i]) || (validate_checked && !this.checked.data.get(contracts[i]))) {
            block = !0;
            break;
          }
        }
      }
      return block;
    };
    
    ClickwrapGroup.prototype.allChecked = function() {
      var all = !0,
        contracts = this.get(_contracts);
      if (contracts) {
        for (var i = 0; i < contracts.length; i++) {
          if (!this.checked.data.get(contracts[i])) {
            all = !1;
            break;
          }
        }
      }
      return all;
    };
    
    /**
     * Browsewrap Group class.
     */
    var BrowsewrapGroup = function(options) {
      var self = this;
            
      function setParameter(key, value) {
        self.parameters.data.set(key, value);
      }

      self.parameters = new ParameterStore(self);
      
      self.rendered = !1;
      self.badgeInjected = !1;
      self.eventsAttached = !1;
      
      setParameter(_key, options[_key]);
      setParameter(_type, options[_type]);
      setParameter(_group, options[_group] || options[_agreement_group]);
      setParameter(_contracts, options[_contracts] || options[_agreements] || []);
      setParameter(_versions, options[_versions] || []);
      setParameter(_target_selector, (options[_selector] || options[_target_selector]));
      setParameter(_element, (options[_selector] || options[_target_selector]));
      setParameter(_style, options[_style]);
      setParameter(_position, options[_position] || 'auto');
      setParameter(_class_name, options[_class_name] || 'ps-browsewrap-badge');
      setParameter(_stylesheet, options[_stylesheet]);
      setParameter(_legal_center_url, options[_legal_center_url]);
      setParameter(_open_legal_center, options[_open_legal_center]);
      setParameter(_always_visible, options[_always_visible]);
      setParameter(_badge_text, options[_badge_text]);
      setParameter(_badge_updater, noop);
      setParameter(_update_interval, options[_update_interval] || 200);
      
      setParameter(_dynamic, options[_dynamic]);
      setParameter(_render_id, options[_render_id]);
      setParameter(_render_data, options[_render_data]);
      
      _PactSafe('onReady', function() { self.listenForElement(self.get(_target_selector), self.render.bind(self)) });
      
      _listenTo('set:' + _always_visible, function() {
        if (self.get(_always_visible) === !0) self.removeEvents();
        else if (self.get(_always_visible) === !1) self.setupEvents();
      });
      
      _listenTo('set:' + _position, function() {
        if (self.badgeInjected === !0) self.updatePosition();
      });
    };
    
    var styleProcessor1 = function(el) {
      var val = window.getComputedStyle(el).overflowY;
      return (val == 'auto' || val == 'scroll');
    },
    styleProcessor2 = function(el) {
      var val = el.currentStyle.overflowY;
      return (val == 'auto' || val == 'scroll');
    },
    styleProcessor3 = function(el) {
      return (el.style.overflow == 'scroll'
        || el.style.overflowY == 'scroll'
        || el.style.overflow == 'auto'
        || el.style.overflowY == 'auto'
        || el.clientHeight < el.scrollHeight);
    },
    inViewport = function(el) {
      var r, html;
      if (!el || 1 !== el.nodeType) return !1;
      html = document.documentElement;
      r = el.getBoundingClientRect();
      return (!!r 
        && r.bottom >= 0 
        && r.right >= 0 
        && r.top <= (window.innerHeight || html.clientHeight)
        && r.left <= (window.innerWidth || html.clientWidth)
      );
    };
    
    BrowsewrapGroup.prototype.get = function(name) {
      return this.parameters.get(name);
    };
    
    BrowsewrapGroup.prototype.set = function(name, value) {
      this.parameters.set(name, value);
    };
    
    BrowsewrapGroup.prototype.send = function(a) {
      var self = this;
      if (!(1 > arguments.length)) {
        var eventType, overrides, cb;
        if ("string" === typeof arguments[0]) {
          eventType = arguments[0];
          overrides = [].slice.call(arguments, 1);
        }
        else {
          eventType = arguments[0] && arguments[0][_event_type];
          overrides = arguments;
        }
        if (eventType) {
          overrides = toObject(sendCommandOptions[eventType] || [], overrides);
          overrides[_contracts] = overrides[_contracts] || self.get(_contracts);
          overrides[_versions] = overrides[_versions] || self.get(_versions);
          overrides[_group] = self.get(_group);
          overrides[_event_type] = eventType;
          overrides[_render_id] = self.get(_render_id);
          overrides[_context] = self;
          self.site.send(eventType, overrides);
        }
      }
    };
    
    BrowsewrapGroup.prototype.openLegalCenter = function(e) {
      var self = this;
      self.send('visited');
      if (e && e.target && e.target.hasAttribute('data-url')) return window.open(getAttribute(e.target, 'data-url'), '_blank');
    };
    
    BrowsewrapGroup.prototype.render = function(force) {
      var el = this.get(_element);
      if (!this.rendered || force) {
        if (el) {
          this.wrapElement();
          this.rendered = true;
          trigger('rendered', this);
          emit('rendered', this, el);
          if (!this.get(_always_visible)) this.setupEvents();
          else {
            var handler = this.updateBadge(this.get(_badge_element));
            this.set(_badge_updater, handler);
            handler && isFunction(handler) && handler.call(window, null, !0);
          }
        }
      }
    };
    
    BrowsewrapGroup.prototype.listenForElement = function(sel, cb) {
      var self = this,
        _found = false,
        _handler = null;
      _handler = function(e, observer) {
        var el = getElement(sel),
          badgeEl = self.get(_badge_element);
        if (badgeEl != null && el != null && el.parentNode != badgeEl.parentNode && !self.reRendering) {
          self.reRendering = !0;
          self.removeEvents();
          self.render(true);
          self.reRendering = !1;
          return;
        }
        if (_found) return;
        if (el) {
          _found = true;
          cb && isFunction(cb) && cb.call(this);
        }
      };
      var observer = null;
      if (window.MutationObserver && isFunction(window.MutationObserver)) {
        observer = new MutationObserver(_handler);
        observer.observe(document, { attributes: true, childList: true, subtree: true });
      }
      else listenTo(document, "DOMNodeInserted", _handler, !1);
      _handler(null, observer);
    };
    
    BrowsewrapGroup.prototype.listenForScrollElement = function(handler) {      
      var self = this,
        _found = false,
        _parentHandler = null;
      _parentHandler = _debounce(function(e, observer) {
        if (_found) {
          if (observer && isFunction(observer.disconnect)) observer.disconnect();
          return;
        }
        var parentEl = self.findScrollParent();
        if (parentEl) {
          _found = true;
          if (observer && isFunction(observer.disconnect)) observer.disconnect();
          else stopListening(window, 'DOMContentLoaded', _parentHandler);
          stopListening(window, 'resize', _parentHandler);
          listenTo(parentEl, 'scroll', handler, !1);
          self.set(_scroll_element, parentEl);
        }
      }, 300);
      
      var observer = null;
      if (window.MutationObserver && isFunction(window.MutationObserver)) {
        observer = new MutationObserver(_parentHandler);
        observer.observe(document, { attributes: true, childList: true, subtree: true });
      }
      else listenTo(document, "DOMContentLoaded", _parentHandler);
      _parentHandler(null, observer);
    };
        
    BrowsewrapGroup.prototype.findScrollParent = function() {
      var parentEl = this.get(_element).parentElement,
        isScrollable = null;
        
      if (window.getComputedStyle && isFunction(window.getComputedStyle)) isScrollable = styleProcessor1;
      else if (typeof parentEl.currentStyle != 'undefined') isScrollable = styleProcessor2;
      else isScrollable = styleProcessor3;
      
      while (parentEl) {
        if (isScrollable(parentEl)) break;
        parentEl = parentEl.parentElement;
      }
      return parentEl;
    };
    
    BrowsewrapGroup.prototype.wrapElement = function() {
      var el = this.get(_element);
      if (!el) return !1;
      var badgeEl = document.createElement(el.tagName.toLowerCase());
      badgeEl.className = this.get(_class_name);
      badgeEl.innerHTML = (this.get(_badge_text) || el.innerHTML);
      setAttribute(badgeEl, [ 'data-key', 'data-gid', 'data-cid', 'data-vid' ], [ this.get(_key), this.get(_group), this.get(_contracts).join(','), this.get(_versions).join(',') ]);
      
      if (this.get(_open_legal_center)) {
        if (el.tagName == 'A') {
          if (el.hasAttribute('href')) setAttribute(el, 'data-href', getAttribute(el, 'href'));
          setAttribute(el, 'href', this.get(_legal_center_url));
          if (el.hasAttribute('title')) setAttribute(badgeEl, 'title', getAttribute(el, 'title'));
          setAttribute(badgeEl, [ 'data-href', 'href', 'target' ], [ getAttribute(el, 'data-href'), this.get(_legal_center_url), '_blank' ]);
        }
        else {
          setAttribute(el, 'data-url', this.get(_legal_center_url));
          setAttribute(badgeEl, 'data-url', this.get(_legal_center_url));
        }
        listenTo(el, 'click', this.openLegalCenter.bind(this), !1);
        listenTo(badgeEl, 'click', this.openLegalCenter.bind(this), !1);
      }
      
      var wrapper = document.createElement('div');
      setAttribute(wrapper, 'id', 'ps-badge-' + this.get(_key));
      wrapper.className = 'ps-browsewrap-wrapper';
      wrapper.innerHTML = this.get(_stylesheet);
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      wrapper.appendChild(badgeEl);
      this.badgeInjected = true;
      this.set(_badge_element, badgeEl);
      this.updatePosition();
      return badgeEl;
    };
    
    BrowsewrapGroup.prototype.setupEvents = function() {
      if (this.eventsAttached) return;
      var badgeEl = this.get(_badge_element),
        parentEl = this.findScrollParent(),
        handler = this.updateBadge(badgeEl);
      this.set(_badge_updater, handler);
      listenTo(window, 'DOMContentLoaded', handler, !1);
      listenTo(window, 'load', handler, !1);
      listenTo(window, 'scroll', handler, !1);
      listenTo(window, 'resize', handler, !1);
      if (!parentEl) this.listenForScrollElement(handler);
      else {
        this.set(_scroll_element, parentEl);
        listenTo(parentEl, 'scroll', handler, !1);
      }
      var observer = null;
      if (window.MutationObserver && isFunction(window.MutationObserver)) {
        observer = new MutationObserver(handler);
        observer.observe(document, { attributes: true, childList: true, subtree: true });
        this.set(_mutation_observer, observer);
      }
      else listenTo(document, "DOMNodeInserted", handler);
      this.eventsAttached = !0;
    };
    
    BrowsewrapGroup.prototype.removeEvents = function() {
      if (!this.eventsAttached) return;
      var handler = this.get(_badge_updater),
        parentEl = this.get(_scroll_element),
        observer = this.get(_mutation_observer);
      stopListening(window, 'DOMContentLoaded', handler, !1);
      stopListening(window, 'load', handler, !1);
      stopListening(window, 'scroll', handler, !1);
      stopListening(window, 'resize', handler, !1);
      if (parentEl) stopListening(parentEl, 'scroll', handler, !1);
      if (observer && isFunction(observer.disconnect)) observer.disconnect();
      handler && isFunction(handler) && handler.call(window, null, !0);
      this.eventsAttached = !1;
    };
    
    BrowsewrapGroup.prototype.updatePosition = function() {
      var el = this.get(_element),
        badgeEl = this.get(_badge_element);
      if (!el || !badgeEl) return !1;
      if (badgeEl.style.marginLeft) badgeEl.style.removeProperty('margin-left');
      switch (this.get(_position)) {
        case 'left':
          badgeEl.style.left = '20px';
          badgeEl.style.right = 'auto';
          break;
        case 'right':
          badgeEl.style.left = 'auto';
          badgeEl.style.right = '20px';
          break;
        case 'center':
          badgeEl.style.left = '50%';
          badgeEl.style.right = 'auto';
          badgeEl.style.display = 'inline-block';
          if (badgeEl.offsetWidth > 0) badgeEl.style.marginLeft = '-' + Math.floor((badgeEl.offsetWidth / 2)) + 'px';
          badgeEl.style.removeProperty('display');
          break;
        default:
          badgeEl.style.left = el.getBoundingClientRect().left + 'px';
          badgeEl.style.right = 'auto';
          break;
      };
      setAttribute(badgeEl, 'data-position', this.get(_position));
    };
    
    BrowsewrapGroup.prototype.updateBadge = function(el) {
      var self = this, _lastVisible = null, _handler = null;
      _handler = _throttle(function(e, force) {
        if (e && e.type == 'resize' && getAttribute(el, 'data-position') == 'auto') self.updatePosition();
        if (force === !0) {
          _lastVisible = null;
          addClass(el, 'ps-browsewrap-stuck');
          return;
        }
        var visible = inViewport(el.parentElement);
        if (visible === _lastVisible) {
          _lastVisible = visible;
          return;
        }
        _lastVisible = visible;
        if (visible) removeClass(el, 'ps-browsewrap-stuck');
        else addClass(el, 'ps-browsewrap-stuck');
      }, self.get(_update_interval));
      _handler();
      return _handler;
    };
    
    BrowsewrapGroup.prototype.forceUpdate = function() {
      var fn = this.get(_badge_updater);
      fn && isFunction(fn) && fn.apply(window, arguments);
    };
    
    /**
     * Define Group Types.
     */  
    var _group = defineGroup('group', ClickwrapGroup),
      _badge = defineGroup('badge', BrowsewrapGroup);
    
    /**
     * Command Execution class.
     */
    var commandExecution = function(a) {
      if (isFunction(a[0])) this.method = a[0];
      else {
        var commandParts = commandStringFormat.exec(a[0]);
        if (null != commandParts && 4 == commandParts.length) {
          this.siteName = commandParts[1] || "s0";
          this.groupName = commandParts[2] || "";
          this.methodName = commandParts[3];
          this.args = [].slice.call(a, 1);
          if (!this.groupName || null == this.groupName) {
            this.isCreate = "create" == this.methodName;
            this.isRemove = "remove" == this.methodName;
            this.isLoad = "load" == this.methodName;
            this.isInitialize = "initialize" == this.methodName;     
          }
          this.isGlobal = "onReady" == this.methodName;
        }
        if (!this.methodName) throw "command_missing_method";     
        else if (this.isLoad || this.isInitialize) {
          if (1 > this.args.length || isBlank(this.args[0])) throw "command_missing_key";
        }
        if (containsPeriodOrColon(this.siteName) || containsPeriodOrColon(this.groupName)) throw "command_invalid_format";
      }
    };
      
    var commandStringFormat = /^(?:([\w\-\_]+)\.)?(?:([\w\-\_]+):)?(\w+)$/,
      containsPeriodOrColon = function(a) {
        return 0 <= a.indexOf(".") || 0 <= a.indexOf(":");
      };
    
    /**
     * Command Runner class.
     */
    var Runner = {
      ps: function() {
        Runner.commands = [];
        Runner.onReady = [];
        Runner.listeners = { all: [] };
        Runner.listenersOnce = {};
        Runner.listenersInternal = { all: [] };
        Runner.listenersOnceInternal = {};
      }
    };
    
    Runner.ps();
    
    // Add queued listeners
    Runner.addListeners = function(a) {
      for (var l = [], c = 0; c < arguments.length; c++) _PactSafe.on.apply(this, arguments[c]);
    };
    
    Runner.addListenersOnce = function(a) {
      for (var l = [], c = 0; c < arguments.length; c++) _PactSafe.once.apply(this, arguments[c]);
    };
    
    Runner.removeListeners = function(a) {
      for (var l = [], c = 0; c < arguments.length; c++) _PactSafe.off.apply(this, arguments[c]);
    };
    
    // Execute commands in async queue
    Runner.executeCommands = function(a) {
      var b = Runner.buildArray.apply(Runner, arguments),
         b = Runner.commands.concat(b);
      for (Runner.commands = []; 0 < b.length && !Runner.run(b[0]) && !(b.shift(), 0 < Runner.commands.length););
      Runner.commands = Runner.commands.concat(b);
    };
    
    // Build command array
    Runner.buildArray = function(a) {
      for (var b = [], c = 0; c < arguments.length; c++) try {
        var d = new commandExecution(arguments[c]);
        b.push(d);
      }
      catch (err) {}
      return b;
    };
    
    Runner.run = function(command) {
      try {        
        if (command.method) command.method.call(window, _PactSafe.getByName("s0"));
        else {
          var site = command.siteName == _globalName ? _PactSafe : _PactSafe.getByName(command.siteName);
          if (command.isCreate) "s0" == command.siteName && _PactSafe.create.apply(_PactSafe, command.args);
          else if (command.isRemove) _PactSafe.remove(command.siteName);
          else if (command.isGlobal) _PactSafe[command.methodName].apply(_PactSafe, command.args);
          else if (site) {
            if (!isBlank(command.groupName)) {
              var group = site.groups.get(command.groupName);
              group && group[command.methodName].apply(group, command.args);
            }
            else if (command.isInitialize) {
              if (site.groups.getLoading(command.args[0]) !== !1) site[command.methodName].apply(site, command.args);
              else {
                var allSites = _PactSafe.getAll();
                for (var i = 0, l = allSites.length; i < l; i++) {
                  if (allSites[i].groups.getLoading(command.args[0]) !== !1) {
                    allSites[i][command.methodName].apply(allSites[i], command.args);
                    break;
                  }
                }
              }
            }
            else site[command.methodName].apply(site, command.args);
          }
        }
      }
      catch (err) {}
    };
    
    /**
     * Master _PactSafe class.
     * This is the class that is interfaced with.
     */
    var _PactSafe = function(a) {
      Runner.executeCommands.apply(Runner, [arguments])
    };
    _PactSafe.Sites = {};
    _PactSafe.initiatedTime = 0;
    _PactSafe.realThang = 317;
    _PactSafe.readyFired = false;
    _PactSafe.readyHandlersAttached = false;
    if (window.location.hostname == 'app.pactsafe.dev') _PactSafe.envAPI = 'response.pactsafe.dev:3002';
    else if (window.location.hostname == 'localhost') _PactSafe.envAPI = 'localhost:3002';
    else _PactSafe.envAPI = 'dev.pactsafe.io';
    _PactSafe.envVault = 'dev-vault.pactsafe.io';
    
    var createOptions = [_site_id, _name];
    
    _PactSafe.create = function(a) {
      var options = toObject(createOptions, [].slice.call(arguments));
      options.name || (options.name = "s0");
      var name = "" + options.name;
      if (_PactSafe.Sites[name]) return _PactSafe.Sites[name];
      var site = new Site(options);
      _PactSafe.Sites[name] = site;
      trigger('create', site);
      return site;
    };
    
    _PactSafe.remove = function(name) {
      if (_PactSafe.Sites[name]) _PactSafe.Sites[name] = null;
    };
    
    _PactSafe.getByName = function(name) {
      return _PactSafe.Sites[name];
    };
    
    _PactSafe.getAll = function() {
      var sites = [];
      for (var name in _PactSafe.Sites) _PactSafe.Sites.hasOwnProperty(name) && sites.push(_PactSafe.Sites[name]);
      return sites;
    };
    
    _PactSafe.getByKey = function(key) {
      var sites = _PactSafe.getAll(),
        group = null;
      for (var i = 0, l = sites.length; i < l; i++) {
        group = sites[i].groups.get(key);
        if (group) break;
      }
      return group;
    };
    
    _PactSafe.getAllGroups = function() {
      var sites = _PactSafe.getAll(),
        groups = [];
      for (var i = 0, l = sites.length; i < l; i++) sites[i].groups.initialized.map(function(k, g) { groups.push(g); });
      return groups;
    };
    
    _PactSafe.onReady = function(callback, context) {
      if (!isFunction(callback)) return;
      if (_PactSafe.readyFired) setTimeout(function() { callback(); }, 1);
      else Runner.onReady.push(callback);
    };
    
    _PactSafe.on = function(eventName, callback) {
      if (!isFunction(callback)) return;
      if (!Runner.listeners[eventName]) Runner.listeners[eventName] = [];
      Runner.listeners[eventName].push(callback);
    };
    
    var _listenTo = function(eventName, callback) {
      if (!isFunction(callback)) return;
      if (!Runner.listenersInternal[eventName]) Runner.listenersInternal[eventName] = [];
      Runner.listenersInternal[eventName].push(callback);
    };
    
    _PactSafe.once = function(eventName, callback) {
      if (!isFunction(callback)) return;
      if (!Runner.listenersOnce[eventName]) Runner.listenersOnce[eventName] = [];
      Runner.listenersOnce[eventName].push(callback);
    };
    
    var _listenToOnce = function(eventName, callback) {
      if (!isFunction(callback)) return;
      if (!Runner.listenersOnceInternal[eventName]) Runner.listenersOnceInternal[eventName] = [];
      Runner.listenersOnceInternal[eventName].push(callback);
    };
    
    _PactSafe.off = function(eventName, callback) {
      if (!eventName) {
        Runner.listeners = { all: [] };
        Runner.listenersOnce = {};
      }
      else if (!isFunction(callback)) {
        if (Runner.listeners[eventName]) Runner.listeners[eventName] = [];
        if (Runner.listenersOnce[eventName]) Runner.listenersOnce[eventName] = [];
      }
      else {
        var i, callback = callback.toString();
        if (Runner.listeners[eventName]) {
          for (var c = 0; c < Runner.listeners[eventName].length; c++) {
            if (Runner.listeners[eventName][c].toString() === callback) {
              i = c;
              break;
            }
          }
          if (i > -1) Runner.listeners[eventName].splice(i, 1);
        }
        if (Runner.listenersOnce[eventName]) {
          for (var c = 0; c < Runner.listenersOnce[eventName].length; c++) {
            if (Runner.listenersOnce[eventName][c].toString() === callback) {
              i = c;
              break;
            }
          }
          if (i > -1) Runner.listenersOnce[eventName].splice(i, 1);
        }
      }
    };
    
    var _stopListening = function(eventName, callback) {
      if (!eventName) {
        Runner.listenersInternal = { all: [] };
        Runner.listenersOnceInternal = {};
      }
      else if (!isFunction(callback)) {
        if (Runner.listenersInternal[eventName]) Runner.listenersInternal[eventName] = [];
        if (Runner.listenersOnceInternal[eventName]) Runner.listenersOnceInternal[eventName] = [];
      }
      else {
        var i, callback = callback.toString();
        if (Runner.listenersInternal[eventName]) {
          for (var c = 0; c < Runner.listenersInternal[eventName].length; c++) {
            if (Runner.listenersInternal[eventName][c].toString() === callback) {
              i = c;
              break;
            }
          }
          if (i > -1) Runner.listenersInternal[eventName].splice(i, 1);
        }
        if (Runner.listenersOnceInternal[eventName]) {
          for (var c = 0; c < Runner.listenersOnceInternal[eventName].length; c++) {
            if (Runner.listenersOnceInternal[eventName][c].toString() === callback) {
              i = c;
              break;
            }
          }
          if (i > -1) Runner.listenersOnceInternal[eventName].splice(i, 1);
        }
      }
    };

    var trigger = function(eventName) {
      var args = [].slice.call(arguments, 1);
      if (Runner.listeners[eventName]) for (var i = 0; i < Runner.listeners[eventName].length; i++) Runner.listeners[eventName][i].apply(_PactSafe, args);
      if (Runner.listenersOnce[eventName]) {
        for (var i = 0; i < Runner.listenersOnce[eventName].length; i++) Runner.listenersOnce[eventName][i].apply(_PactSafe, args);
        Runner.listenersOnce[eventName] = [];
      }
      for (var i = 0; i < Runner.listeners.all.length; i++) Runner.listeners.all[i].apply(_PactSafe, arguments);
      triggerInternal.apply(this, arguments);
    };
    
    var triggerInternal = function(eventName) {
      var args = [].slice.call(arguments, 1);
      if (Runner.listenersInternal[eventName]) for (var i = 0; i < Runner.listenersInternal[eventName].length; i++) Runner.listenersInternal[eventName][i].apply(_PactSafe, args);
      if (Runner.listenersOnceInternal[eventName]) {
        for (var i = 0; i < Runner.listenersOnceInternal[eventName].length; i++) Runner.listenersOnceInternal[eventName][i].apply(_PactSafe, args);
        Runner.listenersOnceInternal[eventName] = [];
      }
      for (var i = 0; i < Runner.listenersInternal.all.length; i++) Runner.listenersInternal.all[i].apply(_PactSafe, arguments);
    };
    
    // setup main object and run any queued commands 
    _PactSafe.setup = function() {
      var a = window[_globalName];
      if (!a || 317 != a.realThang) {
        _PactSafe.initiatedTime = a && a.t;
        _PactSafe.loaded = !0;
        
        var b = window[_globalName] = _PactSafe;
        defineMethod("create", b, b.create);
        defineMethod("remove", b, b.remove);
        defineMethod("getByName", b, b.getByName);
        defineMethod("getAll", b, b.getAll);
        defineMethod("getByKey", b, b.getByKey);
        defineMethod("getAllGroups", b, b.getAllGroups);
        defineMethod("onReady", b, b.onReady);
        defineMethod("on", b, b.on);
        defineMethod("once", b, b.once);
        defineMethod("off", b, b.off);
        
        b = Site.prototype;
        defineMethod("get", b, b.get);
        defineMethod("set", b, b.set);
        defineMethod("send", b, b.send);
        defineMethod("retrieve", b, b.retrieve);
        defineMethod("initialize", b, b.initialize);
        defineMethod("load", b, b.load);
        defineMethod("render", b, b.render);
        defineMethod("getByKey", b, b.getByKey);
        defineMethod("getAllGroups", b, b.getAllGroups);
        
        b = ClickwrapGroup.prototype;
        defineMethod("get", b, b.get);
        defineMethod("set", b, b.set);
        defineMethod("send", b, b.send);
        defineMethod("render", b, b.render);
        defineMethod("display", b, b.display);
        defineMethod("displayRequired", b, b.displayRequired);
        defineMethod("displayAll", b, b.displayAll);
        defineMethod("hide", b, b.hide);
        defineMethod("hideAll", b, b.hideAll);
        defineMethod("getAgreed", b, b.getAgreed);
        defineMethod("getChecked", b, b.getChecked);
        defineMethod("sendChecked", b, b.sendChecked);
        
        b = BrowsewrapGroup.prototype;
        defineMethod("get", b, b.get);
        defineMethod("set", b, b.set);
        defineMethod("send", b, b.send);
        defineMethod("render", b, b.render);
        defineMethod("openLegalCenter", b, b.openLegalCenter);
        defineMethod("findScrollParent", b, b.findScrollParent);
        defineMethod("wrapElement", b, b.wrapElement);
        defineMethod("setupEvents", b, b.setupEvents);
        defineMethod("removeEvents", b, b.removeEvents);
        defineMethod("forceUpdate", b, b.forceUpdate);
        
        b = ParameterStore.prototype;
        defineMethod("get", b, b.get);
        defineMethod("set", b, b.set);

        if (!isHTTPS() && !_forceSSL) {
          var found;
          block: {
            for (var scripts = document.getElementsByTagName("script"), i = 0; i < scripts.length && 100 > i; i++) {
              var src = scripts[i].src;
              if (src && 0 == src.indexOf("https://" + _PactSafe.envVault + "/ps.min.js")) {
                found = !0;
                break block;
              }
            }
            found = !1;
          }
          found && (_forceSSL = !0);
        }
        
        if (a) {
          if (isArray(a.e)) Runner.addListeners.apply(_PactSafe, a.e);
          if (isArray(a.eo)) Runner.addListenersOnce.apply(_PactSafe, a.eo);
          if (isArray(a.o)) Runner.removeListeners.apply(_PactSafe, a.o);
          trigger('ready');
          if (isArray(a.q)) Runner.executeCommands.apply(_PactSafe, a.q);
        }
      }
    };
    
    function ready() {      
      if (!_PactSafe.readyFired) {
        _PactSafe.readyFired = true;
        for (var i = 0; i < Runner.onReady.length; i++) {
          if (isFunction(Runner.onReady[i])) Runner.onReady[i]();
        }
        Runner.onReady = [];
      }
    }
    
    function readyStateChange() {
      if (document.readyState === "complete") ready();
    }
    
    function attachReadyHandlers() {
      if (document.readyState === "complete") setTimeout(ready, 1);
      else if (!_PactSafe.readyHandlersAttached) {
        if (document.addEventListener) {
          document.addEventListener("DOMContentLoaded", ready, !1);
          window.addEventListener("load", ready, !1);
        }
        else {
          document.attachEvent("onreadystatechange", readyStateChange);
          window.attachEvent("onload", ready);
        }
        _PactSafe.readyHandlersAttached = !0;
      }
    }
    
    attachReadyHandlers();
    
    var executeIfLoaded = function(fn) {
      if ("prerender" == document.visibilityState) return !1;
      fn();
      return !0;
    };    
    
    // Try to run setup() or run once document is done loading
    (function() {
      var a = _PactSafe.setup;
      if (!executeIfLoaded(a)) {
        var executed = !1,
          runSetup = function() {
            if (!executed && executeIfLoaded(a)) {
              executed = !0;
              stopListening(document, "visibilitychange", runSetup);
            }
          };
        listenTo(document, "visibilitychange", runSetup);
      }
    })();
    
})(window);