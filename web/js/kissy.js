/*
Copyright 2010, KISSY UI Library v1.1.6
MIT Licensed
build time: Dec 15 17:50
*/
/*
 * @module kissy
 * @author lifesinger@gmail.com
 */
(function(host, S, undef) {

    var meta = {
            /**
             * Copies all the properties of s to r.
             * @return {Object} the augmented object
             */
            mix: function(r, s, ov, wl) {
                if (!s || !r) return r;
                if (ov === undef) ov = true;
                var i, p, len;

                if (wl && (len = wl.length)) {
                    for (i = 0; i < len; i++) {
                        p = wl[i];
                        if (p in s) {
                            _mix(p, r, s, ov);
                        }
                    }
                } else {
                    for (p in s) {
                        _mix(p, r, s, ov);
                    }
                }
                return r;
            }
        },

        _mix = function(p, r, s, ov) {
            if (ov || !(p in r)) {
                r[p] = s[p];
            }
        },

        // If KISSY is already defined, the existing KISSY object will not
        // be overwritten so that defined namespaces are preserved.
        seed = (host && host[S]) || {},

        guid = 0,
        EMPTY = '';

    // The host of runtime environment. specify by user's seed or <this>,
    // compatibled for  '<this> is null' in unknown engine.
    host = seed.__HOST || (seed.__HOST = host || {});

    // shortcut and meta for seed.
    S = host[S] = meta.mix(seed, meta, false);

    S.mix(S, {

        // S.app() with these members.
        __APP_MEMBERS: ['namespace'],
        __APP_INIT_METHODS: ['__init'],

        /**
         * The version of the library.
         * @type {String}
         */
        version: '1.1.6',

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge: function() {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; i++) {
                S.mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment: function(/*r, s1, s2, ..., ov, wl*/) {
            var args = arguments, len = args.length - 2,
                r = args[0], ov = args[len], wl = args[len + 1],
                i = 1;

            if (!S.isArray(wl)) {
                ov = wl;
                wl = undef;
                len++;
            }
            if (!S.isBoolean(ov)) {
                ov = undef;
                len++;
            }

            for (; i < len; i++) {
                S.mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var create = Object.create ?
                         function(proto, c) {
                             return Object.create(proto, {
                                 constructor: {
                                     value: c
                                 }
                             });
                         } :
                         function (proto, c) {
                             function F() {
                             }

                             F.prototype = proto;

                             var o = new F();
                             o.constructor = c;
                             return o;
                         },
                sp = s.prototype,
                rp;

            // add prototype chain
            r.prototype = rp = create(sp, r);
            r.superclass = create(sp, s);

            // add prototype overrides
            if (px) {
                S.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                S.mix(r, sx);
            }

            return r;
        },

        /****************************************************************************************

         *                            The KISSY System Framework                                *

         ****************************************************************************************/

        /**
         * Initializes KISSY
         */
        __init: function() {
            this.Config = this.Config || {};
            this.Env = this.Env || {};

            // NOTICE: '@DEBUG@' will replace with '' when compressing.
            // So, if loading source file, debug is on by default.
            // If loading min version, debug is turned off automatically.
            this.Config.debug = '@DEBUG@';
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * S.namespace('TB.app.Shop', true); // returns TB.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace: function() {
            var args = arguments, l = args.length,
                o = null, i, j, p,
                global = (args[l - 1] === true && l--);

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app: function(name, sx) {
            var isStr = S.isString(name),
                O = isStr ? host[name] || {} : name,
                i = 0,
                len = S.__APP_INIT_METHODS.length;

            S.mix(O, this, true, S.__APP_MEMBERS);
            for (; i < len; i++) S[S.__APP_INIT_METHODS[i]].call(O);

            S.mix(O, S.isFunction(sx) ? sx() : sx);
            isStr && (host[name] = O);

            return O;
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         */
        log: function(msg, cat, src) {
            if (S.Config.debug) {
                if (src) {
                    msg = src + ': ' + msg;
                }
                if (host['console'] !== undef && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
        },

        /**
         * Throws error message.
         */
        error: function(msg) {
            if (S.Config.debug) {
                throw msg;
            }
        },

        /*
         * Generate a global unique id.
         * @param pre {String} optional guid prefix
         * @return {String} the guid
         */
        guid: function(pre) {
            return (pre || EMPTY) + guid++;
        }
    });

    S.__init();

    return S;

})(this, 'KISSY');
/**
 * @module  lang
 * @author  lifesinger@gmail.com
 */
(function(S, undef) {

    var host = S.__HOST,

        toString = Object.prototype.toString,
        indexOf = Array.prototype.indexOf,
        lastIndexOf = Array.prototype.lastIndexOf,
        filter = Array.prototype.filter,
        trim = String.prototype.trim,

        EMPTY = '',
        RE_TRIM = /^\s+|\s+$/g,

        // [[Class]] -> type pairs
        class2type = {};

    S.mix(S, {

        /**
         * Determine the internal JavaScript [[Class]] of an object.
         */
        type: function(o) {
            return o == null ?
                String(o) :
                class2type[toString.call(o)] || 'object';
        },

        isNull: function(o) {
            return o === null;
        },

        isUndefined: function(o) {
            return o === undef;
        },

        /**
         * Checks to see if an object is empty.
         */
        isEmptyObject: function(o) {
            for (var p in o) {
                return false;
            }
            return true;
        },

        /**
         * Checks to see if an object is a plain object (created using "{}"
         * or "new Object()" or "new FunctionClass()").
         * Ref: http://lifesinger.org/blog/2010/12/thinking-of-isplainobject/
         */
        isPlainObject: function(o) {
            return o && toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
        },

        /**
         * Creates a deep copy of a plain object or array. Others are returned untouched.
         */
        clone: function(o) {
            var ret = o, b, k;

            // array or plain object
            if (o && ((b = S.isArray(o)) || S.isPlainObject(o))) {
                ret = b ? [] : {};
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        ret[k] = S.clone(o[k]);
                    }
                }
            }

            return ret;
        },

        /**
         * Removes the whitespace from the beginning and end of a string.
         */
        trim: trim ?
            function(str) {
                return (str == undef) ? EMPTY : trim.call(str);
            } :
            function(str) {
                return (str == undef) ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
            },

        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         */
        substitute: function(str, o, regexp) {
            if (!S.isString(str) || !S.isPlainObject(o)) return str;

            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
                if (match.charAt(0) === '\\') return match.slice(1);
                return (o[name] !== undef) ? o[name] : EMPTY;
            });
        },

        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param context {Object} (opt)
         */
        each: function(object, fn, context) {
            var key, val, i = 0, length = object.length,
                isObj = length === undef || S.type(object) === 'function';
            context = context || host;

            if (isObj) {
                for (key in object) {
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                for (val = object[0];
                     i < length && fn.call(context, val, i, object) !== false; val = object[++i]) {
                }
            }

            return object;
        },

        /**
         * Search for a specified value within an array.
         */
        indexOf: indexOf ?
            function(item, arr) {
                return indexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = 0, len = arr.length; i < len; ++i) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            },

        /**
         * Returns the index of the last item in the array
         * that contains the specified value, -1 if the
         * value isn't found.
         */
        lastIndexOf: (lastIndexOf) ?
            function(item, arr) {
                return lastIndexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i] === item) {
                        break;
                    }
                }
                return i;
            },

        /**
         * Returns a copy of the array with the duplicate entries removed
         * @param a {Array} the array to find the subset of uniques for
         * @param override {Boolean}
         *        if override is true, S.unique([a, b, a]) => [b, a]
         *        if override is false, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         */
        unique: function(a, override) {
            if (override) a.reverse();
            var b = a.slice(), i = 0, n, item;

            while (i < b.length) {
                item = b[i];
                while ((n = S.lastIndexOf(item, b)) !== i) {
                    b.splice(n, 1);
                }
                i += 1;
            }

            if (override) b.reverse();
            return b;
        },

        /**
         * Search for a specified value index within an array.
         */
        inArray: function(item, arr) {
            return S.indexOf(item, arr) > -1;
        },

        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned true for.
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param context {Object} optional context object
         * @return {Array} The items on which the supplied function
         *         returned true. If no items matched an empty array is
         *         returned.
         */
        filter: filter ?
            function(arr, fn, context) {
                return filter.call(arr, fn, context);
            } :
            function(arr, fn, context) {
                var ret = [];
                S.each(arr, function(item, i, arr) {
                    if (fn.call(context, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },

        /**
         * Gets current date in milliseconds.
         */
        now: function() {
            return new Date().getTime();
        }
    });

    S.each('Boolean Number String Function Array Date RegExp Object'.split(' '),
        function(name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function(o) {
                return S.type(o) == lc;
            }
        });

})(KISSY);
/**
 * @module  lang
 * @author  lifesinger@gmail.com
 */
(function(S, undef) {

    var win = S.__HOST,
        doc = win['document'],
        docElem = doc.documentElement,

        EMPTY = '',
        SEP = '&',
        BRACKET = encodeURIComponent('[]'),

        // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

        // The functions to execute on DOM ready.
        readyList = [],

        // Has the ready events already been bound?
        readyBound = false,

        // The number of poll times.
        POLL_RETRYS = 500,

        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

        // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,
        RE_ARR_KEY = /^(\w+)\[\]$/,
        RE_NOT_WHITE = /\S/;

    S.mix(S, {

        /**
         * A crude way of determining if an object is a window
         */
        isWindow: function(o) {
            return S.type(o) === 'object' && 'setInterval' in o;
        },

        /**
         * Converts object to a true array.
         */
        makeArray: function(o) {
            if (o === null || o === undef) return [];
            if (S.isArray(o)) return o;

            // The strings and functions also have 'length'
            if (typeof o.length !== 'number' || S.isString(o) || S.isFunction(o)) {
                return [o];
            }

            return slice2Arr(o);
        },

        /**
         * Creates a serialized string of an array or object.
         * <code>
         * {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         * {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar[]=2&bar[]=3'
         * {foo: '', bar: 2}    // -> 'foo=&bar=2'
         * {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         * {foo: true, bar: 2}    // -> 'foo=true&bar=2'
         * </code>
         */
        param: function(o, sep) {
            if (!S.isPlainObject(o)) return EMPTY;
            sep = sep || SEP;

            var buf = [], key, val;
            for (key in o) {
                val = o[key];
                key = encodeURIComponent(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key, '=', encodeURIComponent(val + EMPTY), sep);
                }
                // val is not empty array
                else if (S.isArray(val) && val.length) {
                    for (var i = 0, len = val.length; i < len; ++i) {
                        if (isValidParamValue(val[i])) {
                            buf.push(key, BRACKET + '=', encodeURIComponent(val[i] + EMPTY), sep);
                        }
                    }
                }
                // ignore other cases, including empty array, Function, RegExp, Date etc.
            }
            buf.pop();
            return buf.join(EMPTY);
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         * <code>
         * 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         * 'section=blog&tag[]=js&tag[]=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         * 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         * 'id=45&raw'        // -> {id: '45', raw: ''}
         * </code>
         */
        unparam: function(str, sep) {
            if (typeof str !== 'string' || (str = S.trim(str)).length === 0) return {};

            var ret = {},
                pairs = str.split(sep || SEP),
                pair, key, val, m,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                pair = pairs[i].split('=');
                key = decodeURIComponent(pair[0]);

                // decodeURIComponent will throw exception when pair[1] contains
                // GBK encoded chinese characters.
                try {
                    val = decodeURIComponent(pair[1] || EMPTY);
                } catch (ex) {
                    val = pair[1] || EMPTY;
                }

                if ((m = key.match(RE_ARR_KEY)) && m[1]) {
                    ret[m[1]] = ret[m[1]] || [];
                    ret[m[1]].push(val);
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        },

        /**
         * Evalulates a script in a global context.
         */
        globalEval: function(data) {
            if (data && RE_NOT_WHITE.test(data)) {
                // Inspired by code by Andrea Giammarchi
                // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
                var head = doc.getElementsByTagName('head')[0] || docElem,
                    script = doc.createElement('script');

                // It works! All browsers support!
                script.text = data;

                // Use insertBefore instead of appendChild to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                head.removeChild(script);
            }
        },

        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later. Executes the function a
         * single time unless periodic is set to true.
         * @param fn {Function|String} the function to execute or the name of the method in
         *        the 'o' object to execute.
         * @param when {Number} the number of milliseconds to wait until the fn is executed.
         * @param periodic {Boolean} if true, executes continuously at supplied interval
         *        until canceled.
         * @param o {Object} the context object.
         * @param data [Array] that is provided to the function. This accepts either a single
         *        item or an array. If an array is provided, the function is executed with
         *        one parameter for each array item. If you need to pass a single array
         *        parameter, it needs to be wrapped in an array [myarray].
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         *         the timer.
         */
        later: function(fn, when, periodic, o, data) {
            when = when || 0;
            o = o || { };
            var m = fn, d = S.makeArray(data), f, r;

            if (S.isString(fn)) {
                m = o[fn];
            }

            if (!m) {
                S.error('method undefined');
            }

            f = function() {
                m.apply(o, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function() {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         * <code>
         * KISSY.ready(function(S){ });
         * </code>
         * @return {KISSY}
         */
        ready: function(fn) {
            // Attach the listeners
            if (!readyBound) this._bindReady();

            // If the DOM is already ready
            if (isReady) {
                // Execute the function immediately
                fn.call(win, this);
            } else {
                // Remember the function for later
                readyList.push(fn);
            }

            return this;
        },

        /**
         * Binds ready events.
         */
        _bindReady: function() {
            var self = this,
                doScroll = doc.documentElement.doScroll,
                eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
                COMPLETE = 'complete',
                fire = function() {
                    self._fireReady();
                };

            // Set to true once it runs
            readyBound = true;

            // Catch cases where ready() is called after the
            // browser event has already occurred.
            if (doc.readyState === COMPLETE) {
                return fire();
            }

            // w3c mode
            if (doc.addEventListener) {
                function domReady() {
                    doc.removeEventListener(eventType, domReady, false);
                    fire();
                }

                doc.addEventListener(eventType, domReady, false);

                // A fallback to window.onload, that will always work
                win.addEventListener('load', fire, false);
            }
            // IE event model is used
            else {
                function stateChange() {
                    if (doc.readyState === COMPLETE) {
                        doc.detachEvent(eventType, stateChange);
                        fire();
                    }
                }

                // ensure firing before onload, maybe late but safe also for iframes
                doc.attachEvent(eventType, stateChange);

                // A fallback to window.onload, that will always work.
                win.attachEvent('onload', fire);

                // If IE and not a frame
                // continually check to see if the document is ready
                var notframe = false;

                try {
                    notframe = win['frameElement'] == null;
                } catch(e) {
                }

                if (doScroll && notframe) {
                    function readyScroll() {
                        try {
                            // Ref: http://javascript.nwbox.com/IEContentLoaded/
                            doScroll('left');
                            fire();
                        } catch(ex) {
                            setTimeout(readyScroll, 1);
                        }
                    }

                    readyScroll();
                }
            }
        },

        /**
         * Executes functions bound to ready event.
         */
        _fireReady: function() {
            if (isReady) return;

            // Remember that the DOM is ready
            isReady = true;

            // If there are functions bound, to execute
            if (readyList) {
                // Execute all of them
                var fn, i = 0;
                while (fn = readyList[i++]) {
                    fn.call(win, this);
                }

                // Reset the list of functions
                readyList = null;
            }
        },

        /**
         * Executes the supplied callback when the item with the supplied id is found.
         * @param id <String> The id of the element, or an array of ids to look for.
         * @param fn <Function> What to execute when the element is found.
         */
        available: function(id, fn) {
            id = (id + EMPTY).match(RE_IDSTR)[1];
            if (!id || !S.isFunction(fn)) return;

            var retryCount = 1,

                timer = S.later(function() {
                    if (doc.getElementById(id) && (fn() || 1) || ++retryCount > POLL_RETRYS) {
                        timer.cancel();
                    }

                }, POLL_INTERVAL, true);
        }
    });

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return true.
        return val === null || (t !== 'object' && t !== 'function');
    }

    // Converts array-like collection such as LiveNodeList to normal array.
    function slice2Arr(arr) {
        return Array.prototype.slice.call(arr);
    }
    // IE will throw error.
    try {
        slice2Arr(docElem.childNodes);
    }
    catch(e) {
        slice2Arr = function(arr) {
            for (var ret = [], i = arr.length - 1; i >= 0; i--) {
                ret[i] = arr[i];
            }
            return ret;
        }
    }

    // If url contains '?ks-debug', debug mode will turn on automatically.
    if (location && (location.search || EMPTY).indexOf('ks-debug') !== -1) {
        S.Config.debug = true;
    }

})(KISSY);
/**
 * @module loader
 * @author lifesinger@gmail.com, lijing00333@163.com, yiminghe@gmail.com
 */
(function(S, undef) {

    var win = S.__HOST,
        doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,

        EMPTY = '', CSSFULLPATH = 'cssfullpath',
        LOADING = 1, LOADED = 2, ERROR = 3, ATTACHED = 4,
        mix = S.mix,

        scriptOnload = doc.createElement('script').readyState ?
            function(node, callback) {
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (rs === 'loaded' || rs === 'complete') {
                        node.onreadystatechange = null;
                        oldCallback && oldCallback();
                        callback.call(this);
                    }
                };
            } :
            function(node, callback) {
                node.addEventListener('load', callback, false);
            },

        RE_CSS = /\.css(?:\?|$)/i,
        loader;

    loader = {

        /**
         * Registers a module.
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KISSY
         * @param config {Object}
         * <code>
         * KISSY.add('module-name', function(S){ }, requires: ['mod1']);
         * </code>
         * <code>
         * KISSY.add({
         *     'mod-name': {
         *         fullpath: 'url',
         *         requires: ['mod1','mod2'],
         *         attach: false // 默认为 true
         *     }
         * });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn, config) {
            var self = this, mods = self.Env.mods, mod, o, oldr;

            // S.add(name, config) => S.add( { name: config } )
            if (S.isString(name) && !config && S.isPlainObject(fn)) {
                o = {};
                o[name] = fn;
                name = o;
            }

            // S.add( { name: config } )
            if (S.isPlainObject(name)) {
                S.each(name, function(v, k) {
                    v.name = k;
                    if (mods[k]) mix(v, mods[k], false); // 保留之前添加的配置
                });
                mix(mods, name);
            }
            // S.add(name[, fn[, config]])
            else {
                config = config || {};

                mod = mods[name] || {};
                name = config.host || mod.host || name;
                mod = mods[name] || {};

                // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，还
                //      是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
                mix(mod, { name: name, status: LOADED });

                if (!mod.fns) mod.fns = [];
                fn && mod.fns.push(fn);

                //!TODO 暂时不考虑 requires 在 add 中的修改
                // 和 order _requires 关联起来太复杂
                oldr = mod['requires'];
                mix((mods[name] = mod), config);
                mods[name]['requires'] = oldr; // 不覆盖

                // 对于 requires 都已 attached 的模块，比如 core 中的模块，直接 attach
                if ((mod['attach'] !== false) && self.__isAttached(mod.requires)) {
                    self.__attachMod(mod);
                }

                //!TODO add 中指定了依赖项，这里没有继续载依赖项
                //self.__isAttached(mod.requires) 返回 false
            }

            return self;
        },

        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         * config = {
         *   order: true, // 默认为 false. 是否严格按照 modNames 的排列顺序来回调入口函数
         *   global: KISSY // 默认为 KISSY. 当在 this.Env.mods 上找不到某个 mod 的属性时，会到 global.Env.mods 上去找
         * }
         */
        use: function(modNames, callback, config) {
            modNames = modNames.replace(/\s+/g, EMPTY).split(',');
            config = config || {};

            var self = this, mods = self.Env.mods,
                global = (config || 0).global,
                i, len = modNames.length, mod, name, fired;

            // 将 global 上的 mods, 移动到 instance 上
            if (global) self.__mixMods(global);

            // 已经全部 attached, 直接执行回调即可
            if (self.__isAttached(modNames)) {
                callback && callback(self);
                return;
            }

            // 有尚未 attached 的模块
            for (i = 0; i < len && (mod = mods[modNames[i]]); i++) {
                if (mod.status === ATTACHED) continue;

                // 通过添加依赖，来保证调用顺序
                if (config.order && i > 0) {
                    if (!mod.requires) mod.requires = [];
                    mod._requires = mod.requires.concat(); // 保留，以便还原
                    name = modNames[i - 1];

                    if (!S.inArray(name, mod.requires)
                        && !(S.inArray(mod.name, mods[name].requires || []))) { // 避免循环依赖
                        mod.requires.push(name);
                    }
                }

                self.__attach(mod, function() {
                    if (mod._requires) {
                        mod.requires = mod._requires; // restore requires
                        delete mod._requires;
                    }
                    if (!fired && self.__isAttached(modNames)) {
                        fired = true;
                        callback && callback(self);
                    }
                }, global);
            }

            return self;
        },

        /**
         * Attach a module and all required modules.
         */
        __attach: function(mod, callback, global) {
            var self = this, requires = mod['requires'] || [],
                i = 0, len = requires.length;

            // attach all required modules
            for (; i < len; i++) {
                self.__attach(self.Env.mods[requires[i]], fn, global);
            }

            // load and attach this module
            self.__buildPath(mod);
            self.__load(mod, fn, global);

            function fn() {
                // add 可能改了 config，这里重新取下
                var requires = mod['requires'] || [];

                if (self.__isAttached(requires)) {
                    if (mod.status === LOADED) {
                        self.__attachMod(mod);
                    }
                    if (mod.status === ATTACHED) {
                        callback();
                    }
                }
            }
        },

        __mixMods: function(global) {
            var mods = this.Env.mods, gMods = global.Env.mods, name;
            for (name in gMods) {
                this.__mixMod(mods, gMods, name, global);
            }
        },

        __mixMod: function(mods, gMods, name, global) {
            var mod = mods[name] || {}, status = mod.status;

            S.mix(mod, S.clone(gMods[name]));

            // status 属于实例，当有值时，不能被覆盖。只有没有初始值时，才从 global 上继承
            if (status) mod.status = status;

            // 来自 global 的 mod, path 应该基于 global
            if (global) this.__buildPath(mod, global.Config.base);

            mods[name] = mod;
        },

        __attachMod: function(mod) {
            var self = this;

            if (mod.fns) {
                S.each(mod.fns, function(fn) {
                    fn && fn(self);
                });
                mod.fns = undef; // 保证 attach 过的方法只执行一次
                //S.log(mod.name + '.status = attached');
            }

            mod.status = ATTACHED;
        },

        __isAttached: function(modNames) {
            var mods = this.Env.mods, mod,
                i = (modNames = S.makeArray(modNames)).length - 1;

            for (; i >= 0 && (mod = mods[modNames[i]]); i--) {
                if (mod.status !== ATTACHED) return false;
            }

            return true;
        },

        /**
         * Load a single module.
         */
        __load: function(mod, callback, global) {
            var self = this, url = mod['fullpath'],
                loadQueque = S.Env._loadQueue, // 这个是全局的，防止多实例对同一模块的重复下载
                node = loadQueque[url], ret;

            mod.status = mod.status || 0;

            // 可能已经由其它模块触发加载
            if (mod.status < LOADING && node) {
                mod.status = node.nodeName ? LOADING : LOADED;
            }

            // 加载 css, 仅发出请求，不做任何其它处理
            if (S.isString(mod[CSSFULLPATH])) {
                self.getScript(mod[CSSFULLPATH]);
                mod[CSSFULLPATH] = LOADED;
            }

            if (mod.status < LOADING && url) {
                mod.status = LOADING;

                ret = self.getScript(url, {
                    success: function() {
                        KISSY.log(mod.name + ' is loaded.', 'info'); // 压缩时不过滤该句，以方便线上调试
                        _success();
                    },
                    error: function() {
                        mod.status = ERROR;
                        _final();
                    },
                    charset: mod.charset
                });

                // css 是同步的，在 success 回调里，已经将 loadQueque[url] 置成 LOADED
                // 不需要再置成节点，否则有问题
                if (!RE_CSS.test(url)) {
                    loadQueque[url] = ret;
                }
            }
            // 已经在加载中，需要添加回调到 script onload 中
            // 注意：没有考虑 error 情形
            else if (mod.status === LOADING) {
                scriptOnload(node, _success);
            }
            // 是内嵌代码，或者已经 loaded
            else {
                callback();
            }

            function _success() {
                _final();
                if (mod.status !== ERROR) {

                    // 对于动态下载下来的模块，loaded 后，global 上有可能更新 mods 信息，需要同步到 instance 上去
                    // 注意：要求 mod 对应的文件里，仅修改该 mod 信息
                    if (global) self.__mixMod(self.Env.mods, global.Env.mods, mod.name, global);

                    // 注意：当多个模块依赖同一个下载中的模块A下，模块A仅需 attach 一次
                    // 因此要加上下面的 !== 判断，否则会出现重复 attach, 比如编辑器里动态加载时，被依赖的模块会重复
                    if (mod.status !== ATTACHED) mod.status = LOADED;

                    callback();
                }
            }

            function _final() {
                loadQueque[url] = LOADED;
            }
        },

        __buildPath: function(mod, base) {
            var Config = this.Config;

            build('path', 'fullpath');
            if (mod[CSSFULLPATH] !== LOADED) build('csspath', CSSFULLPATH);

            function build(path, fullpath) {
                if (!mod[fullpath] && mod[path]) {
                    mod[fullpath] = (base || Config.base) + mod[path];
                }
                // debug 模式下，加载非 min 版
                if (mod[fullpath] && Config.debug) {
                    mod[fullpath] = mod[fullpath].replace(/-min/g, '');
                }
            }
        },

        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         * <code>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </code>
         */
        getScript: function(url, success, charset) {
            var isCSS = RE_CSS.test(url),
                node = doc.createElement(isCSS ? 'link' : 'script'),
                config = success, error, timeout, timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            if (isCSS) {
                node.href = url;
                node.rel = 'stylesheet';
            } else {
                node.src = url;
                node.async = true;
            }
            if (charset) node.charset = charset;

            if (isCSS) {
                S.isFunction(success) && success.call(node);
            } else {
                scriptOnload(node, function() {
                    if (timer) {
                        timer.cancel();
                        timer = undef;
                    }

                    S.isFunction(success) && success.call(node);

                    // remove script
                    if (head && node.parentNode) {
                        head.removeChild(node);
                    }
                });
            }

            if (S.isFunction(error)) {
                timer = S.later(function() {
                    timer = undef;
                    error();
                }, (timeout || this.Config.timeout) * 1000);
            }

            head.insertBefore(node, head.firstChild);
            return node;
        }
    };

    mix(S, loader);

    /**
     * get base from src
     * @param src script source url
     * @return base for kissy
     * @example:
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     * @notice: custom combo rules, such as yui3:
     *  <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     */
    // notice: timestamp
    var baseReg = /^(.*)(seed|kissy)(-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(-min)?\.js/;

    function getBaseUrl(script) {
        var src = script.src,
            prefix = script.getAttribute('data-combo-prefix') || '??',
            sep = script.getAttribute('data-combo-sep') || ',',
            parts = src.split(sep),
            base,
            part0 = parts[0],
            index = part0.indexOf(prefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = part0.substring(0, index);
            var part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(baseTestReg)) {
                base += part01.replace(baseReg, '$1');
            }
            // combo after first
            else {
                for (var i = 1; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        break;
                    }
                }
            }
        }
        return base;
    }

    /**
     * Initializes loader.
     */
    S.__initLoader = function() {
        // get base from current script file path
        var scripts = doc.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = getBaseUrl(currentScript);

        this.Env.mods = {}; // all added mods
        this.Env._loadQueue = {}; // information for loading and loaded mods

        // don't override
        if(!this.Config.base) this.Config.base = base;
        if(!this.Config.timeout) this.Config.timeout = 10;   // the default timeout for getScript
    };
    S.__initLoader();

    // for S.app working properly
    S.each(loader, function(v, k) {
        S.__APP_MEMBERS.push(k);
    });
    S.__APP_INIT_METHODS.push('__initLoader');

})(KISSY);

/**
 * @module mods
 * @author lifesinger@gmail.com
 */
(function(S) {

    var map = {
        core: {
            path: 'packages/core-min.js',
            charset: 'utf-8'
        }
    };

    S.each([
        'sizzle', 'dd', 'datalazyload', // pure utilities
        'flash', // flash etc.
        'switchable', 'suggest', 'calendar', // UI components based on Base
        'uibase', 'overlay', 'imagezoom' // UI components based on UIBase
    ],
        function(modName) {
            map[modName] = {
                path: modName + '/' + modName + '-pkg-min.js',
                requires: ['core'],
                charset: 'utf-8'
            };
        });

    map['calendar'].csspath = 'calendar/default-min.css';
    map['overlay'].requires = ['uibase'];

    S.add(map);

})(KISSY);
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  ua
 * @author  lifesinger@gmail.com
 */
KISSY.add('ua', function(S) {

    var ua = navigator.userAgent,
        EMPTY = '', MOBILE = 'mobile',
        core = EMPTY, shell = EMPTY, m,
        o = {
            // browser core type
            //webkit: 0,
            //trident: 0,
            //gecko: 0,
            //presto: 0,

            // browser type
            //chrome: 0,
            //safari: 0,
            //firefox:  0,
            //ie: 0,
            //opera: 0

            //mobile: '',
            //core: '',
            //shell: ''
        },
        numberify = function(s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 0) ? '.' : '';
            }));
        };

    // WebKit
    if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
        o[core = 'webkit'] = numberify(m[1]);

        // Chrome
        if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
            o[shell = 'chrome'] = numberify(m[1]);
        }
        // Safari
        else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
            o[shell = 'safari'] = numberify(m[1]);
        }

        // Apple Mobile
        if (/ Mobile\//.test(ua)) {
            o[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch
        }
        // Other WebKit Mobile Browsers
        else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
            o[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
        }
    }
    // NOT WebKit
    else {
        // Presto
        // ref: http://www.useragentstring.com/pages/useragentstring.php
        if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
            o[core = 'presto'] = numberify(m[1]);
            
            // Opera
            if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                o[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                    o[shell] = numberify(m[1]);
                }

                // Opera Mini
                if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                    o[MOBILE] = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                }
                // Opera Mobile
                // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                // issue: 由于 Opera Mobile 有 Version/ 字段，可能会与 Opera 混淆，同时对于 Opera Mobile 的版本号也比较混乱
                else if ((m = ua.match(/Opera Mobi[^;]*/)) && m){
                    o[MOBILE] = m[0];
                }
            }
            
        // NOT WebKit or Presto
        } else {
            // MSIE
            if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                o[core = 'trident'] = 0.1; // Trident detected, look for revision
                // 注意：
                //  o.shell = ie, 表示外壳是 ie
                //  但 o.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
                //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 o.ie = 8, 否则
                //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
                o[shell = 'ie'] = numberify(m[1]);

                // Get the Trident's accurate version
                if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
                    o[core] = numberify(m[1]);
                }

            // NOT WebKit, Presto or IE
            } else {
                // Gecko
                if ((m = ua.match(/Gecko/))) {
                    o[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                    if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                        o[core] = numberify(m[1]);
                    }

                    // Firefox
                    if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                        o[shell = 'firefox'] = numberify(m[1]);
                    }
                }
            }
        }
    }

    o.core = core;
    o.shell = shell;
    o._numberify = numberify;
    S.UA = o;
});

/**
 * NOTES:
 *
 * 2010.03
 *  - jQuery, YUI 等类库都推荐用特性探测替代浏览器嗅探。特性探测的好处是能自动适应未来设备和未知设备，比如
 *    if(document.addEventListener) 假设 IE9 支持标准事件，则代码不用修改，就自适应了“未来浏览器”。
 *    对于未知浏览器也是如此。但是，这并不意味着浏览器嗅探就得彻底抛弃。当代码很明确就是针对已知特定浏览器的，
 *    同时并非是某个特性探测可以解决时，用浏览器嗅探反而能带来代码的简洁，同时也也不会有什么后患。总之，一切
 *    皆权衡。
 *  - UA.ie && UA.ie < 8 并不意味着浏览器就不是 IE8, 有可能是 IE8 的兼容模式。进一步的判断需要使用 documentMode.
 *
 * TODO:
 *  - test mobile
 *  - 3Q 大战后，360 去掉了 UA 信息中的 360 信息，需采用 res 方法去判断
 *
 */
/**
 * @module  ua-extra
 * @author  gonghao<gonghao@ghsky.com>
 */
KISSY.add('ua-extra', function(S) {
    var UA = S.UA,
        ua = navigator.userAgent,
        m, external, shell,
        o = { },
        numberify = UA._numberify;

    /**
     * 说明：
     * @子涯总结的各国产浏览器的判断依据: http://spreadsheets0.google.com/ccc?key=tluod2VGe60_ceDrAaMrfMw&hl=zh_CN#gid=0
     * 根据 CNZZ 2009 年度浏览器占用率报告，优化了判断顺序：http://www.tanmi360.com/post/230.htm
     * 如果检测出浏览器，但是具体版本号未知用 0.1 作为标识
     * 世界之窗 & 360 浏览器，在 3.x 以下的版本都无法通过 UA 或者特性检测进行判断，所以目前只要检测到 UA 关键字就认为起版本号为 3
     */

    // 360Browser
    if (m = ua.match(/360SE/)) {
        o[shell = 'se360'] = 3; // issue: 360Browser 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Maxthon
    else if ((m = ua.match(/Maxthon/)) && (external = window.external)) {
        // issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
        // but other maxthon versions all have exact version number
        shell = 'maxthon';
        try {
            o[shell] = numberify(external['max_version']);
        } catch(ex) {
            o[shell] = 0.1;
        }
    }
    // TT
    else if (m = ua.match(/TencentTraveler\s([\d.]*)/)) {
        o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0.1;
    }
    // TheWorld
    else if (m = ua.match(/TheWorld/)) {
        o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Sougou
    else if (m = ua.match(/SE\s([\d.]*)/)) {
        o[shell = 'sougou'] = m[1] ? numberify(m[1]) : 0.1;
    }

    // If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
    shell && (o.shell = shell);

    S.mix(UA, o);
});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom', function(S, undefined) {

    S.DOM = {

        /**
         * 是不是 element node
         */
        _isElementNode: function(elem) {
            return nodeTypeIs(elem, 1);
        },

        /**
         * 是不是 KISSY.Node
         */
        _isKSNode: function(elem) {
            return S.Node && nodeTypeIs(elem, S.Node.TYPE);
        },

        /**
         * elem 为 window 时，直接返回
         * elem 为 document 时，返回关联的 window
         * elem 为 undefined 时，返回当前 window
         * 其它值，返回 false
         */
        _getWin: function(elem) {
            return (elem && ('scrollTo' in elem) && elem['document']) ?
                elem :
                nodeTypeIs(elem, 9) ?
                    elem.defaultView || elem.parentWindow :
                    elem === undefined ?
                        window : false;
        },

        _nodeTypeIs: nodeTypeIs
    };

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }
});
/**
 * @module  selector
 * @author  lifesinger@gmail.com
 */
KISSY.add('selector', function(S, undefined) {

    var doc = document, DOM = S.DOM,
        SPACE = ' ', ANY = '*',
        GET_DOM_NODE = 'getDOMNode', GET_DOM_NODES = GET_DOM_NODE + 's',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {string} selector
     * @param {string|HTMLElement} context An #id string or a HTMLElement used as context
     * @return {Array} The array of found HTMLElement
     */
    function query(selector, context) {
        var match, t, ret = [], id, tag, cls;
        context = tuneContext(context);

        // Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
        // 考虑 2/8 原则，仅支持以下选择器：
        // #id
        // tag
        // .cls
        // #id tag
        // #id .cls
        // tag.cls
        // #id tag.cls
        // 注 1：REG_QUERY 还会匹配 #id.cls
        // 注 2：tag 可以为 * 字符
        // 返回值为数组
        // 选择器不支持时，抛出异常

        // selector 为字符串是最常见的情况，优先考虑
        // 注：空白字符串无需判断，运行下去自动能返回空数组
        if (S.isString(selector)) {
            selector = S.trim(selector);

            // selector 为 #id 是最常见的情况，特殊优化处理
            if (REG_ID.test(selector)) {
                t = getElementById(selector.slice(1), context);
                if (t) ret = [t]; // #id 无效时，返回空数组
            }
            // selector 为支持列表中的其它 6 种
            else if ((match = REG_QUERY.exec(selector))) {
                // 获取匹配出的信息
                id = match[1];
                tag = match[2];
                cls = match[3];

                if ((context = id ? getElementById(id, context) : context)) {
                    // #id .cls | #id tag.cls | .cls | tag.cls
                    if (cls) {
                        if (!id || selector.indexOf(SPACE) !== -1) { // 排除 #id.cls
                            ret = getElementsByClassName(cls, tag, context);
                        }
                        // 处理 #id.cls
                        else {
                            t = getElementById(id, context);
                            if(t && DOM.hasClass(t, cls)) {
                                ret = [t];
                            }
                        }
                    }
                    // #id tag | tag
                    else if (tag) { // 排除空白字符串
                        ret = getElementsByTagName(tag, context);
                    }
                }
            }
            // 采用外部选择器
            else if(S.ExternalSelector) {
                return S.ExternalSelector(selector, context);
            }
            // 依旧不支持，抛异常
            else {
                error(selector);
            }
        }
        // 传入的 selector 是 KISSY.Node/NodeList. 始终返回原生 DOM Node
        else if(selector && (selector[GET_DOM_NODE] || selector[GET_DOM_NODES])) {
            ret = selector[GET_DOM_NODE] ? [selector[GET_DOM_NODE]()] : selector[GET_DOM_NODES]();
        }
        // 传入的 selector 是 NodeList 或已是 Array
        else if (selector && (S.isArray(selector) || isNodeList(selector))) {
            ret = selector;
        }
        // 传入的 selector 是 Node 等非字符串对象，原样返回
        else if (selector) {
            ret = [selector];
        }
        // 传入的 selector 是其它值时，返回空数组

        // 将 NodeList 转换为普通数组
        if(isNodeList(ret)) {
            ret = S.makeArray(ret);
        }

        // attach each method
        ret.each = function(fn, context) {
            return S.each(ret, fn, context);
        };

        return ret;
    }

    // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
    function isNodeList(o) {
        // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
        // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
        // 注3：通过 namedItem 来判断不可靠
        // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
        return o && !o.nodeType && o.item && (o != window);
    }

    // 调整 context 为合理值
    function tuneContext(context) {
        // 1). context 为 undefined 是最常见的情况，优先考虑
        if (context === undefined) {
            context = doc;
        }
        // 2). context 的第二使用场景是传入 #id
        else if (S.isString(context) && REG_ID.test(context)) {
            context = getElementById(context.slice(1), doc);
            // 注：#id 可能无效，这时获取的 context 为 null
        }
        // 3). context 还可以传入 HTMLElement, 此时无需处理
        // 4). 经历 1 - 3, 如果 context 还不是 HTMLElement, 赋值为 null
        else if (context && context.nodeType !== 1 && context.nodeType !== 9) {
            context = null;
        }
        return context;
    }

    // query #id
    function getElementById(id, context) {
        if(context.nodeType !== 9) {
            context = context.ownerDocument;
        }
        return context.getElementById(id);
    }

    // query tag
    function getElementsByTagName(tag, context) {
        return context.getElementsByTagName(tag);
    }
    (function() {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName('*')

        // Create a fake element
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));

        // Make sure no comments are found
        if (div.getElementsByTagName(ANY).length > 0) {
            getElementsByTagName = function(tag, context) {
                var ret = context.getElementsByTagName(tag);

                if (tag === ANY) {
                    var t = [], i = 0, j = 0, node;
                    while ((node = ret[i++])) {
                        // Filter out possible comments
                        if (node.nodeType === 1) {
                            t[j++] = node;
                        }
                    }
                    ret = t;
                }
                return ret;
            };
        }
    })();

    // query .cls
    function getElementsByClassName(cls, tag, context) {
        var els = context.getElementsByClassName(cls),
            ret = els, i = 0, j = 0, len = els.length, el;

        if (tag && tag !== ANY) {
            ret = [];
            tag = tag.toUpperCase();
            for (; i < len; ++i) {
                el = els[i];
                if (el.tagName === tag) {
                    ret[j++] = el;
                }
            }
        }
        return ret;
    }
    if (!doc.getElementsByClassName) {
        // 降级使用 querySelectorAll
        if (doc.querySelectorAll) {
            getElementsByClassName = function(cls, tag, context) {
                return context.querySelectorAll((tag ? tag : '') + '.' + cls);
            }
        }
        // 降级到普通方法
        else {
            getElementsByClassName = function(cls, tag, context) {
                var els = context.getElementsByTagName(tag || ANY),
                    ret = [], i = 0, j = 0, len = els.length, el, t;

                cls = SPACE + cls + SPACE;
                for (; i < len; ++i) {
                    el = els[i];
                    t = el.className;
                    if (t && (SPACE + t + SPACE).indexOf(cls) > -1) {
                        ret[j++] = el;
                    }
                }
                return ret;
            }
        }
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    // public api
    S.query = query;
    S.get = function(selector, context) {
        return query(selector, context)[0] || null;
    };

    S.mix(DOM, {

        query: query,

        get: S.get,

        /**
         * Filters an array of elements to only include matches of a filter.
         * @param filter selector or fn
         */
        filter: function(selector, filter) {
            var elems = query(selector), match, tag, cls, ret = [];

            // 默认仅支持最简单的 tag.cls 形式
            if (S.isString(filter) && (match = REG_QUERY.exec(filter)) && !match[1]) {
                tag = match[2];
                cls = match[3];
                filter = function(elem) {
                    return !((tag && elem.tagName !== tag.toUpperCase()) || (cls && !DOM.hasClass(elem, cls)));
                }
            }

            if (S.isFunction(filter)) {
                ret = S.filter(elems, filter);
            }
            // 其它复杂 filter, 采用外部选择器
            else if (filter && S.ExternalSelector) {
                ret = S.ExternalSelector._filter(selector, filter + '');
            }
            // filter 为空或不支持的 selector
            else {
                error(filter);
            }

            return ret;
        },

        /**
         * Returns true if the passed element(s) match the passed filter
         */
        test: function(selector, filter) {
            var elems = query(selector);
            return elems.length && (DOM.filter(elems, filter).length === elems.length);
        }
    });
});

/**
 * NOTES:
 *
 * 2010.01
 *  - 对 reg exec 的结果(id, tag, className)做 cache, 发现对性能影响很小，去掉。
 *  - getElementById 使用频率最高，使用直达通道优化。
 *  - getElementsByClassName 性能优于 querySelectorAll, 但 IE 系列不支持。
 *  - instanceof 对性能有影响。
 *  - 内部方法的参数，比如 cls, context 等的异常情况，已经在 query 方法中有保证，无需冗余“防卫”。
 *  - query 方法中的条件判断考虑了“频率优先”原则。最有可能出现的情况放在前面。
 *  - Array 的 push 方法可以用 j++ 来替代，性能有提升。
 *  - 返回值策略和 Sizzle 一致，正常时，返回数组；其它所有情况，返回空数组。
 *
 *  - 从压缩角度考虑，还可以将 getElmentsByTagName 和 getElementsByClassName 定义为常量，
 *    不过感觉这样做太“压缩控”，还是保留不替换的好。
 *
 *  - 调整 getElementsByClassName 的降级写法，性能最差的放最后。
 *
 * 2010.02
 *  - 添加对分组选择器的支持（主要参考 Sizzle 的代码，代去除了对非 Grade A 级浏览器的支持）
 *
 * 2010.03
 *  - 基于原生 dom 的两个 api: S.query 返回数组; S.get 返回第一个。
 *    基于 Node 的 api: S.one, 在 Node 中实现。
 *    基于 NodeList 的 api: S.all, 在 NodeList 中实现。
 *    通过 api 的分层，同时满足初级用户和高级用户的需求。
 *
 * 2010.05
 *  - 去掉给 S.query 返回值默认添加的 each 方法，保持纯净。
 *  - 对于不支持的 selector, 采用外部耦合进来的 Selector.
 *
 * 2010.06
 *  - 增加 filter 和 test 方法
 *
 * 2010.07
 *  - 取消对 , 分组的支持，group 直接用 Sizzle
 *
 * 2010.08
 *  - 给 S.query 的结果 attach each 方法
 *
 * Bugs:
 *  - S.query('#test-data *') 等带 * 号的选择器，在 IE6 下返回的值不对。jQuery 等类库也有此 bug, 诡异。
 *
 * References:
 *  - http://ejohn.org/blog/selectors-that-people-actually-use/
 *  - http://ejohn.org/blog/thoughts-on-queryselectorall/
 *  - MDC: querySelector, querySelectorAll, getElementsByClassName
 *  - Sizzle: http://github.com/jeresig/sizzle
 *  - MINI: http://james.padolsey.com/javascript/mini/
 *  - Peppy: http://jamesdonaghue.com/?p=40
 *  - Sly: http://github.com/digitarald/sly
 *  - XPath, TreeWalker：http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
 *
 *  - http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
 *  - http://www.quirksmode.org/dom/getElementsByTagNames.html
 *  - http://ejohn.org/blog/comparing-document-position/
 *  - http://github.com/jeresig/sizzle/blob/master/sizzle.js
 */
/**
 * @module  dom-data
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-data', function(S, undefined) {

    var win = window,
        DOM = S.DOM,

        expando = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { },       // 存储 node 节点的 data
        winDataCache = { },    // 避免污染全局

        // The following elements throw uncatchable exceptions if you
        // attempt to add expando properties to them.
        noData = {
            EMBED: 1,
            OBJECT: 1,
            APPLET: 1
        };

    S.mix(DOM, {

        /**
         * Store arbitrary data associated with the matched elements.
         */
        data: function(selector, name, data) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.data(selector, k, name[k]);
                }
                return;
            }

            // getter
            if (data === undefined) {
                var elem = S.get(selector), isNode,
                    cache, key, thisCache;

                if (!elem || noData[elem.nodeName]) return;

                if (elem == win) elem = winDataCache;
                isNode = checkIsNode(elem);

                cache = isNode ? dataCache : elem;
                key = isNode ? elem[expando] : expando;
                thisCache = cache[key];

                if(S.isString(name) && thisCache) {
                    return thisCache[name];
                }
                return thisCache;
            }
            // setter
            else {
                S.query(selector).each(function(elem) {
                    if (!elem || noData[elem.nodeName]) return;
                    if (elem == win) elem = winDataCache;

                    var cache = dataCache, key;

                    if (!checkIsNode(elem)) {
                        key = expando;
                        cache = elem;
                    }
                    else if (!(key = elem[expando])) {
                        key = elem[expando] = S.guid();
                    }

                    if (name && data !== undefined) {
                        if (!cache[key]) cache[key] = { };
                        cache[key][name] = data;
                    }
                });
            }
        },

        /**
         * Remove a previously-stored piece of data.
         */
        removeData: function(selector, name) {
            S.query(selector).each(function(elem) {
                if (!elem) return;
                if (elem == win) elem = winDataCache;

                var key, cache = dataCache, thisCache,
                    isNode = checkIsNode(elem);

                if (!isNode) {
                    cache = elem;
                    key = expando;
                } else {
                    key = elem[expando];
                }

                if (!key) return;
                thisCache = cache[key];

                // If we want to remove a specific section of the element's data
                if (name) {
                    if (thisCache) {
                        delete thisCache[name];

                        // If we've removed all the data, remove the element's cache
                        if (S.isEmptyObject(thisCache)) {
                            DOM.removeData(elem);
                        }
                    }
                }
                // Otherwise, we want to remove all of the element's data
                else {
                    if (!isNode) {
                        try {
                            delete elem[expando];
                        } catch(ex) {
                        }
                    } else if (elem.removeAttribute) {
                        elem.removeAttribute(expando);
                    }

                    // Completely remove the data cache
                    if (isNode) {
                        delete cache[key];
                    }
                }
            });
        }
    });

    function checkIsNode(elem) {
        return elem && elem.nodeType;
    }

});
/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-class', function(S, undefined) {

    var SPACE = ' ',
        DOM = S.DOM,
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    S.mix(DOM, {

        /**
         * Determine whether any of the matched elements are assigned the given class.
         */
        hasClass: function(selector, value) {
            return batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    var className = SPACE + elemClass + SPACE, j = 0, ret = true;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            ret = false;
                            break;
                        }
                    }
                    if (ret) return true;
                }
            }, true);
        },

        /**
         * Adds the specified class(es) to each of the set of matched elements.
         */
        addClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (!elemClass) {
                    elem.className = value;
                }
                else {
                    var className = SPACE + elemClass + SPACE, setClass = elemClass, j = 0;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            setClass += SPACE + classNames[j];
                        }
                    }
                    elem.className = S.trim(setClass);
                }
            });
        },

        /**
         * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
         */
        removeClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    if (!cl) {
                        elem.className = '';
                    }
                    else {
                        var className = (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE), j = 0, needle;
                        for (; j < cl; j++) {
                            needle = SPACE + classNames[j] + SPACE;
                            // 一个 cls 有可能多次出现：'link link2 link link3 link'
                            while (className.indexOf(needle) >= 0) {
                                className = className.replace(needle, SPACE);
                            }
                        }
                        elem.className = S.trim(className);
                    }
                }
            });
        },

        /**
         * Replace a class with another class for matched elements.
         * If no oldClassName is present, the newClassName is simply added.
         */
        replaceClass: function(selector, oldClassName, newClassName) {
            DOM.removeClass(selector, oldClassName);
            DOM.addClass(selector, newClassName);
        },

        /**
         * Add or remove one or more classes from each element in the set of
         * matched elements, depending on either the class's presence or the
         * value of the switch argument.
         * @param state {Boolean} optional boolean to indicate whether class
         *        should be added or removed regardless of current state.
         */
        toggleClass: function(selector, value, state) {
            var isBool = S.isBoolean(state), has;

            batch(selector, value, function(elem, classNames, cl) {
                var j = 0, className;
                for (; j < cl; j++) {
                    className = classNames[j];
                    has = isBool ? !state : DOM.hasClass(elem, className);
                    DOM[has ? 'removeClass' : 'addClass'](elem, className);
                }
            });
        }
    });

    function batch(selector, value, fn, resultIsBool) {
        if (!(value = S.trim(value))) return resultIsBool ? false : undefined;

        var elems = S.query(selector),
            i = 0, len = elems.length,
            classNames = value.split(REG_SPLIT),
            elem, ret;

        for (; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) return ret;
            }
        }

        if (resultIsBool) return false;
    }
});

/**
 * NOTES:
 *   - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 *   - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */
/**
 * @module  dom-attr
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-attr', function(S, undefined) {

    var UA = S.UA,

        doc = document,
        docElement = doc.documentElement,
        oldIE = !docElement.hasAttribute,

        TEXT = docElement.textContent !== undefined ? 'textContent' : 'innerText',
        SELECT = 'select',
        EMPTY = '',
        CHECKED = 'checked',
        STYLE = 'style',

        DOM = S.DOM,
        isElementNode = DOM._isElementNode,
        isTextNode = function(elem) { return DOM._nodeTypeIs(elem, 3); },

        RE_SPECIAL_ATTRS = /^(?:href|src|style)/,
        RE_NORMALIZED_ATTRS = /^(?:href|src|colspan|rowspan)/,
        RE_RETURN = /\r/g,
        RE_RADIO_CHECK = /^(?:radio|checkbox)/,

        CUSTOM_ATTRS = {
            readonly: 'readOnly'
        },

        attrFn = {
            val: 1,
            css: 1,
            html: 1,
            text: 1,
            data: 1,
            width: 1,
            height: 1,
            offset: 1
        };

    if (oldIE) {
        S.mix(CUSTOM_ATTRS, {
            'for': 'htmlFor',
            'class': 'className'
        });
    }

    S.mix(DOM, {

        /**
         * Gets the value of an attribute for the first element in the set of matched elements or
         * Sets an attribute for the set of matched elements.
         */
        attr: function(selector, name, val, pass) {
            // suports hash
            if (S.isPlainObject(name)) {
                pass = val; // 塌缩参数
                for (var k in name) {
                    DOM.attr(selector, k, name[k], pass);
                }
                return;
            }

            if (!(name = S.trim(name))) return;
            name = name.toLowerCase();

            // attr functions
            if (pass && attrFn[name]) {
                return DOM[name](selector, val);
            }

            // custom attrs
            name = CUSTOM_ATTRS[name] || name;

            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only get attributes on element nodes
                if (!isElementNode(el)) {
                    return undefined;
                }

                var ret;

                // 优先用 el[name] 获取 mapping 属性值：
                //  - 可以正确获取 readonly, checked, selected 等特殊 mapping 属性值
                //  - 可以获取用 getAttribute 不一定能获取到的值，比如 tabindex 默认值
                //  - href, src 直接获取的是 normalized 后的值，排除掉
                //  - style 需要用 getAttribute 来获取字符串值，也排除掉
                if (!RE_SPECIAL_ATTRS.test(name)) {
                    ret = el[name];
                }

                // 用 getAttribute 获取非 mapping 属性和 href/src/style 的值：
                if (ret === undefined) {
                    ret = el.getAttribute(name);
                }

                // fix ie bugs
                if (oldIE) {
                    // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
                    if (RE_NORMALIZED_ATTRS.test(name)) {
                        ret = el.getAttribute(name, 2);
                    }
                    // 在标准浏览器下，用 getAttribute 获取 style 值
                    // IE7- 下，需要用 cssText 来获取
                    else if (name === STYLE) {
                        ret = el[STYLE].cssText;
                    }
                }

                // 对于不存在的属性，统一返回 undefined
                return ret === null ? undefined : ret;
            }

            // setter
            S.each(S.query(selector), function(el) {
                // only set attributes on element nodes
                if (!isElementNode(el)) {
                    return;
                }

                // 不需要加 oldIE 判断，否则 IE8 的 IE7 兼容模式有问题
                if (name === STYLE) {
                    el[STYLE].cssText = val;
                }
                else {
                    // checked 属性值，需要通过直接设置才能生效
                    if(name === CHECKED) {
                        el[name] = !!val;
                    }
                    // convert the value to a string (all browsers do this but IE)
                    el.setAttribute(name, EMPTY + val);
                }
            });
        },

        /**
         * Removes the attribute of the matched elements.
         */
        removeAttr: function(selector, name) {
            S.each(S.query(selector), function(el) {
                if (isElementNode(el)) {
                    DOM.attr(el, name, EMPTY); // 先置空
                    el.removeAttribute(name); // 再移除
                }
            });
        },

        /**
         * Gets the current value of the first element in the set of matched or
         * Sets the value of each element in the set of matched elements.
         */
        val: function(selector, value) {
            // getter
            if (value === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only gets value on element nodes
                if (!isElementNode(el)) {
                    return undefined;
                }

                // 当没有设定 value 时，标准浏览器 option.value === option.text
                // ie7- 下，没有设定 value 时，option.value === '', 需要用 el.attributes.value 来判断是否有设定 value
                if (nodeNameIs('option', el)) {
                    return (el.attributes.value || {}).specified ? el.value : el.text;
                }

                // 对于 select, 特别是 multiple type, 存在很严重的兼容性问题
                if (nodeNameIs(SELECT, el)) {
                    var index = el.selectedIndex,
                        options = el.options;

                    if (index < 0) {
                        return null;
                    }
                    else if (el.type === 'select-one') {
                        return DOM.val(options[index]);
                    }

                    // Loop through all the selected options
                    var ret = [], i = 0, len = options.length;
                    for (; i < len; ++i) {
                        if (options[i].selected) {
                            ret.push(DOM.val(options[i]));
                        }
                    }
                    // Multi-Selects return an array
                    return ret;
                }

                // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                if (UA.webkit && RE_RADIO_CHECK.test(el.type)) {
                    return el.getAttribute('value') === null ? 'on' : el.value;
                }

                // 普通元素的 value, 归一化掉 \r
                return (el.value || EMPTY).replace(RE_RETURN, EMPTY);
            }

            // setter
            S.each(S.query(selector), function(el) {
                if (nodeNameIs(SELECT, el)) {
                    // 强制转换数值为字符串，以保证下面的 inArray 正常工作
                    if (S.isNumber(value)) {
                        value += EMPTY;
                    }

                    var vals = S.makeArray(value),
                        opts = el.options, opt;

                    for (i = 0,len = opts.length; i < len; ++i) {
                        opt = opts[i];
                        opt.selected = S.inArray(DOM.val(opt), vals);
                    }

                    if (!vals.length) {
                        el.selectedIndex = -1;
                    }
                }
                else if (isElementNode(el)) {
                    el.value = value;
                }
            });
        },

        /**
         * Gets the text context of the first element in the set of matched elements or
         * Sets the text content of the matched elements.
         */
        text: function(selector, val) {
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only gets value on supported nodes
                if (isElementNode(el)) {
                    return el[TEXT] || EMPTY;
                }
                else if (isTextNode(el)) {
                    return el.nodeValue;
                }
            }
            // setter
            else {
                S.each(S.query(selector), function(el) {
                    if (isElementNode(el)) {
                        el[TEXT] = val;
                    }
                    else if (isTextNode(el)) {
                        el.nodeValue = val;
                    }
                });
            }
        }
    });

    // 判断 el 的 nodeName 是否指定值
    function nodeNameIs(val, el) {
        return el && el.nodeName.toUpperCase() === val.toUpperCase();
    }
});

/**
 * NOTES:
 *
 * 2010.03
 *  - 在 jquery/support.js 中，special attrs 里还有 maxlength, cellspacing,
 *    rowspan, colspan, useap, frameboder, 但测试发现，在 Grade-A 级浏览器中
 *    并无兼容性问题。
 *  - 当 colspan/rowspan 属性值设置有误时，ie7- 会自动纠正，和 href 一样，需要传递
 *    第 2 个参数来解决。jQuery 未考虑，存在兼容性 bug.
 *  - jQuery 考虑了未显式设定 tabindex 时引发的兼容问题，kissy 里忽略（太不常用了）
 *  - jquery/attributes.js: Safari mis-reports the default selected
 *    property of an option 在 Safari 4 中已修复。
 *
 */
/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-style', function(S, undefined) {

    var DOM = S.DOM, UA = S.UA,
        doc = document, docElem = doc.documentElement,
        STYLE = 'style', FLOAT = 'float',
        CSS_FLOAT = 'cssFloat', STYLE_FLOAT = 'styleFloat',
        WIDTH = 'width', HEIGHT = 'height',
        AUTO = 'auto',
        DISPLAY = 'display', NONE = 'none',
        PARSEINT = parseInt,
        RE_LT = /^(?:left|top)/,
        RE_NEED_UNIT = /^(?:width|height|top|left|right|bottom|margin|padding)/i,
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function(all, letter) {
            return letter.toUpperCase();
        },
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = { },
        defaultDisplay = { };

    S.mix(DOM, {

        _CUSTOM_STYLES: CUSTOM_STYLES,

        _getComputedStyle: function(elem, name) {
            var val = '', d = elem.ownerDocument;

            if (elem[STYLE]) {
                val = d.defaultView.getComputedStyle(elem, null)[name];
            }
            return val;
        },

        /**
         * Gets or sets styles on the matches elements.
         */
        css: function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.css(selector, k, name[k]);
                }
                return;
            }

            if (name.indexOf('-') > 0) {
                // webkit 认识 camel-case, 其它内核只认识 cameCase
                name = name.replace(RE_DASH, CAMELCASE_FN);
            }
            name = CUSTOM_STYLES[name] || name;

            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var elem = S.get(selector), ret = '';

                if (elem && elem[STYLE]) {
                    ret = name.get ? name.get(elem) : elem[STYLE][name];

                    // 有 get 的直接用自定义函数的返回值
                    if (ret === '' && !name.get) {
                        ret = fixComputedStyle(elem, name, DOM._getComputedStyle(elem, name));
                    }
                }

                return ret === undefined ? '' : ret;
            }
            // setter
            else {
                // normalize unsetting
                if (val === null || val === EMPTY) {
                    val = EMPTY;
                }
                // number values may need a unit
                else if (!isNaN(new Number(val)) && RE_NEED_UNIT.test(name)) {
                    val += DEFAULT_UNIT;
                }

                // ignore negative width and height values
                if ((name === WIDTH || name === HEIGHT) && parseFloat(val) < 0) {
                    return;
                }

                S.each(S.query(selector), function(elem) {
                    if (elem && elem[STYLE]) {
                        name.set ? name.set(elem, val) : (elem[STYLE][name] = val);
                        if (val === EMPTY) {
                            if (!elem[STYLE].cssText)
                                elem.removeAttribute(STYLE);
                        }
                    }
                });
            }
        },

        /**
         * Get the current computed width for the first element in the set of matched elements or
         * set the CSS width of each element in the set of matched elements.
         */
        width: function(selector, value) {
            // getter
            if (value === undefined) {
                return getWH(selector, WIDTH);
            }
            // setter
            else {
                DOM.css(selector, WIDTH, value);
            }
        },

        /**
         * Get the current computed height for the first element in the set of matched elements or
         * set the CSS height of each element in the set of matched elements.
         */
        height: function(selector, value) {
            // getter
            if (value === undefined) {
                return getWH(selector, HEIGHT);
            }
            // setter
            else {
                DOM.css(selector, HEIGHT, value);
            }
        },

        /**
         * Show the matched elements.
         */
        show: function(selector) {

            S.query(selector).each(function(elem) {
                if (!elem) return;

                elem.style[DISPLAY] = DOM.data(elem, DISPLAY) || EMPTY;

                // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                if (DOM.css(elem, DISPLAY) === NONE) {
                    var tagName = elem.tagName,
                        old = defaultDisplay[tagName], tmp;

                    if (!old) {
                        tmp = doc.createElement(tagName);
                        doc.body.appendChild(tmp);
                        old = DOM.css(tmp, DISPLAY);
                        DOM.remove(tmp);
                        defaultDisplay[tagName] = old;
                    }

                    DOM.data(elem, DISPLAY, old);
                    elem.style[DISPLAY] = old;
                }
            });
        },

        /**
         * Hide the matched elements.
         */
        hide: function(selector) {
            S.query(selector).each(function(elem) {
                if (!elem) return;

                var style = elem.style, old = style[DISPLAY];
                if (old !== NONE) {
                    if (old) {
                        DOM.data(elem, DISPLAY, old);
                    }
                    style[DISPLAY] = NONE;
                }
            });
        },

        /**
         * Display or hide the matched elements.
         */
        toggle: function(selector) {
            S.query(selector).each(function(elem) {
                if (elem) {
                    if (elem.style[DISPLAY] === NONE) {
                        DOM.show(elem);
                    } else {
                        DOM.hide(elem);
                    }
                }
            });
        },

        /**
         * Creates a stylesheet from a text blob of rules.
         * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
         * @param {String} cssText The text containing the css rules
         * @param {String} id An id to add to the stylesheet for later removal
         */
        addStyleSheet: function(cssText, id) {
            var elem;

            if (id && (id = id.replace('#', EMPTY))) elem = S.get('#' + id);
            if (elem) return; // 仅添加一次，不重复添加

            elem = DOM.create('<style>', { id: id });

            // 先添加到 DOM 树中，再给 cssText 赋值，否则 css hack 会失效
            S.get('head').appendChild(elem);

            if (elem.styleSheet) { // IE
                elem.styleSheet.cssText = cssText;
            } else { // W3C
                elem.appendChild(doc.createTextNode(cssText));
            }
        }
    });

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = CSS_FLOAT;
    }
    else if (docElem[STYLE][STYLE_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = STYLE_FLOAT;
    }

    function getWH(selector, name) {
        var elem = S.get(selector),
            which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        S.each(which, function(direction) {
            val -= parseFloat(DOM._getComputedStyle(elem, 'padding' + direction)) || 0;
            val -= parseFloat(DOM._getComputedStyle(elem, 'border' + direction + 'Width')) || 0;
        });

        return val;
    }

    // 修正 getComputedStyle 返回值的部分浏览器兼容性问题
    function fixComputedStyle(elem, name, val) {
        var offset, ret = val;

        // 1. 当没有设置 style.left 时，getComputedStyle 在不同浏览器下，返回值不同
        //    比如：firefox 返回 0, webkit/ie 返回 auto
        // 2. style.left 设置为百分比时，返回值为百分比
        // 对于第一种情况，如果是 relative 元素，值为 0. 如果是 absolute 元素，值为 offsetLeft - marginLeft
        // 对于第二种情况，大部分类库都未做处理，属于“明之而不 fix”的保留 bug
        if (val === AUTO && RE_LT.test(name)) {
            ret = 0;
            if (S.inArray(DOM.css(elem, 'position'), ['absolute','fixed'])) {
                offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                // ie8 下，elem.offsetLeft 包含 offsetParent 的 border 宽度，需要减掉
                // TODO: 改成特性探测
                if (UA.ie === 8 || UA.opera) {
                    offset -= PARSEINT(DOM.css(elem.offsetParent, 'border-' + name + '-width')) || 0;
                }

                ret = offset - (PARSEINT(DOM.css(elem, 'margin-' + name)) || 0);
            }
        }

        return ret;
    }

});

/**
 * NOTES:
 *  - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 *  - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。
 *
 *  - 非 webkit 下，jQuery.css paddingLeft 返回 style 值， padding-left 返回 computedStyle 值，
 *    返回的值不同。KISSY 做了统一，更符合预期。
 *
 *  - getComputedStyle 在 webkit 下，会舍弃小数部分，ie 下会四舍五入，gecko 下直接输出 float 值。
 *
 *  - color: blue 继承值，getComputedStyle, 在 ie 下返回 blue, opera 返回 #0000ff, 其它浏览器
 *    返回 rgb(0, 0, 255)
 *
 *  - border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - 总之：要使得返回值完全一致是不大可能的，jQuery/ExtJS/KISSY 未“追求完美”。YUI3 做了部分完美处理，但
 *    依旧存在浏览器差异。
 */
/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-style-ie', function(S, undefined) {

    // only for ie
    if (!S.UA.ie) return;

    var DOM = S.DOM,
        doc = document,
        docElem = doc.documentElement,
        OPACITY = 'opacity',
        FILTER = 'filter',
        FILTERS = 'filters',
        CURRENT_STYLE = 'currentStyle',
        RUNTIME_STYLE = 'runtimeStyle',
        LEFT = 'left',
        PX = 'px',
        CUSTOM_STYLES = DOM._CUSTOM_STYLES,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
	    RE_NUM = /^-?\d/,
        RE_WH = /^(?:width|height)$/;

    // use alpha filter for IE opacity
    try {
        if (docElem.style[OPACITY] === undefined && docElem[FILTERS]) {

            CUSTOM_STYLES[OPACITY] = {

                get: function(elem) {
                    var val = 100;

                    try { // will error if no DXImageTransform
                        val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                    }
                    catch(e) {
                        try {
                            val = elem[FILTERS]('alpha')[OPACITY];
                        } catch(ex) {
                            // 没有设置过 opacity 时会报错，这时返回 1 即可
                        }
                    }

                    // 和其他浏览器保持一致，转换为字符串类型
                    return val / 100 + '';
                },

                set: function(elem, val) {
                    var style = elem.style, currentFilter = (elem.currentStyle || 0).filter || '';

                    // IE has trouble with opacity if it does not have layout
                    // Force it by setting the zoom level
                    style.zoom = 1;

                    // keep existed filters, and remove opacity filter
                    if(currentFilter) {
                        currentFilter = currentFilter.replace(/alpha\(opacity=.+\)/ig, '');
                        if(currentFilter) currentFilter += ', ';
                    }

                    // Set the alpha filter to set the opacity
                    style[FILTER] = currentFilter + 'alpha(' + OPACITY + '=' + val * 100 + ')';
                }
            };
        }
    }
    catch(ex) {
        S.log('IE filters ActiveX is disabled. ex = ' + ex);
    }

    // getComputedStyle for IE
    if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

        DOM._getComputedStyle = function(elem, name) {
            var style = elem.style,
                ret = elem[CURRENT_STYLE][name];

            // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
            // 在 ie 下不对，需要直接用 offset 方式
            // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了
            if(RE_WH.test(name)) {
                ret = DOM[name](elem) + PX;
            }
            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            else if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                // Remember the original values
				var left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];

				// Put in the new values to get a computed value out
				elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
				style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
				ret = style['pixelLeft'] + PX;

				// Revert the changed values
				style[LEFT] = left;
				elem[RUNTIME_STYLE][LEFT] = rsLeft;
            }

            return ret;
        }
    }
});
/**
 * NOTES:
 *
 *  - opacity 的实现，还可以用 progid:DXImageTransform.Microsoft.BasicImage(opacity=.2) 来实现，但考虑
 *    主流类库都是用 DXImageTransform.Microsoft.Alpha 来实现的，为了保证多类库混合使用时不会出现问题，kissy 里
 *    依旧采用 Alpha 来实现。
 */
/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-offset', function(S, undefined) {

    var DOM = S.DOM, UA = S.UA,
        win = window, doc = document,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        isStrict = doc.compatMode === 'CSS1Compat',
        MAX = Math.max, PARSEINT = parseInt,
        POSITION = 'position', RELATIVE = 'relative',
        DOCUMENT = 'document', BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        OWNER_DOCUMENT = 'ownerDocument',
        VIEWPORT = 'viewport',
        SCROLL = 'scroll', CLIENT = 'client',
        LEFT = 'left', TOP = 'top',
        SCROLL_TO = 'scrollTo',
        SCROLL_LEFT = SCROLL + 'Left', SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM, {

        /**
         * Gets the current coordinates of the element, relative to the document.
         */
        offset: function(elem, val) {
            // ownerDocument 的判断可以保证 elem 没有游离在 document 之外（比如 fragment）
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return null;

            // getter
            if (val === undefined) {
                return getOffset(elem);
            }

            // setter
            setOffset(elem, val);
        },

        /**
         * Makes elem visible in the container
         * @refer http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
         *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
         *        http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView: function(elem, container, top, hscroll) {
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return;

            hscroll = hscroll === undefined ? true : !!hscroll;
            top = top === undefined ? true : !!top;

            // default current window, use native for scrollIntoView(elem, top)
            if (!container || container === win) {
                // 注意：
                // 1. Opera 不支持 top 参数
                // 2. 当 container 已经在视窗中时，也会重新定位
                return elem.scrollIntoView(top);
            }
            container = S.get(container);

            // document 归一化到 window
            if (nodeTypeIs(container, 9)) {
                container = getWin(container);
            }

            var isWin = container && (SCROLL_TO in container) && container[DOCUMENT],
                elemOffset = DOM.offset(elem),
                containerOffset = isWin ? {
                    left: DOM.scrollLeft(container),
                    top: DOM.scrollTop(container) }
                    : DOM.offset(container),

                // elem 相对 container 视窗的坐标
                diff = {
                    left: elemOffset[LEFT] - containerOffset[LEFT],
                    top: elemOffset[TOP] - containerOffset[TOP]
                },

                // container 视窗的高宽
                ch = isWin ? DOM['viewportHeight'](container) : container.clientHeight,
                cw = isWin ? DOM['viewportWidth'](container) : container.clientWidth,

                // container 视窗相对 container 元素的坐标
                cl = DOM[SCROLL_LEFT](container),
                ct = DOM[SCROLL_TOP](container),
                cr = cl + cw,
                cb = ct + ch,

                // elem 的高宽
                eh = elem.offsetHeight,
                ew = elem.offsetWidth,

                // elem 相对 container 元素的坐标
                // 注：diff.left 含 border, cl 也含 border, 因此要减去一个
                l = diff.left + cl - (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                t = diff.top + ct - (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0),
                r = l + ew,
                b = t + eh,

                t2, l2;

            // 根据情况将 elem 定位到 container 视窗中
            // 1. 当 eh > ch 时，优先显示 elem 的顶部，对用户来说，这样更合理
            // 2. 当 t < ct 时，elem 在 container 视窗上方，优先顶部对齐
            // 3. 当 b > cb 时，elem 在 container 视窗下方，优先底部对齐
            // 4. 其它情况下，elem 已经在 container 视窗中，无需任何操作
            if (eh > ch || t < ct || top) {
                t2 = t;
            } else if (b > cb) {
                t2 = b - ch;
            }

            // 水平方向与上面同理
            if (hscroll) {
                if (ew > cw || l < cl || top) {
                    l2 = l;
                } else if (r > cr) {
                    l2 = r - cw;
                }
            }

            // go
            if (isWin) {
                if (t2 !== undefined || l2 !== undefined) {
                    container[SCROLL_TO](l2, t2);
                }
            } else {
                if (t2 !== undefined) {
                    container[SCROLL_TOP] = t2;
                }
                if (l2 !== undefined) {
                    container[SCROLL_LEFT] = l2;
                }
            }
        }
    });

    // add ScrollLeft/ScrollTop getter methods
    S.each(['Left', 'Top'], function(name, i) {
        var method = SCROLL + name;

        DOM[method] = function(elem) {
            var ret = 0, w = getWin(elem), d;

            if (w && (d = w[DOCUMENT])) {
                ret = w[i ? 'pageYOffset' : 'pageXOffset']
                    || d[DOC_ELEMENT][method]
                    || d[BODY][method]
            }
            else if (isElementNode((elem = S.get(elem)))) {
                ret = elem[method];
            }
            return ret;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function(name) {
        DOM['doc' + name] = function(refDoc) {
            var d = refDoc || doc;
            return MAX(isStrict ? d[DOC_ELEMENT][SCROLL + name] : d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + name] = function(refWin) {
            var prop = 'inner' + name,
                w = getWin(refWin),
                d = w[DOCUMENT];
            return (prop in w) ? w[prop] :
                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
        }
    });

    // 获取 elem 相对 elem.ownerDocument 的坐标
    function getOffset(elem) {
        var box, x = 0, y = 0,
            w = getWin(elem[OWNER_DOCUMENT]);

        // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
            // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
            // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

            x = box[LEFT];
            y = box[TOP];

            // iphone/ipad/itouch 下的 Safari 获取 getBoundingClientRect 时，已经加入 scrollTop
            if (UA.mobile !== 'apple') {
                x += DOM[SCROLL_LEFT](w);
                y += DOM[SCROLL_TOP](w);
            }
        }

        return { left: x, top: y };
    }

    // 设置 elem 相对 elem.ownerDocument 的坐标
    function setOffset(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (DOM.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = RELATIVE;
        }
        var old = getOffset(elem), ret = { }, current, key;

        for (key in offset) {
            current = PARSEINT(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }
});

/**
 * TODO:
 *  - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 *  - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 */
/**
 * @module  dom-traversal
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-traversal', function(S, undefined) {

    var DOM = S.DOM,
        isElementNode = DOM._isElementNode;

    S.mix(DOM, {

        /**
         * Gets the parent node of the first matched element.
         */
        parent: function(selector, filter) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != 11;
            });
        },

        /**
         * Gets the following sibling of the first matched element.
         */
        next: function(selector, filter) {
            return nth(selector, filter, 'nextSibling');
        },

        /**
         * Gets the preceding sibling of the first matched element.
         */
        prev: function(selector, filter) {
            return nth(selector, filter, 'previousSibling');
        },

        /**
         * Gets the siblings of the first matched element.
         */
        siblings: function(selector, filter) {
            return getSiblings(selector, filter, true);
        },

        /**
         * Gets the children of the first matched element.
         */
        children: function(selector, filter) {
            return getSiblings(selector, filter);
        },

        /**
         * Check to see if a DOM node is within another DOM node.
         */
        contains: function(container, contained) {
            var ret = false;

            if ((container = S.get(container)) && (contained = S.get(contained))) {
                if (container.contains) {
                    if (contained.nodeType === 3) {
                        contained = contained.parentNode;
                        if (contained === container) return true;
                    }
                    if (contained) {
                        return container.contains(contained);
                    }
                }
                else if (container.compareDocumentPosition) {
                    return !!(container.compareDocumentPosition(contained) & 16);
                }
                else {
                    while (!ret && (contained = contained.parentNode)) {
                        ret = contained == container;
                    }
                }
            }

            return ret;
        }
    });

    // 获取元素 elem 在 direction 方向上满足 filter 的第一个元素
    // filter 可为 number, selector, fn
    // direction 可为 parentNode, nextSibling, previousSibling
    function nth(elem, filter, direction, extraFilter) {
        if (!(elem = S.get(elem))) return null;
        if (filter === undefined) filter = 1; // 默认取 1
        var ret = null, fi, flen;

        if (S.isNumber(filter) && filter >= 0) {
            if (filter === 0) return elem;
            fi = 0;
            flen = filter;
            filter = function() {
                return ++fi === flen;
            };
        }

        while ((elem = elem[direction])) {
            if (isElementNode(elem) && (!filter || DOM.test(elem, filter)) && (!extraFilter || extraFilter(elem))) {
                ret = elem;
                break;
            }
        }

        return ret;
    }

    // 获取元素 elem 的 siblings, 不包括自身
    function getSiblings(selector, filter, parent) {
        var ret = [], elem = S.get(selector), j, parentNode = elem, next;
        if (elem && parent) parentNode = elem.parentNode;

        if (parentNode) {
            for (j = 0,next = parentNode.firstChild; next; next = next.nextSibling) {
                if (isElementNode(next) && next !== elem && (!filter || DOM.test(next, filter))) {
                    ret[j++] = next;
                }
            }
        }

        return ret;
    }

});

/**
 * NOTES:
 *
 *  - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是
 *    遵循 8/2 原则，用尽可能少的代码满足用户最常用的功能。
 *
 */
/**
 * @module  dom-create
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-create', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, UA = S.UA, ie = UA.ie,

        nodeTypeIs = DOM._nodeTypeIs,
        isElementNode = DOM._isElementNode,
        isKSNode = DOM._isKSNode,
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc.createElement(DIV),

        RE_TAG = /<(\w+)/,
        // Ref: http://jmrware.com/articles/2010/jqueryregex/jQueryRegexes.html#note_05
        RE_SCRIPT = /<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig,
        RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
        RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
        RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i;

    S.mix(DOM, {

        /**
         * Creates a new HTMLElement using the provided html string.
         */
        create: function(html, props, ownerDoc) {
            if (nodeTypeIs(html, 1) || nodeTypeIs(html, 3)) return cloneNode(html);
            if (isKSNode(html)) return cloneNode(html[0]);
            if (!(html = S.trim(html))) return null;

            var ret = null, creators = DOM._creators,
                m, tag = DIV, k, nodes;

            // 简单 tag, 比如 DOM.create('<p>')
            if ((m = RE_SIMPLE_TAG.exec(html))) {
                ret = (ownerDoc || doc).createElement(m[1]);
            }
            // 复杂情况，比如 DOM.create('<img src="sprite.png" />')
            else {
                if ((m = RE_TAG.exec(html)) && (k = m[1]) && S.isFunction(creators[(k = k.toLowerCase())])) {
                    tag = k;
                }

                nodes = creators[tag](html, ownerDoc).childNodes;

                if (nodes.length === 1) {
                    // return single node, breaking parentNode ref from "fragment"
                    ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                }
                else {
                    // return multiple nodes as a fragment
                    ret = nl2frag(nodes, ownerDoc || doc);
                }
            }

            return attachProps(ret, props);
        },

        _creators: {
            div: function(html, ownerDoc) {
                var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                frag.innerHTML = html;
                return frag;
            }
        },

        /**
         * Gets/Sets the HTML contents of the HTMLElement.
         * @param {Boolean} loadScripts (optional) True to look for and process scripts (defaults to false).
         * @param {Function} callback (optional) For async script loading you can be notified when the update completes.
         */
        html: function(selector, val, loadScripts, callback) {
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only gets value on element nodes
                if (isElementNode(el)) {
                    return el.innerHTML;
                }
            }
            // setter
            else {
                S.each(S.query(selector), function(elem) {
                    if (isElementNode(elem)) {
                        setHTML(elem, val, loadScripts, callback);
                    }
                });
            }
        },

        /**
         * Remove the set of matched elements from the DOM.
         */
        remove: function(selector) {
            S.each(S.query(selector), function(el) {
                if (isElementNode(el) && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        }
    });

    // 添加成员到元素中
    function attachProps(elem, props) {
        if (isElementNode(elem) && S.isPlainObject(props)) {
            DOM.attr(elem, props, true);
        }
        return elem;
    }

    // 将 nodeList 转换为 fragment
    function nl2frag(nodes, ownerDoc) {
        var ret = null, i, len;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = ownerDoc || nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();

            if (nodes.item) { // convert live list to static array
                nodes = S.makeArray(nodes);
            }

            for (i = 0,len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        }
        else {
            S.log('Unable to convert ' + nodes + ' to fragment.');
        }

        return ret;
    }

    function cloneNode(elem) {
        var ret = elem.cloneNode(true);
        /**
         * if this is MSIE 6/7, then we need to copy the innerHTML to
         * fix a bug related to some form field elements
         */
        if (UA.ie < 8) ret.innerHTML = elem.innerHTML;
        return ret;
    }

    /**
     * Update the innerHTML of this element, optionally searching for and processing scripts.
     * @refer http://www.sencha.com/deploy/dev/docs/source/Element-more.html#method-Ext.Element-update
     *        http://lifesinger.googlecode.com/svn/trunk/lab/2010/innerhtml-and-script-tags.html
     */
    function setHTML(elem, html, loadScripts, callback) {
        if (!loadScripts) {
            setHTMLSimple(elem, html);
            S.isFunction(callback) && callback();
            return;
        }

        var id = S.guid('ks-tmp-'),
            re_script = new RegExp(RE_SCRIPT); // 防止

        html += '<span id="' + id + '"></span>';

        // 确保脚本执行时，相关联的 DOM 元素已经准备好
        S.available(id, function() {
            var hd = S.get('head'),
                match, attrs, srcMatch, charsetMatch,
                t, s, text;

            re_script.lastIndex = 0;
            while ((match = re_script.exec(html))) {
                attrs = match[1];
                srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
                // script via src
                if (srcMatch && srcMatch[2]) {
                    s = doc.createElement('script');
                    s.src = srcMatch[2];
                    // set charset
                    if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
                        s.charset = charsetMatch[2];
                    }
                    s.async = true; // make sure async in gecko
                    hd.appendChild(s);
                }
                // inline script
                else if ((text = match[2]) && text.length > 0) {
                    S.globalEval(text);
                }
            }

            // 删除探测节点
            (t = doc.getElementById(id)) && DOM.remove(t);

            // 回调
            S.isFunction(callback) && callback();
        });

        setHTMLSimple(elem, html);
    }

    // 直接通过 innerHTML 设置 html
    function setHTMLSimple(elem, html) {
        html = (html + '').replace(RE_SCRIPT, ''); // 过滤掉所有 script
        try {
            //if(UA.ie) {
            elem.innerHTML = html;
            //} else {
            // Ref:
            //  - http://blog.stevenlevithan.com/archives/faster-than-innerhtml
            //  - http://fins.javaeye.com/blog/183373
            //var tEl = elem.cloneNode(false);
            //tEl.innerHTML = html;
            //elem.parentNode.replaceChild(elem, tEl);
            // 注：上面的方式会丢失掉 elem 上注册的事件，放类库里不妥当
            //}
        }
            // table.innerHTML = html will throw error in ie.
        catch(ex) {
            // remove any remaining nodes
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
            // html == '' 时，无需再 appendChild
            if (html) elem.appendChild(DOM.create(html));
        }
    }

    // only for gecko and ie
    // 2010-10-22: 发现 chrome 也与 gecko 的处理一致了
    if (ie || UA.gecko || UA.webkit) {
        // 定义 creators, 处理浏览器兼容
        var creators = DOM._creators,
            create = DOM.create,
            TABLE_OPEN = '<table>',
            TABLE_CLOSE = '</table>',
            RE_TBODY = /(?:\/(?:thead|tfoot|caption|col|colgroup)>)+\s*<tbody/,
            creatorsMap = {
                option: 'select',
                td: 'tr',
                tr: 'tbody',
                tbody: 'table',
                col: 'colgroup',
                legend: 'fieldset' // ie 支持，但 gecko 不支持
            };

        for (var p in creatorsMap) {
            (function(tag) {
                creators[p] = function(html, ownerDoc) {
                    return create('<' + tag + '>' + html + '</' + tag + '>', null, ownerDoc);
                }
            })(creatorsMap[p]);
        }

        if (ie) {
            // IE 下不能单独添加 script 元素
            creators.script = function(html, ownerDoc) {
                var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                frag.innerHTML = '-' + html;
                frag.removeChild(frag.firstChild);
                return frag;
            };

            // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
            if (ie < 8) {
                creators.tbody = function(html, ownerDoc) {
                    var frag = create(TABLE_OPEN + html + TABLE_CLOSE, null, ownerDoc),
                        tbody = frag.children['tags']('tbody')[0];

                    if (frag.children.length > 1 && tbody && !RE_TBODY.test(html)) {
                        tbody[PARENT_NODE].removeChild(tbody); // strip extraneous tbody
                    }
                    return frag;
                };
            }
        }

        S.mix(creators, {
            optgroup: creators.option, // gecko 支持，但 ie 不支持
            th: creators.td,
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody
        });
    }
});

/**
 * TODO:
 *  - 研究 jQuery 的 buildFragment 和 clean
 *  - 增加 cache, 完善 test cases
 *  - 支持更多 props
 *  - remove 时，是否需要移除事件，以避免内存泄漏？需要详细的测试。
 */
/**
 * @module  dom-insertion
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-insertion', function(S) {

    var DOM = S.DOM,
        PARENT_NODE = 'parentNode',
        NEXT_SIBLING = 'nextSibling';

    S.mix(DOM, {

        /**
         * Inserts the new node as the previous sibling of the reference node.
         * @return {HTMLElement} The node that was inserted (or null if insert fails)
         */
        insertBefore: function(newNode, refNode) {
            if ((newNode = S.get(newNode)) && (refNode = S.get(refNode)) && refNode[PARENT_NODE]) {
                refNode[PARENT_NODE].insertBefore(newNode, refNode);
            }
            return newNode;
        },
        
        /**
         * Inserts the new node as the next sibling of the reference node.
         * @return {HTMLElement} The node that was inserted (or null if insert fails)
         */
        insertAfter: function(newNode, refNode) {
            if ((newNode = S.get(newNode)) && (refNode = S.get(refNode)) && refNode[PARENT_NODE]) {
                if (refNode[NEXT_SIBLING]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                } else {
                    refNode[PARENT_NODE].appendChild(newNode);
                }
            }
            return newNode;
        },

        /**
         * Inserts the new node as the last child.
         */
        append: function(node, parent) {
            if ((node = S.get(node)) && (parent = S.get(parent))) {
                if (parent.appendChild) {
                    parent.appendChild(node);
                }
            }
        },

        /**
         * Inserts the new node as the first child.
         */
        prepend: function(node, parent) {
            if ((node = S.get(node)) && (parent = S.get(parent))) {
                if (parent.firstChild) {
                    DOM.insertBefore(node, parent.firstChild);
                } else {
                    parent.appendChild(node);
                }
            }
        }
    });
});

/**
 * NOTES:
 *  - appendChild/removeChild/replaceChild 直接用原生的
 *  - append/appendTo, prepend/prependTo, wrap/unwrap 放在 Node 里
 *
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  event
 * @author  lifesinger@gmail.com
 */
KISSY.add('event', function(S, undef) {

    var doc = document,
        DOM = S.DOM,
        simpleAdd = doc.addEventListener ?
            function(el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function(el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            },
        EVENT_GUID = 'ksEventTargetId',
        SPACE = ' ',
        guid = S.now(),
        // { id: { target: el, events: { type: { handle: obj, listeners: [...] } } }, ... }
        cache = { };

    var Event = {

        EVENT_GUID: EVENT_GUID,

        // such as: { 'mouseenter' : { fix: 'mouseover', handle: fn } }
        special: { },

        /**
         * Adds an event listener.
         * @param target {Element} An element or custom EventTarget to assign the listener to.
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        add: function(target, type, fn, scope /* optional */) {
            if (batch('add', target, type, fn, scope)) return;

            var id = getID(target), isNativeEventTarget,
                special, events, eventHandle, fixedType, capture;

            // 不是有效的 target 或 参数不对
            if (id === -1 || !type || !S.isFunction(fn)) return;

            // 还没有添加过任何事件
            if (!id) {
                setID(target, (id = guid++));
                cache[id] = {
                    target: target,
                    events: { }
                };
            }

            // 没有添加过该类型事件
            events = cache[id].events;
            if (!events[type]) {
                isNativeEventTarget = !target.isCustomEventTarget;
                special = ((isNativeEventTarget || target._supportSpecialEvent) && Event.special[type]) || { };

                eventHandle = function(event, eventData) {
                    if (!event || !event.fixed) {
                        event = new S.EventObject(target, event, type);
                    }
                    if (S.isPlainObject(eventData)) {
                        S.mix(event, eventData);
                    }
                    if (special['setup']) {
                        special['setup'](event);
                    }
                    return (special.handle || Event._handle)(target, event, events[type].listeners);
                };

                events[type] = {
                    handle: eventHandle,
                    listeners: []
                };

                fixedType = special.fix || type;
                capture = special['capture'];
                if (isNativeEventTarget) {
                    simpleAdd(target, fixedType, eventHandle, capture);
                } else if (target._addEvent) { // such as Node
                    target._addEvent(fixedType, eventHandle, capture);
                }
            }

            // 增加 listener
            events[type].listeners.push({fn: fn, scope: scope || target});
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(target, type /* optional */, fn /* optional */, scope /* optional */) {
            if (batch('remove', target, type, fn, scope)) return;

            var id = getID(target),
                events, eventsType, listeners,
                i, j, len, c, t, special;

            if (id === -1) return; // 不是有效的 target
            if (!id || !(c = cache[id])) return; // 无 cache
            if (c.target !== target) return; // target 不匹配
            scope = scope || target;
            events = c.events || { };

            if ((eventsType = events[type])) {
                listeners = eventsType.listeners;
                len = listeners.length;

                // 移除 fn
                if (S.isFunction(fn) && len) {
                    for (i = 0,j = 0,t = []; i < len; ++i) {
                        if (fn !== listeners[i].fn
                            || scope !== listeners[i].scope) {
                            t[j++] = listeners[i];
                        }
                    }
                    eventsType.listeners = t;
                    len = t.length;
                }

                // remove(el, type) or fn 已移除光
                if (fn === undef || len === 0) {
                    if (!target.isCustomEventTarget) {
                        special = Event.special[type] || { };
                        simpleRemove(target, special.fix || type, eventsType.handle);
                    }
                    else if (target._removeEvent) { // such as Node
                        target._removeEvent(type, eventsType.handle);
                    }
                    delete events[type];
                }
            }

            // remove(el) or type 已移除光
            if (type === undef || S.isEmptyObject(events)) {
                for (type in events) {
                    Event.remove(target, type);
                }
                delete cache[id];
                removeID(target);
            }
        },

        _handle: function(target, event, listeners) {
            /* As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.*/
            listeners = listeners.slice(0);

            var ret, i = 0, len = listeners.length, listener;

            for (; i < len; ++i) {
                listener = listeners[i];
                ret = listener.fn.call(listener.scope, event);

                // 和 jQuery 逻辑保持一致
                // return false 等价 preventDefault + stopProgation
                if (ret !== undef) {
                    event.result = ret;
                    if (ret === false) {
                        event.halt();
                    }
                }
                if (event.isImmediatePropagationStopped) {
                    break;
                }
            }

            return ret;
        },

        _getCache: function(id) {
            return cache[id];
        },

        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;

    function batch(methodName, targets, types, fn, scope) {
        // on('#id tag.className', type, fn)
        if (S.isString(targets)) {
            targets = S.query(targets);
        }

        // on([targetA, targetB], type, fn)
        if (S.isArray(targets)) {
            S.each(targets, function(target) {
                Event[methodName](target, types, fn, scope);
            });
            return true;
        }

        // on(target, 'click focus', fn)
        if ((types = S.trim(types)) && types.indexOf(SPACE) > 0) {
            S.each(types.split(SPACE), function(type) {
                Event[methodName](targets, type, fn, scope);
            });
            return true;
        }

        // unpack nodelist
        if (targets.getDOMNodes) {
            for (var i = 0; i < targets.length; i++) {
                Event[methodName](targets.item(i), types, fn, scope);
            }
            return true;
        }
    }

    function getID(target) {
        return isValidTarget(target) ? DOM.data(target, EVENT_GUID) : -1;
    }

    function setID(target, id) {
        if (isValidTarget(target)) {
            DOM.data(target, EVENT_GUID, id);
        }
    }

    function removeID(target) {
        DOM.removeData(target, EVENT_GUID);
    }

    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target && target.nodeType !== 3 && target.nodeType !== 8;
    }

    S.Event = Event;
});

/**
 * TODO:
 *   - event || window.event, 什么情况下取 window.event ? IE4 ?
 *   - 更详尽细致的 test cases
 *   - 内存泄漏测试
 *   - target 为 window, iframe 等特殊对象时的 test case
 *   - special events 的 teardown 方法缺失，需要做特殊处理
 */
/**
 * @module  EventObject
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-object', function(S, undefined) {

    var doc = document,
        props = 'altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which'.split(' ');

    /**
     * KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.currentTarget = currentTarget;
        self.originalEvent = domEvent || { };

        if (domEvent) { // html element
            self.type = domEvent.type;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }

        // 让 custom 的 ev.target 指向包装过后的对象，比如 Node
        if (currentTarget.isCustomEventTarget) {
            if (S.DOM._isKSNode(currentTarget)) self.target = new S.Node(self.target);
        }

        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = true;
    }

    S.augment(EventObject, {

        _fix: function() {
            var self = this,
                originalEvent = self.originalEvent,
                l = props.length, prop,
                ct = self.currentTarget,
                ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe

            // clone properties of the original event object
            while (l) {
                prop = props[--l];
                self[prop] = originalEvent[prop];
            }

            // fix target property, if necessary
            if (!self.target) {
                self.target = self.srcElement || doc; // srcElement might not be defined either
            }

            // check if target is a textnode (safari)
            if (self.target.nodeType === 3) {
                self.target = self.target.parentNode;
            }

            // add relatedTarget, if necessary
            if (!self.relatedTarget && self.fromElement) {
                self.relatedTarget = (self.fromElement === self.target) ? self.toElement : self.fromElement;
            }

            // calculate pageX/Y if missing and clientX/Y available
            if (self.pageX === undefined && self.clientX !== undefined) {
                var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
                self.pageX = self.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
                self.pageY = self.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
            }

            // add which for key events
            if (self.which === undefined) {
                self.which = (self.charCode !== undefined) ? self.charCode : self.keyCode;
            }

            // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if (self.metaKey === undefined) {
                self.metaKey = self.ctrlKey;
            }

            // add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!self.which && self.button !== undefined) {
                self.which = (self.button & 1 ? 1 : (self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0)));
            }
        },

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function() {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to false (IE)
            else {
                e.returnValue = false;
            }

            this.isDefaultPrevented = true;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function() {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            else {
                e.cancelBubble = true;
            }

            this.isPropagationStopped = true;
        },

        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being exectued
         * on the current target.
         */
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.isImmediatePropagationStopped = true;
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param immediate {boolean} if true additional listeners
         * on the current target will not be executed
         */
        halt: function(immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.preventDefault();
        }
    });

    S.EventObject = EventObject;

});

/**
 * NOTES:
 *
 *  2010.04
 *   - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
 *
 * TODO:
 *   - pageX, clientX, scrollLeft, clientLeft 的详细测试
 */
/**
 * @module  EventTarget
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-target', function(S, undefined) {

    var Event = S.Event;

    /**
     * EventTarget provides the implementation for any object to publish,
     * subscribe and fire to custom events.
     */
    S.EventTarget = {

        isCustomEventTarget: true,

        fire: function(type, eventData) {
            var id = S.DOM.data(this, Event.EVENT_GUID) || -1,
                cache = Event._getCache(id) || { },
                events = cache.events || { },
                t = events[type];

            if(t && S.isFunction(t.handle)) {
                return t.handle(undefined, eventData);
            }

            return this; // chain
        },

        on: function(type, fn, scope) {
            Event.add(this, type, fn, scope);
            return this; // chain
        },

        detach: function(type, fn, scope) {
            Event.remove(this, type, fn, scope);
            return this; // chain
        }
    };
});

/**
 * NOTES:
 *
 *  2010.04
 *   - 初始设想 api: publish, fire, on, detach. 实际实现时发现，publish 不是必须
 *     的，on 时能自动 publish. api 简化为：触发/订阅/反订阅
 *
 *   - detach 命名是因为 removeEventListener 太长，remove 则太容易冲突
 */
/**
 * @module  event-mouseenter
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-mouseenter', function(S) {

    var Event = S.Event;

    if (!S.UA.ie) {
        S.each([
            { name: 'mouseenter', fix: 'mouseover' },
            { name: 'mouseleave', fix: 'mouseout' }
        ], function(o) {

            Event.special[o.name] = {

                fix: o.fix,

                setup: function(event) {
                    event.type = o.name;
                },

                handle: function(el, event, listeners) {
                    // 保证 el 为原生 DOMNode
                    if(S.DOM._isKSNode(el)) {
                        el = el[0];
                    }
                    
                    // Check if mouse(over|out) are still within the same parent element
                    var parent = event.relatedTarget;

                    // Firefox sometimes assigns relatedTarget a XUL element
                    // which we cannot access the parentNode property of
                    try {
                        // Traverse up the tree
                        while (parent && parent !== el) {
                            parent = parent.parentNode;
                        }

                        if (parent !== el) {
                            // handle event if we actually just moused on to a non sub-element
                            Event._handle(el, event, listeners);
                        }
                    } catch(e) {
                        S.log(e);
                    }
                }
            }
        });
    }
});

/**
 * TODO:
 *  - ie6 下，原生的 mouseenter/leave 貌似也有 bug, 比如 <div><div /><div /><div /></div>
 *    jQuery 也异常，需要进一步研究
 */
/**
 * @module  event-focusin
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-focusin', function(S) {

    var Event = S.Event;

    // 让非 IE 浏览器支持 focusin/focusout
    if (document.addEventListener) {
        S.each([
            { name: 'focusin', fix: 'focus' },
            { name: 'focusout', fix: 'blur' }
        ], function(o) {

            Event.special[o.name] = {

                fix: o.fix,

                capture: true,

                setup: function(event) {
                    event.type = o.name;
                }
            }
        });
    }
});

/**
 * NOTES:
 *  - webkit 和 opera 已支持 DOMFocusIn/DOMFocusOut 事件，但上面的写法已经能达到预期效果，暂时不考虑原生支持。
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  node
 * @author  lifesinger@gmail.com
 */
KISSY.add('node', function(S) {

    var DOM = S.DOM;

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props, ownerDocument) {
        var self = this, domNode;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(html, props, ownerDocument);
        }

        // handle Node(''), Node(null), or Node(undefined)
        if (!html) {
            self.length = 0;
            return;
        }

        // create from html
        if (S.isString(html)) {
            domNode = DOM.create(html, props, ownerDocument);
            // 将 S.Node('<p>1</p><p>2</p>') 转换为 NodeList
            if(domNode.nodeType === 11) { // fragment
                return new S.NodeList(domNode.childNodes);
            }
        }
        // handle Node
        else if(html instanceof Node) {
            return html;
        }
        // node, document, window 等等，由使用者保证正确性
        else {
            domNode = html;
        }

        self[0] = domNode;
    }

    Node.TYPE = '-ks-Node';

    S.augment(Node, {

        /**
         * 长度为 1
         */
        length: 1,

        /**
         * Retrieves the DOMNode.
         */
        getDOMNode: function() {
            return this[0];
        },

        nodeType: Node.TYPE
    });

    // query api
    S.one = function(selector, context) {
        var elem = S.get(selector, context);
        return elem ? new Node(elem) : null;
    };

    S.Node = Node;
});
/**
 * @module  nodelist
 * @author  lifesinger@gmail.com
 */
KISSY.add('nodelist', function(S) {

    var DOM = S.DOM,
        AP = Array.prototype,
        isElementNode = DOM._isElementNode;

    /**
     * The NodeList class provides a wrapper for manipulating DOM NodeList.
     */
    function NodeList(domNodes) {
        // factory or constructor
        if (!(this instanceof NodeList)) {
            return new NodeList(domNodes);
        }

        // push nodes
        AP.push.apply(this, S.makeArray(domNodes) || []);
    }

    S.mix(NodeList.prototype, {

        /**
         * 默认长度为 0
         */
        length: 0,

        /**
         * 根据 index 或 DOMElement 获取对应的 KSNode
         */
        item: function(index) {
            var ret = null, i, len;

            // 找到 DOMElement 对应的 index
            if (isElementNode(index)) {
                for (i = 0, len = this.length; i < len; i++) {
                    if (index === this[i]) {
                        index = i;
                        break;
                    }
                }
            }

            // 转换为 KSNode
            if(isElementNode(this[index])) {
                ret = new S.Node(this[index]);
            }

            return ret;
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes: function() {
            return AP.slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param fn The function to apply. It receives 3 arguments: the current node instance, the node's index, and the NodeList instance
         * @param context An optional context to apply the function with Default context is the current Node instance
         */
        each: function(fn, context) {
            var len = this.length, i = 0, node;

            for (node = new S.Node(this[0]);
                 i < len && fn.call(context || node, node, i, this) !== false; node = new S.Node(this[++i])) {
            }

            return this;
        }
    });

    // query api
    S.all = function(selector, context) {
        return new NodeList(S.query(selector, context, true));
    };

    S.NodeList = NodeList;
});

/**
 * Notes:
 *
 *  2010.04
 *   - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 *     但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 *     性能，以易用为首。
 *   - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 *   - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 *     直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 nodelist 里。可
 *     以说，技术成本会制约 api 设计。
 */
/**
 * @module  node-attach
 * @author  lifesinger@gmail.com
 */
KISSY.add('node-attach', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        nodeTypeIs = DOM._nodeTypeIs,
        isKSNode = DOM._isKSNode,
        NP = S.Node.prototype,
        NLP = S.NodeList.prototype,
        GET_DOM_NODE = 'getDOMNode',
        GET_DOM_NODES = GET_DOM_NODE + 's',
        HAS_NAME = 1,
        ONLY_VAL = 2,
        ALWAYS_NODE = 4;

    function normalGetterSetter(isNodeList, args, valIndex, fn) {
        var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
            args2 = [elems].concat(S.makeArray(args));

        if (args[valIndex] === undefined) {
            return fn.apply(DOM, args2);
        } else {
            fn.apply(DOM, args2);
            return this;
        }
    }

    function attach(methodNames, type) {
        S.each(methodNames, function(methodName) {
            S.each([NP, NLP], function(P, isNodeList) {

                P[methodName] = (function(fn) {
                    switch (type) {
                        // fn(name, value, /* other arguments */): attr, css etc.
                        case HAS_NAME:
                            return function() {
                                return normalGetterSetter.call(this, isNodeList, arguments, 1, fn);
                            };

                        // fn(value, /* other arguments */): text, html, val etc.
                        case ONLY_VAL:
                            return function() {
                                return normalGetterSetter.call(this, isNodeList, arguments, 0, fn);
                            };

                        // parent, next 等返回 Node/NodeList 的方法
                        case ALWAYS_NODE:
                            return function() {
                                var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
                                    ret = fn.apply(DOM, [elems].concat(S.makeArray(arguments)));
                                return ret ? new S[S.isArray(ret) ? 'NodeList' : 'Node'](ret) : null;
                            };

                        default:
                            return function() {
                                // 有非 undefined 返回值时，直接 return 返回值；没返回值时，return this, 以支持链式调用。
                                var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
                                    ret = fn.apply(DOM, [elems].concat(S.makeArray(arguments)));
                                return ret === undefined ? this : ret;
                            };
                    }
                })(DOM[methodName]);
            });
        });
    }

    // selector
    S.mix(NP, {
        /**
         * Retrieves a node based on the given CSS selector.
         */
        one: function(selector) {
            return S.one(selector, this[0]);
        },

        /**
         * Retrieves a nodeList based on the given CSS selector.
         */
        all: function(selector) {
            return S.all(selector, this[0]);
        }
    });

    // dom-data
    attach(['data', 'removeData'], HAS_NAME);

    // dom-class
    attach(['hasClass', 'addClass', 'removeClass', 'replaceClass', 'toggleClass']);

    // dom-attr
    attach(['attr', 'removeAttr'], HAS_NAME);
    attach(['val', 'text'], ONLY_VAL);

    // dom-style
    attach(['css'], HAS_NAME);
    attach(['width', 'height'], ONLY_VAL);

    // dom-offset
    attach(['offset'], ONLY_VAL);
    attach(['scrollIntoView']);

    // dom-traversal
    attach(['parent', 'next', 'prev', 'siblings', 'children'], ALWAYS_NODE);
    attach(['contains']);

    // dom-create
    attach(['html'], ONLY_VAL);
    attach(['remove']);

    // dom-insertion
    S.each(['insertBefore', 'insertAfter'], function(methodName) {
        // 目前只给 Node 添加，不考虑 NodeList（含义太复杂）
        NP[methodName] = function(refNode) {
            DOM[methodName].call(DOM, this[0], refNode);
            return this;
        };
    });
    S.each([NP, NLP], function(P, isNodeList) {
        S.each(['append', 'prepend'], function(insertType) {
            // append 和 prepend
            P[insertType] = function(html) {
                return insert.call(this, html, isNodeList, insertType);
            };
            // appendTo 和 prependTo
            P[insertType + 'To'] = function(parent) {
                return insertTo.call(this, parent, insertType);
            };
        });
    });

    function insert(html, isNodeList, insertType) {
        if (html) {
            S.each(this, function(elem) {
                var domNode;

                // 对于 NodeList, 需要 cloneNode, 因此直接调用 create
                if (isNodeList || S.isString(html)) {
                    domNode = DOM.create(html);
                } else {
                    if (nodeTypeIs(html, 1) || nodeTypeIs(html, 3)) domNode = html;
                    if (isKSNode(html)) domNode = html[0];
                }

                DOM[insertType](domNode, elem);
            });
        }
        return this;
    }

    function insertTo(parent, insertType) {
        if ((parent = S.get(parent)) && parent.appendChild) {
            S.each(this, function(elem) {
                DOM[insertType](elem, parent);
            });
        }
        return this;
    }

    // event-target
    S.mix(NP, S.EventTarget);
    NP._supportSpecialEvent = true;
    NP._addEvent = function(type, handle, capture) {
        Event._simpleAdd(this[0], type, handle, capture);
    };
    NP._removeEvent = function(type, handle, capture) {
        Event._simpleRemove(this[0], type, handle, capture);
    };
    delete NP.fire;

    S.mix(NLP, S.EventTarget);
    delete NLP.fire;
});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/*
    http://www.JSON.org/json2.js
    2010-08-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * adapt json2 to kissy
 * @author lifesinger@gmail.com
 */
KISSY.add('json', function (S) {

    var JSON = window.JSON;

    S.JSON = {

        parse: function(text) {
            // 当输入为 undefined / null / '' 时，返回 null
            if(text == null || text === '') return null;
            return JSON.parse(text);
        },

        stringify: JSON.stringify
    };
});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/***
 * @module  ajax
 * @author  拔赤<lijing00333@163.com>
 */
KISSY.add('ajax', function(S, undef) {

    var win = window,
        noop = function() {
        },

        GET = 'GET', POST = 'POST',
        CONTENT_TYPE = 'Content-Type',
        JSON = 'json', JSONP = JSON + 'p', SCRIPT = 'script',
        CALLBACK = 'callback', EMPTY = '',
        START = 'start', SEND = 'send', STOP = 'stop',
        SUCCESS = 'success', COMPLETE = 'complete',
        ERROR = 'error', TIMEOUT = 'timeout', PARSERERR = 'parsererror',

        // 默认配置
        // 参数含义和 jQuery 保持一致：http://api.jquery.com/jQuery.ajax/
        defaultConfig = {
            type: GET,
            url: EMPTY,
            contentType: 'application/x-www-form-urlencoded',
            async: true,
            data: null,
            xhr: win.ActiveXObject ?
                 function() {
                     if (win.XmlHttpRequest) {
                         try {
                             return new win.XMLHttpRequest();
                         } catch(xhrError) {
                         }
                     }

                     try {
                         return new win.ActiveXObject('Microsoft.XMLHTTP');
                     } catch(activeError) {
                     }
                 } :
                 function() {
                     return new win.XMLHttpRequest();
                 },
            accepts: {
                xml: 'application/xml, text/xml',
                html: 'text/html',
                script: 'text/javascript, application/javascript',
                json: 'application/json, text/javascript',
                text: 'text/plain',
                _default: '*/*'
            },
            //complete: fn,
            //success: fn,
            //error: fn,
            jsonp: CALLBACK
            // jsonpCallback
            // dataType: 可以取 json | jsonp | script | xml | html | text
            // headers
            // context
        };

    function io(c) {
        c = S.merge(defaultConfig, c);
        if(!c.url) return;
        if (c.data && !S.isString(c.data)) c.data = S.param(c.data);
        c.context = c.context || c;

        var jsonp, status = SUCCESS, data, type = c.type.toUpperCase(), scriptEl;

        // handle JSONP
        if (c.dataType === JSONP) {
            jsonp = c['jsonpCallback'] || JSONP + S.now();
            c.url = addQuery(c.url, c.jsonp + '=' + jsonp);
            c.dataType = SCRIPT;

            // build temporary JSONP function
            var customJsonp = win[jsonp];

            win[jsonp] = function(data) {
                if (S.isFunction(customJsonp)) {
                    customJsonp(data);
                } else {
                    // Garbage collect
                    win[jsonp] = undef;
                    try {
                        delete win[jsonp];
                    } catch(e) {
                    }
                }
                handleEvent([SUCCESS, COMPLETE], data, status, xhr, c);
            };
        }

        if (c.data && type === GET) {
            c.url = addQuery(c.url, c.data);
        }

        if (c.dataType === SCRIPT) {
            fire(START, c);
            // jsonp 有自己的回调处理
            scriptEl = S.getScript(c.url, jsonp ? null : function() {
                handleEvent([SUCCESS, COMPLETE], EMPTY, status, xhr, c);
            });
            fire(SEND, c);
            return scriptEl;
        }


        // 开始 XHR 之旅
        var requestDone = false, xhr = c.xhr();

        fire(START, c);
        xhr.open(type, c.url, c.async);

        // Need an extra try/catch for cross domain requests in Firefox 3
        try {
            // Set the correct header, if data is being sent
            if (c.data || c.contentType) {
                xhr.setRequestHeader(CONTENT_TYPE, c.contentType);
            }

            // Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader('Accept', c.dataType && c.accepts[c.dataType] ?
				c.accepts[c.dataType] + ', */*; q=0.01' :
				c.accepts._default );
        } catch(e) {
        }

        // Wait for a response to come back
        xhr.onreadystatechange = function(isTimeout) {
            // The request was aborted
            if (!xhr || xhr.readyState === 0 || isTimeout === 'abort') {
                // Opera doesn't call onreadystatechange before this point
                // so we simulate the call
                if (!requestDone) {
                    handleEvent(COMPLETE, null, ERROR, xhr, c);
                }
                requestDone = true;
                if (xhr) {
                    xhr.onreadystatechange = noop;
                }
            } else
            // The transfer is complete and the data is available, or the request timed out
            if (!requestDone && xhr && (xhr.readyState === 4 || isTimeout === TIMEOUT)) {
                requestDone = true;
                xhr.onreadystatechange = noop;
                status = (isTimeout === TIMEOUT) ? TIMEOUT :
                    xhrSuccessful(xhr) ? SUCCESS : ERROR;

                // Watch for, and catch, XML document parse errors
                try {
                    // process the data (runs the xml through httpData regardless of callback)
                    data = parseData(xhr, c.dataType);

					//alert(xhr);
					//S.log(data,'warn');
                } catch(e) {
                    status = PARSERERR;
                }

                // fire events
                handleEvent([status === SUCCESS ? SUCCESS : ERROR, COMPLETE], data, status, xhr, c);

                if (isTimeout === TIMEOUT) {
                    xhr.abort();
                    fire(STOP, c);
                }

                // Stop memory leaks
                if (c.async) {
                    xhr = null;
                }
            }
        };

        fire(SEND, c);
		try {
            xhr.send(type === POST ? c.data : null);
		} catch(e) {
            handleEvent([ERROR, COMPLETE], data, ERROR, xhr, c);
		}

        // return XMLHttpRequest to allow aborting the request etc.
        if (!c.async) {
            fire(COMPLETE, c);
        }
        return xhr;
    }

    // 事件支持
    S.mix(io, S.EventTarget);

    // 定制各种快捷操作
    S.mix(io, {

        get: function(url, data, callback, dataType, _t) {
            // data 参数可省略
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
            }

            return io({
                type: _t || GET,
                url: url,
                data: data,
                success: function(data, textStatus, xhr) {
                    callback && callback.call(this, data, textStatus, xhr);
                },
                dataType: dataType
            });
        },

        post: function(url, data, callback, dataType) {
            if(S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, dataType, POST);
        },

        jsonp: function(url, data, callback) {
            if(S.isFunction(data)) {
                callback = data;
				data = null; // 占位符
            }
            return io.get(url, data, callback, JSONP);
        }
    });

    // shortcuts
    io.getScript = S.getScript;
    S.io = S.ajax = io.ajax = io;
    S.jsonp = io.jsonp;
    S.IO = io;
    // 所有方法在 IO 下都可调 IO.ajax/get/post/getScript/jsonp
    // S 下有便捷入口 S.io/ajax/getScript/jsonp

    //检测 xhr 是否成功
    function xhrSuccessful(xhr) {
        try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
            // ref: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
			// IE 中如果请求一个缓存住的页面，会出现如下状况 (jQuery 中未考虑,此处也不作处理)：
			// 		请求一个页面成功，但头输出为 404, ie6/8 下检测为 200, ie7/ff/chrome/opera 检测为 404
			// 		请求一个不存在的页面，ie 均检测为 200 ,ff/chrome/opera检测为 404
			// 		请求一个不存在的页面，ie6/7 的 statusText为 'Not Found'，ie8 的为 'OK', statusText 是可以被程序赋值的
			return xhr.status >= 200 && xhr.status < 300 ||
				xhr.status === 304 || xhr.status === 1223;
		} catch(e) {}
		return false;
    }

    function addQuery(url, params) {
        return url + (url.indexOf('?') === -1 ? '?' : '&') + params;
    }

    function handleEvent(type, data, status, xhr, c) {
        if (S.isArray(type)) {
            S.each(type, function(t) {
                handleEvent(t, data, status, xhr, c);
            });
        } else {
            // 只调用与 status 匹配的 c.type, 比如成功时才调 c.success
            if(status === type && c[type]) c[type].call(c.context, data, status, xhr);
            fire(type, c);
        }
    }

    function fire(type, config) {
        io.fire(type, { ajaxConfig: config });
    }

    function parseData(xhr, type) {
        var ct = EMPTY, xml, data = xhr;

        // xhr 可以直接是 data
        if (!S.isString(data)) {
            ct = xhr.getResponseHeader(CONTENT_TYPE) || EMPTY;
            xml = type === 'xml' || !type && ct.indexOf('xml') >= 0;
            data = xml ? xhr.responseXML : xhr.responseText;

            if (xml && data.documentElement.nodeName === PARSERERR) {
                throw PARSERERR;
            }
        }

        if (S.isString(data)) {
            if (type === JSON || !type && ct.indexOf(JSON) >= 0) {
                data = S.JSON.parse(data);
            }
        }

        return data;
    }

});

/**
 * TODO:
 *   - 给 Node 增加 load 方法?
 *   - 请求缓存资源的状态的判断（主要针对404）？
 *
 * NOTES:
 *  2010.07
 *   - 实现常用功实现常用功实现常用功实现常用功,get,post以及类jquery的jsonp
 *     考虑是否继续实现iframe-upload和flash xdr，代码借鉴jquery-ajax，api形状借鉴yui3-io
 *     基本格式依照 callback(id,xhr,args)
 *   - 没有经过严格测试，包括jsonp里的内存泄漏的测试
 *     对xml,json的格式的回调支持是否必要
 * 2010.11
 *   - 实现了get/post/jsonp/getJSON
 *   - 实现了onComplete/onError/onSend/onStart/onStop/onSucess的ajax状态的处理
 *   - [玉伯] 在拔赤的代码基础上重构，调整了部分 public api
 *   - [玉伯] 增加部分 Jasmine 单元测试
 *   - [玉伯] 去掉 getJSON 接口，增加 jsonp 接口
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module anim-easing
 */
KISSY.add('anim-easing', function(S) {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /**
     * 和 YUI 的 Easing 相比，S.Easing 进行了归一化处理，参数调整为：
     * @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
     * @param {Number} b Starting value  b = 0
     * @param {Number} c Delta between start and end values  c = 1
     * @param {Number} d Total length of animation d = 1
     */

    var M = Math, PI = M.PI,
        pow = M.pow, sin = M.sin,
        BACK_CONST = 1.70158,

        Easing = {

            /**
             * Uniform speed between points.
             */
            easeNone: function (t) {
                return t;
            },
            
            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t) {
                return t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t :
                    .5 * (1 - (--t) * (t - 2));
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t) {
                return t * t * t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t * t * t :
                    .5 * (2 - (t -= 2) * t * t * t);
            },

            /**
             * Snap in elastic effect.
             */

            elasticIn: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t) {
                var p = .45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) return t;

                if (t < 1) {
                    return -.5 * (pow(2, 10 * (t -= 1)) *
                        sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) *
                    sin((t - s) * (2 * PI) / p) * .5 + 1;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             */
            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t) {
                if ((t *= 2 ) < 1) {
                    return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
                }
                return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r = s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r = s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r = s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t) {
                if (t < .5) {
                    return Easing.bounceIn(t * 2) * .5;
                }
                return Easing.bounceOut(t * 2 - 1) * .5 + .5;
            }
        };

    Easing.NativeTimeFunction = {
        easeNone: 'linear',
        ease: 'ease',

        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeBoth: 'ease-in-out',

        // Ref:
        //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        //  2. http://www.robertpenner.com/easing/easing_demo.html
        //  3. assets/cubic-bezier-timing-function.html
        // 注：是模拟值，非精确推导值
        easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
        easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
        easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
    };

    S.Easing = Easing;
});

/**
 * TODO:
 *  - test-easing.html 详细的测试 + 曲线可视化
 *
 * NOTES:
 *  - 综合比较 jQuery UI/scripty2/YUI 的 easing 命名，还是觉得 YUI 的对用户
 *    最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 *
 */
/**
 * @module   anim
 * @author   lifesinger@gmail.com
 */
KISSY.add('anim', function(S, undefined) {

    var DOM = S.DOM, Easing = S.Easing,
        PARSE_FLOAT = parseFloat,
        parseEl = DOM.create('<div>'),
        PROPS = ('backgroundColor borderBottomColor borderBottomWidth borderBottomStyle borderLeftColor borderLeftWidth borderLeftStyle ' +
            'borderRightColor borderRightWidth borderRightStyle borderSpacing borderTopColor borderTopWidth borderTopStyle bottom color ' +
            'font fontFamily fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
            'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
            'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),

        STEP_INTERVAL = 13,
        OPACITY = 'opacity',
        NONE = 'none',
        PROPERTY = 'Property',

        EVENT_START = 'start',
        EVENT_STEP = 'step',
        EVENT_COMPLETE = 'complete',

        defaultConfig = {
            duration: 1,
            easing: 'easeNone',
            nativeSupport: true // 优先使用原生 css3 transition
            //queue: true
        };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback, nativeSupport) {
        // ignore non-exist element
        if (!(elem = S.get(elem))) return;

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback, nativeSupport);
        }

        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props, config;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 可以是 "width: 200px; color: #ccc" 字符串形式
         * 也可以是 { width: '200px', color: '#ccc' } 对象形式
         */
        if (S.isPlainObject(style)) {
            style = S.param(style, ';')
                .replace(/=/g, ':')
                .replace(/%23/g, '#') // 还原颜色值中的 #
                .replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(); // backgroundColor => background-color
        }
        self.props = normalize(style);
        self.targetStyle = style;
        // normalize 后：
        // props = {
        //          width: { v: 200, unit: 'px', f: interpolate }
        //          color: { v: '#ccc', unit: '', f: color }
        //         }

        /**
         * animation config
         */
        if (isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            if (duration) (config.duration = PARSE_FLOAT(duration) || 1);
            if (S.isString(easing) || S.isFunction(easing)) config.easing = easing;
            if (S.isFunction(callback)) config.complete = callback;
            if(nativeSupport !== undefined) config.nativeSupport = nativeSupport;
        }
        self.config = config;

        /**
         * detect browser native animation(CSS3 transition) support
         */
        if (config.nativeSupport && getNativeTransitionName()
            && S.isString((easing = config.easing))) {

            // 当 easing 是支持的字串时，才激活 native transition
            if (/cubic-bezier\([\s\d.,]+\)/.test(easing) ||
                (easing = Easing.NativeTimeFunction[easing])) {
                config.easing = easing;
                self.transitionName = getNativeTransitionName();
            }
        }


        /**
         * timer
         */
        //self.timer = undefined;

        // register callback
        if (S.isFunction(callback)) {
            self.on(EVENT_COMPLETE, callback);
        }
    }

    S.augment(Anim, S.EventTarget, {

        run: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                duration, easing, start, finish,
                target = self.props,
                source = {}, prop, go;

            for (prop in target) source[prop] = parse(DOM.css(elem, prop));
            if (self.fire(EVENT_START) === false) return;
            self.stop(); // 先停止掉正在运行的动画

            if (self.transitionName) {
                self._nativeRun();
            } else {
                duration = config.duration * 1000;
                start = S.now();
                finish = start + duration;

                easing = config.easing;
                if(S.isString(easing)) {
                    easing = Easing[easing] || Easing.easeNone;
                }

                self.timer = S.later((go = function () {
                    var time = S.now(),
                        t = time > finish ? 1 : (time - start) / duration,
                        sp, tp, b;

                    for (prop in target) {
                        sp = source[prop];
                        tp = target[prop];

                        // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                        // 这时要把 sp 的单位调整为和 tp 的一致
                        if (tp.v == 0) tp.u = sp.u;

                        // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                        // 比如：ie 下 border-width 默认为 medium
                        if (sp.u !== tp.u) sp.v = 0;

                        // go
                        DOM.css(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                    }

                    if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                        self.stop();
                        // complete 事件只在动画到达最后一帧时才触发
                        if (b) self.fire(EVENT_COMPLETE);
                    }
                }), STEP_INTERVAL, true);

                // 立刻执行
                go();
            }

            return self;
        },

        _nativeRun: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                target = self.props,
                duration = config.duration * 1000,
                easing = config.easing,
                prefix = self.transitionName,
                transition = {};

            S.log('Amin uses native transition.');

            // using CSS transition process
            transition[prefix + 'Property'] = 'all';
            transition[prefix + 'Duration'] = duration + 'ms';
            transition[prefix + 'TimingFunction'] = easing;

            // set the CSS transition style
            DOM.css(elem, transition);

            // set the final style value (need some hack for opera)
            S.later(function() {
                setToFinal(elem, target, self.targetStyle);
            }, 0);

            // after duration time, fire the stop function
            S.later(function() {
                self.stop(true);
            }, duration);
        },

        stop: function(finish) {
            var self = this;

            if (self.transitionName) {
                self._nativeStop(finish);
            }
            else {
                // 停止定时器
                if (self.timer) {
                    self.timer.cancel();
                    self.timer = undefined;
                }

                // 直接设置到最终样式
                if (finish) {
                    setToFinal(self.domEl, self.props, self.targetStyle);
                    self.fire(EVENT_COMPLETE);
                }
            }

            return self;
        },

        _nativeStop: function(finish) {
            var self = this, elem = self.domEl,
                prefix = self.transitionName,
                props = self.props, prop;

            // handle for the CSS transition
            if (finish) {
                // CSS transition value remove should come first
                DOM.css(elem, prefix + PROPERTY, NONE);
                self.fire(EVENT_COMPLETE);
            } else {
                // if want to stop the CSS transition, should set the current computed style value to the final CSS value
                for (prop in props) {
                    DOM.css(elem, prop, DOM._getComputedStyle(elem, prop));
                }
                // CSS transition value remove should come last
                DOM.css(elem, prefix + PROPERTY, NONE);
            }
        }
    });

    Anim.supportTransition = function() { return !!getNativeTransitionName(); };

    S.Anim = Anim;

    function getNativeTransitionName() {
        var name = 'transition', transitionName;

        if (parseEl.style[name] !== undefined) {
            transitionName = name;
        } else {
            S.each(['Webkit', 'Moz', 'O'], function(item) {
                if (parseEl.style[(name = item + 'Transition')] !== undefined) {
                    transitionName = name;
                    return false;
                }
            });
        }
        getNativeTransitionName = function() {
            return transitionName;
        };
        return transitionName;
    }

    function setToFinal(elem, props, style) {
        if (S.UA.ie && style.indexOf(OPACITY) > -1) {
            DOM.css(elem, OPACITY, props[OPACITY].v);
        }
        elem.style.cssText += ';' + style;
    }

    function normalize(style) {
        var css, rules = { }, i = PROPS.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.firstChild.style;
        while (i--) if ((v = css[PROPS[i]])) rules[PROPS[i]] = parse(v);
        return rules;
    }

    function parse(val) {
        var num = PARSE_FLOAT(val), unit = (val + '').replace(/^[-\d.]+/, '');
        return isNaN(num) ? { v: unit, u: '', f: colorEtc } : { v: num, u: unit, f: interpolate };
    }

    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    function colorEtc(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];

        while (j = 3,c = arguments[i - 1],i--) {
            if (s(c, 0, 4) === 'rgb(') {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            }
            else if (s(c, 0) === '#') {
                if (c.length === 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
            else { // red, black 等值，以及其它一切非颜色值，直接返回 target
                return target;
            }
        }

        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
        }

        return 'rgb(' + r.join(',') + ')';
    }

    function s(str, p, c) {
        return str.substr(p, c || 1);
    }
})
    ;

/**
 * TODO:
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / toogle,show,hide 等特性
 *  - 还有些情况就是动画不一定改变 CSS, 有可能是 scroll-left 等
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 */
/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('anim-node-plugin', function(S, undefined) {

    var DOM = S.DOM, Anim = S.Anim,
        NP = S.Node.prototype, NLP = S.NodeList.prototype,

        DISPLAY = 'display', NONE = 'none',
        OVERFLOW = 'overflow', HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height', WIDTH = 'width', AUTO = 'auto',

        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    S.each([NP, NLP], function(P) {
        P.animate = function() {
            var args = S.makeArray(arguments);

            S.each(this, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return this;
        };

        S.each({
            show: ['show', 1],
            hide: ['show', 0],
            toggle: ['toggle'],
            fadeIn: ['fade', 1],
            fadeOut: ['fade', 0],
            slideDown: ['slide', 1],
            slideUp: ['slide', 0]
        },
            function(v, k) {

                P[k] = function(speed, callback) {
                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && arguments.length === 0) {
                        DOM[k](this);
                    }
                    else {
                        S.each(this, function(elem) {
                            fx(elem, v[0], speed, callback, v[1]);
                        });
                    }
                    return this;
                };
            });
    });

    function fx(elem, which, speed, callback, visible) {
        if (which === 'toggle') {
            visible = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = 'show';
        }

        if (visible) DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var originalStyle = {}, style = {};
        S.each(FX[which], function(prop) {
            if (prop === OVERFLOW) {
                originalStyle[OVERFLOW] = DOM.css(elem, OVERFLOW);
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                originalStyle[OPCACITY] = DOM.css(elem, OPCACITY);
                style.opacity = visible ? 1 : 0;
                if (visible) DOM.css(elem, OPCACITY, 0);
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = DOM.css(elem, HEIGHT);
                style.height = (visible ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);
                if (visible) DOM.css(elem, HEIGHT, 0);
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = DOM.css(elem, WIDTH);
                style.width = (visible ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (visible) DOM.css(elem, WIDTH, 0);
            }
        });

        // 开始动画
        new S.Anim(elem, style, speed, 'easeOut', function() {
            // 如果是隐藏, 需要还原一些 css 属性
            if (!visible) {
                // 保留原有值
                var currStyle = elem.style, oldVal = currStyle[DISPLAY];
                if (oldVal !== NONE) {
                    if (oldVal) {
                        DOM.data(elem, DISPLAY, oldVal);
                    }
                    currStyle[DISPLAY] = NONE;
                }

                // 还原样式
                if(originalStyle[HEIGHT]) DOM.css(elem, { height: originalStyle[HEIGHT] });
                if(originalStyle[WIDTH]) DOM.css(elem, { height: originalStyle[WIDTH] });
                if(originalStyle[OPCACITY]) DOM.css(elem, { height: originalStyle[OPCACITY] });
                if(originalStyle[OVERFLOW]) DOM.css(elem, { height: originalStyle[OVERFLOW] });
            }

            if (callback && S.isFunction(callback)) callback();

        }).run();
    }

});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  cookie
 * @author  lifesinger@gmail.com
 */
KISSY.add('cookie', function(S) {

    var doc = document,
        encode = encodeURIComponent,
        decode = decodeURIComponent;

    S.Cookie = {

        /**
         * 获取 cookie 值
         * @return {string} 如果 name 不存在，返回 undefined
         */
        get: function(name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = doc.cookie.match('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)'))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        set: function(name, val, expires, domain, path, secure) {
            var text = encode(val), date = expires;

            // 从当前时间开始，多少天后过期
            if (typeof date === 'number') {
                date = new Date();
                date.setTime(date.getTime() + expires * 86400000);
            }
            // expiration date
            if (date instanceof Date) {
                text += '; expires=' + date.toUTCString();
            }

            // domain
            if (isNotEmptyString(domain)) {
                text += '; domain=' + domain;
            }

            // path
            if (isNotEmptyString(path)) {
                text += '; path=' + path;
            }

            // secure
            if (secure) {
                text += '; secure';
            }

            //S.log(text);
            doc.cookie = name + '=' + text;
        },

        remove: function(name, domain, path, secure) {
            // 置空，并立刻过期
            this.set(name, '', 0, domain, path, secure);
        }
    };

    function isNotEmptyString(val) {
        return S.isString(val) && val !== '';
    }

});

/**
 * NOTES:
 *
 *  2010.04
 *   - get 方法要考虑 ie 下，
 *     值为空的 cookie 为 'test3; test3=3; test3tt=2; test1=t1test3; test3', 没有等于号。
 *     除了正则获取，还可以 split 字符串的方式来获取。
 *   - api 设计上，原本想借鉴 jQuery 的简明风格：S.cookie(name, ...), 但考虑到可扩展性，目前
 *     独立成静态工具类的方式更优。
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  Attribute
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('attribute', function(S, undefined) {

    /**
     * Attribute provides the implementation for any object
     * to deal with its attribute in aop ways.
     */
    function Attribute() {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         value: v, // default value
         valueFn: function
         }
         }
         */
        this.__attrs = {};

        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        this.__attrVals = {};
    }

    S.augment(Attribute, {

        __getDefAttrs: function() {
            return S.clone(this.__attrs);
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * The config supports the following properties:
         * {
         *     value: 'the default value',
         *     valueFn: function
         *     setter: function
         *     getter: function
         * }
         */
        addAttr: function(name, attrConfig) {
            var host = this;
            host.__attrs[name] = S.clone(attrConfig || {});

            return host;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         * @param attrConfigs {Object} An object with attribute name/configuration pairs.
         * @param values {Object} An object with attribute name/value pairs, defining the initial values to apply.
         *        Values defined in the cfgs argument will be over-written by values in this argument.
         */
        addAttrs: function(attrConfigs, values) {
            var host = this;

            S.each(attrConfigs, function(attrConfig, name) {
                if (name in values) {
                    attrConfig.value = values[name];
                }
                host.addAttr(name, attrConfig);
            });

            return host;
        },

        /**
         * Checks if the given attribute has been added to the host.
         */
        hasAttr: function(name) {
            return name && (name in (this.__attrs || {}));
        },

        /**
         * Removes an attribute from the host object.
         */
        removeAttr: function(name) {
            var host = this;

            if (host.hasAttr(name)) {
                delete host.__attrs[name];
                delete host.__attrVals[name];
            }

            return host;
        },

        /**
         * Sets the value of an attribute.
         */
        set: function(name, value) {
            var host = this,
                prevVal = host.get(name);

            // if no change, just return
            if (prevVal === value) return;

            // check before event
            if (false === host.__fireAttrChange('before', name, prevVal, value)) return;

            // set it
            host.__set(name, value);

            // fire after event
            host.__fireAttrChange('after', name, prevVal, host.__attrVals[name]);

            return host;
        },

        __fireAttrChange: function(when, name, prevVal, newVal) {
            return this.fire(when + capitalFirst(name) + 'Change', {
                attrName: name,
                prevVal: prevVal,
                newVal: newVal
            });
        },

        /**
         * internal use, no event involved, just set.
         */
        __set: function(name, value) {
            var host = this,
                setValue,
                attrConfig = host.__attrs[name],
                setter = attrConfig && attrConfig['setter'];

            // if setter has effect
            if (setter) setValue = setter.call(host, value);
            if (setValue !== undefined) value = setValue;

            // finally set
            host.__attrVals[name] = value;
        },

        /**
         * Gets the current value of the attribute.
         */
        get: function(name) {
            var host = this, attrConfig, getter, ret;
            
            attrConfig = host.__attrs[name];
            getter = attrConfig && attrConfig['getter'];

            // get user-set value or default value
            ret = name in host.__attrVals ?
                host.__attrVals[name] :
                host.__getDefAttrVal(name);

            // invoke getter for this attribute
            if (getter) ret = getter.call(host, ret);

            return ret;
        },

        __getDefAttrVal: function(name) {
            var host = this,
                attrConfig = host.__attrs[name],
                valFn, val;

            if (!attrConfig) return;

            if ((valFn = attrConfig.valueFn)) {
                val = valFn.call(host);
                if (val !== undefined) {
                    attrConfig.value = val;
                }
                delete attrConfig.valueFn;
            }

            return attrConfig.value;
        },

        /**
         * Resets the value of an attribute.
         */
        reset: function (name) {
            var host = this;

            if (host.hasAttr(name)) {
                // if attribute does not have default value, then set to undefined.
                return host.set(name, host.__getDefAttrVal(name));
            }

            // reset all
            for (name in host.__attrs) {
                if (host.hasAttr(name)) {
                    host.reset(name);
                }
            }

            return host;
        }
    });

    S.Attribute = Attribute;

    function capitalFirst(s) {
        s = s + '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    Attribute.__capitalFirst = capitalFirst;
});
/**
 * @module  Base
 * @author  lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('base', function (S) {

    /*
     * Base for class-based component
     */
    function Base(config) {
        S.Attribute.call(this);
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }

        // initial
        initAttrs(this, config);
    }

    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                if (attrs.hasOwnProperty(attr) && !host.hasAttr(attr)) {
                    host.addAttr(attr, attrs[attr]);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr))
                    host.__set(attr, config[attr]);
            }
        }
    }

    S.augment(Base, S.EventTarget, S.Attribute);
    S.Base = Base;
});

KISSY.add('core');
