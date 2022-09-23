var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var eventemitter3 = createCommonjsModule(function (module) {

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
{
  module.exports = EventEmitter;
}
});

/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/

var loglevel = createCommonjsModule(function (module) {
(function (root, definition) {
    if (module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(commonjsGlobal, function () {

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (
        /Trident\/|MSIE /.test(window.navigator.userAgent)
    );

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                // In old IE, native console methods themselves don't have apply().
                Function.prototype.apply.apply(console.log, [console, arguments]);
            }
        }
        if (console.trace) console.trace();
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      defaultLevel = defaultLevel == null ? "WARN" : defaultLevel;

      var storageKey = "loglevel";
      if (typeof name === "string") {
        storageKey += ":" + name;
      } else if (typeof name === "symbol") {
        storageKey = undefined;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType || !storageKey) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage.removeItem(storageKey);
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {}
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          defaultLevel = level;
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.resetLevel = function () {
          self.setLevel(defaultLevel, false);
          clearPersistedLevel();
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if ((typeof name !== "symbol" && typeof name !== "string") || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;

    return defaultLogger;
}));
});

var name = "voice-control-game";
var version = "0.0.1";
var description = "";
var main = "lib/index.esm.js";
var module = "lib/index.esm.js";
var typings = "lib/types/index.d.ts";
var files = [
	"lib",
	"src"
];
var scripts = {
	start: "npm run dev && cp ./lib/index.esm.js ./public && http-server ./public",
	watch: "rollup -c -w --environment DEV",
	dev: "rm -rf ./lib && rollup -c --environment DEV",
	build: "rm -rf ./lib && rollup -c --environment PROD"
};
var author = "";
var license = "ISC";
var devDependencies = {
	"@rollup/plugin-commonjs": "^17.1.0",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^11.2.0",
	"@types/dom-speech-recognition": "0.0.1",
	"@types/node": "^12.12.7",
	"@typescript-eslint/eslint-plugin": "^2.6.1",
	"@typescript-eslint/parser": "^2.6.1",
	eslint: "^6.6.0",
	"eslint-config-prettier": "^6.5.0",
	"eslint-formatter-friendly": "^7.0.0",
	"eslint-plugin-prettier": "^3.1.1",
	"http-server": "^14.1.1",
	prettier: "^2.0.0",
	rollup: "^2.39.0",
	"rollup-plugin-terser": "^7.0.2",
	"rollup-plugin-typescript2": "^0.30.0",
	tslib: "^2.3.1",
	typescript: "^4.1.5"
};
var dependencies = {
	eventemitter3: "^4.0.7",
	loglevel: "^1.7.1"
};
var packageJson = {
	name: name,
	version: version,
	description: description,
	main: main,
	module: module,
	typings: typings,
	files: files,
	scripts: scripts,
	author: author,
	license: license,
	devDependencies: devDependencies,
	dependencies: dependencies
};

const logDebug = ({ level, appName = '', version = '', storeWindow = false, } = {
    appName: '',
    version: '',
    storeWindow: false,
}) => {
    const genTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
        const min = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
        const s = now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds();
        const nowString = `${year}-${month}-${day} ${hour}:${min}:${s}`;
        return nowString;
    };
    const genUserAgent = () => {
        try {
            const ua = navigator.userAgent.toLocaleLowerCase();
            const re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/;
            const m = ua.match(re) || [];
            const browser = m[1].replace(/version/, 'safari');
            const ver = m[2];
            return {
                browser,
                ver,
            };
        }
        catch (error) {
            return null;
        }
    };
    const proxyLog = () => {
        const _log = new Proxy(loglevel, {
            get(target, prop) {
                if (!(prop in target)) {
                    return;
                }
                const func = target[prop];
                if (!['log', 'info', 'warn', 'error', 'trace', 'debug'].includes(prop)) {
                    return func;
                }
                const uaInfo = genUserAgent();
                let prefix = '';
                if (uaInfo) {
                    prefix = `[ ${appName} ${version} ${uaInfo.browser}:${uaInfo.ver} ${genTime()} ]`;
                }
                else {
                    prefix = `[ ${appName} ${version} ${genTime()} ]`;
                }
                return func.bind(null, prefix);
            },
        });
        return _log;
    };
    const logger = proxyLog();
    if (level) {
        logger.setLevel(level);
    }
    if (storeWindow) {
        // @ts-ignore
        window.__LOGGER__ = logger;
    }
    return logger;
};
const logger = logDebug({
    level: 'debug',
    appName: packageJson.name,
    version: packageJson.version,
});

const TAG_NAME$1 = 'SpeechController';
class SpeechController extends eventemitter3 {
    root;
    recognition;
    constructor(root) {
        super();
        this.root = root;
        this.recognition = new (window.SpeechRecognition ||
            window.webkitSpeechRecognition)();
        this.recognition.lang = this.root.opt.lang;
        this.recognition.continuous = true;
        this.recognition.onstart = this.onstart;
        this.recognition.onend = this.onend;
        this.recognition.onaudiostart = this.onaudiostart;
        this.recognition.onaudioend = this.onaudioend;
        this.recognition.onsoundstart = this.onsoundstart;
        this.recognition.onsoundend = this.onsoundend;
        this.recognition.onspeechstart = this.onspeechstart;
        this.recognition.onspeechend = this.onspeechend;
        this.recognition.onresult = this.onresult;
        this.recognition.onnomatch = this.onnomatch;
        this.recognition.onerror = this.onerror;
    }
    start() {
        logger.log(TAG_NAME$1, 'start');
        this.recognition.start();
    }
    stop() {
        logger.log(TAG_NAME$1, 'stop');
        this.recognition.stop();
    }
    abort() {
        logger.log(TAG_NAME$1, 'abort');
        this.recognition.abort();
    }
    destroy() {
        logger.log(TAG_NAME$1, 'destroy');
        this.recognition.onstart = null;
        this.recognition.onend = null;
        this.recognition.onaudiostart = null;
        this.recognition.onaudioend = null;
        this.recognition.onsoundstart = null;
        this.recognition.onsoundend = null;
        this.recognition.onspeechstart = null;
        this.recognition.onspeechend = null;
        this.recognition.onresult = null;
        this.recognition.onnomatch = null;
        this.recognition.onerror = null;
    }
    onstart = (event) => {
        logger.log(TAG_NAME$1, 'onstart', event);
    };
    onend = (event) => {
        logger.log(TAG_NAME$1, 'onend', event);
    };
    onaudiostart = (event) => {
        logger.log(TAG_NAME$1, 'onaudiostart', event);
    };
    onaudioend = (event) => {
        logger.log(TAG_NAME$1, 'onaudioend', event);
    };
    onsoundstart = (event) => {
        logger.log(TAG_NAME$1, 'onsoundstart', event);
    };
    onsoundend = (event) => {
        logger.log(TAG_NAME$1, 'onsoundend', event);
    };
    onspeechstart = (event) => {
        logger.log(TAG_NAME$1, 'onspeechstart', event);
    };
    onspeechend = (event) => {
        logger.log(TAG_NAME$1, 'onspeechend', event);
    };
    onresult = (event) => {
        logger.log(TAG_NAME$1, 'onresult', event);
        const len = event.results.length;
        const res = event.results[len - 1][0].transcript;
        this.emit('onSpeechResult', res);
    };
    onnomatch = (event) => {
        logger.log(TAG_NAME$1, 'onnomatch', event);
    };
    onerror = (event) => {
        logger.error(TAG_NAME$1, 'onerror', event);
    };
}

const rangeNum = (from, to) => {
    return Math.floor(Math.random() * (to - from + 1)) + from;
};
const rangeArrItem = (arr) => {
    const index = rangeNum(0, arr.length - 1);
    return arr[index];
};
const rangeRgb = () => {
    //rgb颜色随机
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
    return rgb;
};

class Word {
    canvasDom;
    ctx;
    content;
    width;
    height = rangeNum(14, 30);
    top = 0;
    left;
    font = this.height + 'px serif';
    fillStyle = rangeRgb();
    score = Math.floor((1 / this.height) * 100);
    constructor(canvasDom, ctx, content) {
        this.canvasDom = canvasDom;
        this.ctx = ctx;
        this.content = content;
        this.width = this.ctx.measureText(this.content).width;
        this.left = rangeNum(0, this.canvasDom.width - this.width);
    }
}

var enUS = [
    'apple',
    'banana',
    'pear',
    'tangerine',
    'pineapple',
    'durian',
    'hawthorn',
    'orange',
    'watermelon',
    'mangosteen',
    'grape',
];

var zhCN = [
    '苹果',
    '香蕉',
    '梨子',
    '橘子',
    '菠萝',
    '榴莲',
    '山楂',
    '橙子',
    '西瓜',
    '山竹',
    '葡萄',
];

const TAG_NAME = 'GameController';
// TODO 交互优化
class GameController extends eventemitter3.EventEmitter {
    root;
    canvasDom;
    ctx;
    drawTimer;
    downRate = 1000;
    downTimer;
    downHeight = 0.1;
    genWordRate = 1000;
    genWordTimer;
    countdown = 20;
    countdownTimer;
    score = 0;
    words = [];
    constructor(root) {
        super();
        this.root = root;
        if (!this.root.opt.canvasDom.getContext('2d')) {
            throw Error('Your broswer is not support Canvas.');
        }
        this.canvasDom = this.root.opt.canvasDom;
        this.ctx = this.canvasDom.getContext('2d');
        this.root.speechController.on('onSpeechResult', this.onSpeechResult);
    }
    start() {
        logger.log(TAG_NAME, 'start');
        this.startDraw();
        this.emit('gameStart');
        this.emit('updateCountdown', this.countdown);
        this.emit('updateScore', this.score);
    }
    stop() {
        logger.log(TAG_NAME, 'stop', 'score: ', this.score);
        this.resetState();
        this.emit('gameEnd');
    }
    pause() {
        logger.log(TAG_NAME, 'pause');
        this.stopDraw();
        this.emit('gamePause');
    }
    continue() {
        logger.log(TAG_NAME, 'continue');
        this.startDraw();
        this.emit('gameContinue');
    }
    replay() {
        logger.log(TAG_NAME, 'replay');
        this.resetState();
        this.startDraw();
        this.emit('gameReplay');
    }
    destroy() {
        logger.log(TAG_NAME, 'destroy');
        this.resetState();
        this.root.speechController.off('onSpeechResult', this.onSpeechResult);
    }
    startDraw() {
        this.drawCanvas();
        this.downTimer = window.setInterval(this.down.bind(this), this.downTimer);
        this.genWordTimer = window.setInterval(this.genWord.bind(this), this.genWordRate);
        this.countdownTimer = window.setInterval(this.countdownHandler.bind(this), 1000);
    }
    stopDraw() {
        if (this.drawTimer) {
            window.cancelAnimationFrame(this.drawTimer);
            this.drawTimer = undefined;
        }
        if (this.downTimer) {
            window.clearInterval(this.downTimer);
            this.downTimer = undefined;
        }
        if (this.genWordTimer) {
            window.clearInterval(this.genWordTimer);
            this.genWordTimer = undefined;
        }
        if (this.countdownTimer) {
            window.clearInterval(this.countdownTimer);
            this.countdownTimer = undefined;
        }
    }
    resetState() {
        this.stopDraw();
        this.ctx.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
        this.downRate = 1000;
        this.downHeight = 0.1;
        this.genWordRate = 1000;
        this.countdown = 20;
        this.score = 0;
        this.words = [];
        this.emit('updateCountdown', this.countdown);
        this.emit('updateScore', this.score);
    }
    drawCanvas() {
        this.ctx.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
        this.words.forEach((item) => {
            this.ctx.font = item.font;
            this.ctx.fillStyle = item.fillStyle;
            this.ctx.fillText(item.content, item.left, item.top);
        });
        if (this.countdown <= 0) {
            this.stop();
            return;
        }
        this.drawTimer = window.requestAnimationFrame(this.drawCanvas.bind(this));
    }
    down() {
        for (let i = 0; i < this.words.length; i++) {
            const item = this.words[i];
            if (item.top - item.height < this.canvasDom.height) {
                item.top += this.downHeight;
            }
            else {
                this.words.splice(i, 1);
                i--;
            }
        }
    }
    genWord() {
        const word = new Word(this.canvasDom, this.ctx, rangeArrItem(this.root.opt.lang === 'zh-CN' ? zhCN : enUS));
        this.words.push(word);
    }
    onSpeechResult = (text) => {
        logger.log(TAG_NAME, 'onSpeechResult', text);
        for (let i = 0; i < this.words.length; i++) {
            const item = this.words[i];
            if (item.content === text) {
                this.score += item.score;
                this.emit('updateScore', this.score);
                this.words.splice(i, 1);
                i--;
            }
        }
    };
    countdownHandler() {
        logger.log(TAG_NAME, 'countdownHandler', this.countdown);
        this.countdown--;
        this.emit('updateCountdown', this.countdown);
    }
}

class VoiceControlGame extends eventemitter3 {
    opt;
    gameController;
    speechController;
    constructor(opt) {
        super();
        this.opt = opt;
        this.speechController = new SpeechController(this);
        this.gameController = new GameController(this);
        this.gameController.on('gameStart', this.onGameStart);
        this.gameController.on('gameEnd', this.onGameEnd);
        this.gameController.on('gameContinue', this.onGameContinue);
        this.gameController.on('gamePause', this.onGamePause);
        this.gameController.on('gameReplay', this.onGameReplay);
        this.gameController.on('updateScore', this.onUpdateScore);
        this.gameController.on('updateCountdown', this.onUpdateCountdown);
    }
    start() {
        this.gameController.start();
    }
    stop() {
        this.gameController.stop();
    }
    continue() {
        this.gameController.continue();
    }
    pause() {
        this.gameController.pause();
    }
    replay() {
        this.gameController.replay();
    }
    destroy() {
        this.gameController.destroy();
        this.speechController.destroy();
        this.gameController.off('gameStart', this.onGameStart);
        this.gameController.off('gameEnd', this.onGameEnd);
        this.gameController.off('gameContinue', this.onGameContinue);
        this.gameController.off('gamePause', this.onGamePause);
        this.gameController.off('updateScore', this.onUpdateScore);
        this.gameController.off('updateCountdown', this.onUpdateCountdown);
    }
    onGameStart = () => {
        this.speechController.start();
        this.emit('gameStart');
    };
    onGameEnd = () => {
        this.speechController.stop();
        this.emit('gameEnd');
    };
    onGameContinue = () => {
        this.speechController.start();
        this.emit('gameContinue');
    };
    onGamePause = () => {
        this.speechController.stop();
        this.emit('gamePause');
    };
    onGameReplay = () => {
        this.speechController.start();
        this.emit('gameReplay');
    };
    onUpdateScore = (score) => {
        this.emit('updateScore', score);
    };
    onUpdateCountdown = (countdown) => {
        this.emit('updateCountdown', countdown);
    };
}

export { VoiceControlGame as default };
