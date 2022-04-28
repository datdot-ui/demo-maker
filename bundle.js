(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (__filename){(function (){
const demo_maker = require('..')
const path = require('path')
const filename = path.basename(__filename)
const message_maker = require('message-maker')
const input_number = require('datdot-ui-input-number')

var id = 0
var count = 0

// ---------------------------------------------
const myaddress = `${__filename}-${id++}`
const inbox = {}
const outbox = {}
const recipients = {}
const names = {}
const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

function make_protocol (name) {
    return function protocol (address, notify) {
        names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
        return { notify: listen, address: myaddress }
    }
}
function listen (msg) {
    console.log('New message', { msg })
    const { head, refs, type, data, meta } = msg // receive msg
    inbox[head.join('/')] = msg                  // store msg
    const [from] = head
}
// ---------------------------------------------
const code = `
  const input_number = require('datdot-ui-input-number')
  const opts = input_number.docs().opts
  var el = input_number(opts, make_protocol('input'))
  document.body.append(el)
`

const node_modules = {
  'datdot-ui-input-number': input_number,
}

const el = demo_maker({ code, node_modules })
document.body.append(el)



}).call(this)}).call(this,"/demo/demo.js")
},{"..":27,"datdot-ui-input-number":21,"message-maker":24,"path":25}],2:[function(require,module,exports){
(function (global){(function (){
'use strict';

var csjs = require('csjs');
var insertCss = require('insert-css');

function csjsInserter() {
  var args = Array.prototype.slice.call(arguments);
  var result = csjs.apply(null, args);
  if (global.document) {
    insertCss(csjs.getCss(result));
  }
  return result;
}

module.exports = csjsInserter;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"csjs":7,"insert-css":23}],3:[function(require,module,exports){
'use strict';

module.exports = require('csjs/get-css');

},{"csjs/get-css":6}],4:[function(require,module,exports){
'use strict';

var csjs = require('./csjs');

module.exports = csjs;
module.exports.csjs = csjs;
module.exports.getCss = require('./get-css');

},{"./csjs":2,"./get-css":3}],5:[function(require,module,exports){
'use strict';

module.exports = require('./lib/csjs');

},{"./lib/csjs":11}],6:[function(require,module,exports){
'use strict';

module.exports = require('./lib/get-css');

},{"./lib/get-css":15}],7:[function(require,module,exports){
'use strict';

var csjs = require('./csjs');

module.exports = csjs();
module.exports.csjs = csjs;
module.exports.noScope = csjs({ noscope: true });
module.exports.getCss = require('./get-css');

},{"./csjs":5,"./get-css":6}],8:[function(require,module,exports){
'use strict';

/**
 * base62 encode implementation based on base62 module:
 * https://github.com/andrew/base62.js
 */

var CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = function encode(integer) {
  if (integer === 0) {
    return '0';
  }
  var str = '';
  while (integer > 0) {
    str = CHARS[integer % 62] + str;
    integer = Math.floor(integer / 62);
  }
  return str;
};

},{}],9:[function(require,module,exports){
'use strict';

var makeComposition = require('./composition').makeComposition;

module.exports = function createExports(classes, keyframes, compositions) {
  var keyframesObj = Object.keys(keyframes).reduce(function(acc, key) {
    var val = keyframes[key];
    acc[val] = makeComposition([key], [val], true);
    return acc;
  }, {});

  var exports = Object.keys(classes).reduce(function(acc, key) {
    var val = classes[key];
    var composition = compositions[key];
    var extended = composition ? getClassChain(composition) : [];
    var allClasses = [key].concat(extended);
    var unscoped = allClasses.map(function(name) {
      return classes[name] ? classes[name] : name;
    });
    acc[val] = makeComposition(allClasses, unscoped);
    return acc;
  }, keyframesObj);

  return exports;
}

function getClassChain(obj) {
  var visited = {}, acc = [];

  function traverse(obj) {
    return Object.keys(obj).forEach(function(key) {
      if (!visited[key]) {
        visited[key] = true;
        acc.push(key);
        traverse(obj[key]);
      }
    });
  }

  traverse(obj);
  return acc;
}

},{"./composition":10}],10:[function(require,module,exports){
'use strict';

module.exports = {
  makeComposition: makeComposition,
  isComposition: isComposition,
  ignoreComposition: ignoreComposition
};

/**
 * Returns an immutable composition object containing the given class names
 * @param  {array} classNames - The input array of class names
 * @return {Composition}      - An immutable object that holds multiple
 *                              representations of the class composition
 */
function makeComposition(classNames, unscoped, isAnimation) {
  var classString = classNames.join(' ');
  return Object.create(Composition.prototype, {
    classNames: { // the original array of class names
      value: Object.freeze(classNames),
      configurable: false,
      writable: false,
      enumerable: true
    },
    unscoped: { // the original array of class names
      value: Object.freeze(unscoped),
      configurable: false,
      writable: false,
      enumerable: true
    },
    className: { // space-separated class string for use in HTML
      value: classString,
      configurable: false,
      writable: false,
      enumerable: true
    },
    selector: { // comma-separated, period-prefixed string for use in CSS
      value: classNames.map(function(name) {
        return isAnimation ? name : '.' + name;
      }).join(', '),
      configurable: false,
      writable: false,
      enumerable: true
    },
    toString: { // toString() method, returns class string for use in HTML
      value: function() {
        return classString;
      },
      configurable: false,
      writeable: false,
      enumerable: false
    }
  });
}

/**
 * Returns whether the input value is a Composition
 * @param value      - value to check
 * @return {boolean} - whether value is a Composition or not
 */
function isComposition(value) {
  return value instanceof Composition;
}

function ignoreComposition(values) {
  return values.reduce(function(acc, val) {
    if (isComposition(val)) {
      val.classNames.forEach(function(name, i) {
        acc[name] = val.unscoped[i];
      });
    }
    return acc;
  }, {});
}

/**
 * Private constructor for use in `instanceof` checks
 */
function Composition() {}

},{}],11:[function(require,module,exports){
'use strict';

var extractExtends = require('./css-extract-extends');
var composition = require('./composition');
var isComposition = composition.isComposition;
var ignoreComposition = composition.ignoreComposition;
var buildExports = require('./build-exports');
var scopify = require('./scopeify');
var cssKey = require('./css-key');
var extractExports = require('./extract-exports');

module.exports = function csjsTemplate(opts) {
  opts = (typeof opts === 'undefined') ? {} : opts;
  var noscope = (typeof opts.noscope === 'undefined') ? false : opts.noscope;

  return function csjsHandler(strings, values) {
    // Fast path to prevent arguments deopt
    var values = Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      values[i - 1] = arguments[i];
    }
    var css = joiner(strings, values.map(selectorize));
    var ignores = ignoreComposition(values);

    var scope = noscope ? extractExports(css) : scopify(css, ignores);
    var extracted = extractExtends(scope.css);
    var localClasses = without(scope.classes, ignores);
    var localKeyframes = without(scope.keyframes, ignores);
    var compositions = extracted.compositions;

    var exports = buildExports(localClasses, localKeyframes, compositions);

    return Object.defineProperty(exports, cssKey, {
      enumerable: false,
      configurable: false,
      writeable: false,
      value: extracted.css
    });
  }
}

/**
 * Replaces class compositions with comma seperated class selectors
 * @param  value - the potential class composition
 * @return       - the original value or the selectorized class composition
 */
function selectorize(value) {
  return isComposition(value) ? value.selector : value;
}

/**
 * Joins template string literals and values
 * @param  {array} strings - array of strings
 * @param  {array} values  - array of values
 * @return {string}        - strings and values joined
 */
function joiner(strings, values) {
  return strings.map(function(str, i) {
    return (i !== values.length) ? str + values[i] : str;
  }).join('');
}

/**
 * Returns first object without keys of second
 * @param  {object} obj      - source object
 * @param  {object} unwanted - object with unwanted keys
 * @return {object}          - first object without unwanted keys
 */
function without(obj, unwanted) {
  return Object.keys(obj).reduce(function(acc, key) {
    if (!unwanted[key]) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

},{"./build-exports":9,"./composition":10,"./css-extract-extends":12,"./css-key":13,"./extract-exports":14,"./scopeify":20}],12:[function(require,module,exports){
'use strict';

var makeComposition = require('./composition').makeComposition;

var regex = /\.([^\s]+)(\s+)(extends\s+)(\.[^{]+)/g;

module.exports = function extractExtends(css) {
  var found, matches = [];
  while (found = regex.exec(css)) {
    matches.unshift(found);
  }

  function extractCompositions(acc, match) {
    var extendee = getClassName(match[1]);
    var keyword = match[3];
    var extended = match[4];

    // remove from output css
    var index = match.index + match[1].length + match[2].length;
    var len = keyword.length + extended.length;
    acc.css = acc.css.slice(0, index) + " " + acc.css.slice(index + len + 1);

    var extendedClasses = splitter(extended);

    extendedClasses.forEach(function(className) {
      if (!acc.compositions[extendee]) {
        acc.compositions[extendee] = {};
      }
      if (!acc.compositions[className]) {
        acc.compositions[className] = {};
      }
      acc.compositions[extendee][className] = acc.compositions[className];
    });
    return acc;
  }

  return matches.reduce(extractCompositions, {
    css: css,
    compositions: {}
  });

};

function splitter(match) {
  return match.split(',').map(getClassName);
}

function getClassName(str) {
  var trimmed = str.trim();
  return trimmed[0] === '.' ? trimmed.substr(1) : trimmed;
}

},{"./composition":10}],13:[function(require,module,exports){
'use strict';

/**
 * CSS identifiers with whitespace are invalid
 * Hence this key will not cause a collision
 */

module.exports = ' css ';

},{}],14:[function(require,module,exports){
'use strict';

var regex = require('./regex');
var classRegex = regex.classRegex;
var keyframesRegex = regex.keyframesRegex;

module.exports = extractExports;

function extractExports(css) {
  return {
    css: css,
    keyframes: getExport(css, keyframesRegex),
    classes: getExport(css, classRegex)
  };
}

function getExport(css, regex) {
  var prop = {};
  var match;
  while((match = regex.exec(css)) !== null) {
    var name = match[2];
    prop[name] = name;
  }
  return prop;
}

},{"./regex":17}],15:[function(require,module,exports){
'use strict';

var cssKey = require('./css-key');

module.exports = function getCss(csjs) {
  return csjs[cssKey];
};

},{"./css-key":13}],16:[function(require,module,exports){
'use strict';

/**
 * djb2 string hash implementation based on string-hash module:
 * https://github.com/darkskyapp/string-hash
 */

module.exports = function hashStr(str) {
  var hash = 5381;
  var i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }
  return hash >>> 0;
};

},{}],17:[function(require,module,exports){
'use strict';

var findClasses = /(\.)(?!\d)([^\s\.,{\[>+~#:)]*)(?![^{]*})/.source;
var findKeyframes = /(@\S*keyframes\s*)([^{\s]*)/.source;
var ignoreComments = /(?!(?:[^*/]|\*[^/]|\/[^*])*\*+\/)/.source;

var classRegex = new RegExp(findClasses + ignoreComments, 'g');
var keyframesRegex = new RegExp(findKeyframes + ignoreComments, 'g');

module.exports = {
  classRegex: classRegex,
  keyframesRegex: keyframesRegex,
  ignoreComments: ignoreComments,
};

},{}],18:[function(require,module,exports){
var ignoreComments = require('./regex').ignoreComments;

module.exports = replaceAnimations;

function replaceAnimations(result) {
  var animations = Object.keys(result.keyframes).reduce(function(acc, key) {
    acc[result.keyframes[key]] = key;
    return acc;
  }, {});
  var unscoped = Object.keys(animations);

  if (unscoped.length) {
    var regexStr = '((?:animation|animation-name)\\s*:[^};]*)('
      + unscoped.join('|') + ')([;\\s])' + ignoreComments;
    var regex = new RegExp(regexStr, 'g');

    var replaced = result.css.replace(regex, function(match, preamble, name, ending) {
      return preamble + animations[name] + ending;
    });

    return {
      css: replaced,
      keyframes: result.keyframes,
      classes: result.classes
    }
  }

  return result;
}

},{"./regex":17}],19:[function(require,module,exports){
'use strict';

var encode = require('./base62-encode');
var hash = require('./hash-string');

module.exports = function fileScoper(fileSrc) {
  var suffix = encode(hash(fileSrc));

  return function scopedName(name) {
    return name + '_' + suffix;
  }
};

},{"./base62-encode":8,"./hash-string":16}],20:[function(require,module,exports){
'use strict';

var fileScoper = require('./scoped-name');
var replaceAnimations = require('./replace-animations');
var regex = require('./regex');
var classRegex = regex.classRegex;
var keyframesRegex = regex.keyframesRegex;

module.exports = scopify;

function scopify(css, ignores) {
  var makeScopedName = fileScoper(css);
  var replacers = {
    classes: classRegex,
    keyframes: keyframesRegex
  };

  function scopeCss(result, key) {
    var replacer = replacers[key];
    function replaceFn(fullMatch, prefix, name) {
      var scopedName = ignores[name] ? name : makeScopedName(name);
      result[key][scopedName] = name;
      return prefix + scopedName;
    }
    return {
      css: result.css.replace(replacer, replaceFn),
      keyframes: result.keyframes,
      classes: result.classes
    };
  }

  var result = Object.keys(replacers).reduce(scopeCss, {
    css: css,
    keyframes: {},
    classes: {}
  });

  return replaceAnimations(result);
}

},{"./regex":17,"./replace-animations":18,"./scoped-name":19}],21:[function(require,module,exports){
const style_sheet = require('support-style-sheet')
const message_maker = require('message-maker')
const csjs = require('csjs-inject')

var id = 0

module.exports = i_input

// Define/Docs
var current_theme
var current_style
const default_theme = {
    props: {
        '--b': '0, 0%',
        '--r': '100%, 50%',
        '--color-white': 'var(--b), 100%',
        '--color-black': 'var(--b), 0%',
        '--color-blue': '214, var(--r)',
        '--size14': '1.4rem',
        '--size16': '1.6rem',
        '--weight200': '200',
        '--primary-color': 'var(--color-black)',
        '--primary-button-radius': '8px',
        '--size': 'var(--size14)',
        '--size-hover': 'var(--size)',
        '--current-size': 'var(--size)',
        '--bold': 'var(--weight200)',
        '--color':'var(--primary-color)',
        '--bg-color': 'var(--color-white)',
        '--width': 'unset',
        '--height': '32px',
        '--opacity': '1',
        '--padding': '8px 12px',
        '--border-width': '0px',
        '--border-style': 'solid',
        '--border-color': 'var(--primary-color)',
        '--border-opacity': '1',
        '--border': 'var(--border-width) var(--border-style) hsla(var(--border-color), var(--border-opacity))',
        '--border-radius': 'var(--primary-button-radius)',
        '--fill': 'var(--primary-color)',
        '--fill-hover': 'var(--color-white)',
        '--icon-size': 'var(--size16)',
        '--shadow-xy': '0 0',
        '--shadow-blur': '8px',
        '--shadow-color': 'var(--color-black)',
        '--shadow-opacity': '0',
        '--shadow-opacity-focus': '0.3',
    },
    style: `
        .input-field {
            background-color: pink;
        }
    `,
    classList: 'input-field'
}

i_input.docs = () => {
    return { 
        opts: { value:0, min: 0, max: 100, step: 1, placeholder:'', theme: default_theme },
        current_style
    }
}

// Define input number function
function i_input (opts, protocol) {
    const { value = 0, min = 0, max = 100, step = 1, placeholder = '', theme } = opts
    var current_value = value
    let [int, dec] = split_val(step)
    const el = document.createElement('i-input')
    const shadow = el.attachShadow({mode: 'closed'})
    const input = document.createElement('input')
    current_theme = theme
    update_style(current_theme, shadow)
// ------------------------------------------------
    const myaddress = `i-input-${id++}` // unique
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const names = {}
    const message_id = to => ( outbox[to] = 1 + (outbox[to]||0) )

    const {notify, address} = protocol(myaddress, listen)
    names[address] = recipients['parent'] = { name: 'parent', notify, address, make: message_maker(myaddress) }
    recipients['parent'] = { notify, address, make: message_maker(myaddress) }

    let make = message_maker(myaddress) // @TODO: replace flow with myaddress/myaddress
    notify(make({ to: address, type: 'ready' }))

    function listen (msg) {
        const { head, refs, type, data, meta } = msg // listen to msg
        inbox[head.join('/')] = msg                  // store msg
        const [from, to, msg_id] = head
        const { make } = recipients['parent']
        // todo: what happens when we receive the message
        const name = names[from].name
        if (name === 'parent' && type === 'onchange') {
            current_value = data.value
            input.value = current_value
        }
        if (type === 'help') {
            const { notify: name_notify, make: name_make, address: name_address } = recipients[name]
            name_notify(name_make({ to: name_address, type: 'help', data: { theme: current_theme }, refs: { cause: head }}))
        }
        else if (type === 'theme_update' && data.theme) {
            current_theme = JSON.parse(data.theme.replace(/\n/g, ''))
            update_style(current_theme, shadow)
        }
    }
// ------------------------------------------------
    set_attributes(el, input)
    shadow.append(input)
    // handle events go here
    input.onwheel = (e) => e.preventDefault()
    input.onblur = (e) => handle_blur(e, input) // when element loses focus
    // Safari doesn't support onfocus @TODO use select()
    input.onclick = (e) => handle_click(e, input)
    input.onfocus = (e) => handle_focus(e, input)
    input.onkeydown = (e) => handle_keydown_change(e, input)
    input.onkeyup = (e) => handle_keyup_change(e, input)
    input.onwheel = (e) => handle_wheel(e, input)
// ---------------------------------------------------------------
    // all set attributes go here
    function set_attributes (el, input) {
        input.type = 'number'
        input.name = myaddress
        input.value = value
        input.placeholder = placeholder
        input.min = min
        input.max = max
        // properties
        input.setAttribute('aria-myaddress', 'input')
    }
    function increase (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = split_val(step)
        let [val_i, val_d] = split_val(input.value)
        var new_val_d = Number(val_d) + Number(step_d)
        var new_val_i = Number(val_i) + Number(step_i)
        const d_places = step_d > val_d ? step_d.length : val_d.length
        const d_full = Math.pow(10, d_places)
        if (new_val_d >= d_full) {
            new_val_d = new_val_d - d_full
            new_val_i = new_val_i + 1
        }
        let new_val = new_val_d === 0 ? `${new_val_i}` : `${new_val_i}.${new_val_d}`
        input.value = new_val > max ? max.toString() : new_val
        current_value = input.value
        console.log('step:', step_i, step_d);
        console.log('val:', val_i, val_d);
        notify( make({to: address, type: 'onchange', data: { value: current_value }}))
    }
    function decrease (e, input, val) {
        e.preventDefault()
        let [step_i, step_d] = split_val(step)
        let [val_i, val_d] = split_val(val)
        let step_len = step_d.length
        let val_len = val_d.length
        var new_val_d = Number(val_d) - Number(step_d)
        var new_val_i = Number(val_i) - Number(step_i)
        const d_places = step_d > val_d ? step_d.length : val_d.length
        const d_full = Math.pow(10, d_places)
        if (new_val_d <= 0) {
            new_val_d = new_val_d === 0 ? 0 : d_full + new_val_d
            new_val_i = new_val_i - 1
        }
        let new_val = new_val_d === 0 ? `${new_val_i}` : `${new_val_i}.${new_val_d}`
        input.value = new_val < min ? min.toString() : new_val
        current_value = input.value
        console.log('step:', step_i, step_d);
        console.log('val:', val_i, val_d);
        notify(make({to: address, type: 'onchange', data: { value: current_value }}))
    }
    // input click event
    function handle_click (e, input) {
        e.target.select()
    }
    // input focus event
    function handle_focus (e, input) {}
    // input blur event
    function handle_blur (e, input) {
        if (input.value === '') return
        notify(make({to: address, type: 'onblur', data: { value: current_value }}))
    }
    // handle scroll wheel
    function handle_wheel (e, input) {
        const target = e.target
        const val = input.value === '' ? 0 : input.value
        let mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"
        if (mousewheelevt === "mousewheel") {
            e.wheelDelta > 0 ? increase(e, input, val) : decrease(e, input, val)
        } else {
            e.deltaY > 0 ?  increase(e, input, val) : decrease(e, input, val)
        }
    }
    // input keydown event
    function handle_keydown_change (e, input) {
        const val = input.value === '' ? 0 : input.value
        const key = e.key
        const code = e.keyCode || e.charCode   
        if (code === 13 || key === 'Enter') input.blur()
        if (code === 38 || key === 'ArrowUp') increase(e, input, val)
        if (code === 40 || key === 'ArrowDown' ) decrease(e, input, val)
    }
    function handle_keyup_change (e, input) {
        const val = input.value === '' ? 0 : input.value
        if (val < min || val > max) e.preventDefault()
        if (val > max) input.value = max
        if (val < min) input.value = min
        current_value = input.value
        notify(make({to: address, type: 'onchange', data: { value: current_value }}))
    }
    // helpers
    function split_val (val) {
        let [i, d] = val.toString().split('.')
        // if (i or d) === undefined, make d euqal to 0
        if (i === '') i = '0'
        if (d === void 0) d = '0'
        return [i, d]
    }
    // style
    // const css = csjs`
    // :root {
    //     --b: 0, 0%;
    //     --r: 100%, 50%;
    //     --color-white: var(--b), 100%;
    //     --color-black: var(--b), 0%;
    //     --color-blue: 214, var(--r);
    //     --size14: 1.4rem;
    //     --size16: 1.6rem;
    //     --weight200: 200;
    //     --primary-color: var(--color-black);
    //     --primary-button-radius: 8px;
    // }
    // `
    function update_style (current_theme, shadow) {
        const { style: custom_style = '', props = {}, grid = {}, classList = '' } = current_theme
        if (current_theme.classList?.length) input.setAttribute('class', current_theme.classList)

        current_style =  `
        :host(i-input) {
          ${Object.keys(default_theme.props).map(key => `${key}: ${props[key] || default_theme.props[key]};`).join('\n')}
          width: var(--width);
          max-width: 100%;
          display: grid;
        }
        input {
            --shadow-opacity: 0;
            text-align: left;
            align-items: center;
            font-size: var(--size);
            font-weight: var(--bold);
            color: hsl( var(--color) );
            background-color: hsla( var(--bg-color), var(--opacity) );
            border: var(--border);
            border-radius: var(--border-radius);
            padding: var(--padding);
            transition: font-size .3s, color .3s, background-color .3s, box-shadow .3s ease-in-out;
            outline: none;
            box-shadow: var(--shadow-xy) var(--shadow-blur) hsla( var(--shadow-color), var(--shadow-opacity));;
            -moz-appearance: textfield;
        }
        :focus {
            --shadow-opacity: var(--shadow-opacity-focus);
            font-size: var(--current-size);
        }
        input::-webkit-outer-spin-button, 
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }
        ${custom_style}
        `
        style_sheet(shadow, current_style)
    }

// ---------------------------------------------------------------
    return el
// ---------------------------------------------------------------
}


},{"csjs-inject":4,"message-maker":24,"support-style-sheet":22}],22:[function(require,module,exports){
module.exports = support_style_sheet
function support_style_sheet (root, style) {
    return (() => {
        try {
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(style)
            root.adoptedStyleSheets = [sheet]
            return true 
        } catch (error) { 
            const inject_style = `<style>${style}</style>`
            root.innerHTML = `${inject_style}`
            return false
        }
    })()
}
},{}],23:[function(require,module,exports){
var inserted = {};

module.exports = function (css, options) {
    if (inserted[css]) return;
    inserted[css] = true;
    
    var elem = document.createElement('style');
    elem.setAttribute('type', 'text/css');

    if ('textContent' in elem) {
      elem.textContent = css;
    } else {
      elem.styleSheet.cssText = css;
    }
    
    var head = document.getElementsByTagName('head')[0];
    if (options && options.prepend) {
        head.insertBefore(elem, head.childNodes[0]);
    } else {
        head.appendChild(elem);
    }
};

},{}],24:[function(require,module,exports){
module.exports = function message_maker (from) {
  let msg_id = 0
  return function make ({to, type, data = null, refs = {} }) {
      const stack = (new Error().stack.split('\n').slice(2).filter(x => x.trim()))
      return { head: [from, to, msg_id++], refs, type, data, meta: { stack }}
  }
}
},{}],25:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":26}],26:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],27:[function(require,module,exports){
(function (__filename){(function (){
const path = require('path')
const filename = path.basename(__filename)
const message_maker = require('message-maker')

module.exports = demo_maker

function demo_maker ({ code = '', node_modules = {} }) {
  var id = 0
  var count = 0
// ---------------------------------------------
  const myaddress = `${__filename}-${id++}`
  const inbox = {}
  const outbox = {}
  const recipients = {}
  const names = {}
  const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

  function make_protocol (name) {
      return function protocol (address, notify) {
          names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
          return { notify: listen, address: myaddress }
      }
  }
  function listen (msg) {
      console.log('New message', { msg })
      const { head, refs, type, data, meta } = msg // receive msg
      inbox[head.join('/')] = msg                  // store msg
      const [from] = head
      if (type === 'help' && outbox[refs.cause.toString()]) {
        const cb = outbox[refs.cause]
        cb(data)
      }
  }
// ---------------------------------------------
  const environment = {
    make_protocol: (...args) => make_protocol(...args),
    document: {
      body: {
        append (...args) {
          display.append(...args)
        },
        set innerHTML (string) {
          display.innerHTML = string
        }
      }
    }
  }
// ---------------------------------------------
  const box_style = `
    padding: 20px;
    margin: 0px;
    background-color: #eee;
    border: none;
    border-radius: 8px;
    font-size: 1.2rem;
    opacity: 70%;
  `
// --------------container--------------------
  const container = document.createElement('div') // @TODO make it a shadow
  container.style = `
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-gap: 1em;
    minmax
    padding: 2em;
  `
  const { documentElement: html, body } = document
// --------------editor--------------------
  let editor = document.createElement('textarea')
  editor.value = code
  editor.style = box_style
  editor.onfocus = event => {
    html.onclick = function blur (event) {
      const el = event.target
      if (el !== editor) {
        html.onclick = undefined
        const _code = editor.value
        execute(_code)
      }
    }
  }
  const execute = make_execute({ environment, node_modules })
// --------------theme input-----------------------------
  let theme_input = document.createElement('textarea')
  // const keys = Object.keys(theme)
  // const pretified_theme = JSON.stringify(theme, null, 2).replace(/\\n/g, '')
  // theme_input.innerHTML = `${pretified_theme}`
  theme_input.style = box_style

// --------------display---------------------------
  const display = document.createElement('div') // @TODO: should probably be shadow dom
  display.style = `
    ${box_style}
    grid-column: 2/3;
    grid-row: 1/3;
  `
// --------------------------------------------------
  container.append(editor)
  container.append(display)
  container.append(theme_input)

  execute(code)

  return container

  function make_execute ({environment = {}, node_modules = {}} = {}) {
    const globalThis = Object.assign(environment, { require })
    // const globalThis = new Proxy(global, {
    //   get (oTarget, sKey) {
    //     if (!sKey in oTarget) throw new ReferenceError(`Uncaught ReferenceError:"${sTarget}" is not defined`)
    //     return oTarget[sKey]
    //   }
    // })
    return execute
    function execute (code) {
      display.innerHTML = ''
      const fn = `;(() => { with (globalThis) { ${code} } })()`
      eval(fn)
      const { notify: name_notify, make: name_make, address: name_address } = recipients['input']
      const help_msg = name_make({ to: name_address, type: 'help' })
      const head = help_msg.head.toString()
      outbox[head] = (data) => {
          theme = data.theme
          const pretified_theme = JSON.stringify(theme, null, 2).replace(/\\n/g, '')
          theme_input.innerHTML = `${pretified_theme}`
      }
      name_notify(help_msg)
      const theme_update_msg = name_make({ to: name_address, type: 'theme_update', data: { theme: theme_input.value } })
      name_notify(theme_update_msg)
    }
    function require (name) {
      const module = node_modules[name]
      if (!module) throw new Error(`unknown module name "${name}"`)
      return module
    }
  }
  
}
}).call(this)}).call(this,"/src/index.js")
},{"message-maker":24,"path":25}]},{},[1]);
