const path = require('path')
const filename = path.basename(__filename)
const message_maker = require('message-maker')
const input_number = require('datdot-ui-input-number')

var id = 0
var count = 0

let theme = { style: `
.field-input {
    width: 100%;
    border: 1px solid rgba(187, 187, 187, 1);
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
    outline: none;
}
.field-input:focus, 
.field-input:focus-within {
    border-color: rgba(94, 176, 245, 1);
}
.field-input::selection {
    background-color: rgba(188, 224, 253, 1);
}
`, classList: 'field-input' } 

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
    // send back ack
}
const box_style = `
  display: flex;
  height: 50vh;
  flex-grow: 1;
  padding: 0;
  margin: 0;
  background-color: white;
  border: 2px dotted blue;
`
// --------------container--------------------
const container = document.createElement('div')
container.style = `
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: pink;
  padding: 5px;
`
const { documentElement: html, body }= document
// --------------editor--------------------
let editor = document.createElement('textarea')
editor.value = `
  const input_number = require('datdot-ui-input-number')
  var el = input_number({ value:5, min: 0, max: 100, step: 1, theme }, make_protocol('input'))
  document.body.append(el)
`
editor.style = box_style
editor.onfocus = event => {
  html.onclick = function blur (event) {
    const el = event.target
    if (el !== editor) {
      html.onclick = undefined
      const code = editor.value
      execute(code)
    }
  }
}
// --------------theme-----------------------------
let theme_input = document.createElement('textarea')
const keys = Object.keys(theme)
const pretified_theme = JSON.stringify(theme, null, 2).replace(/\\n/g, '')
theme_input.innerHTML = `${pretified_theme}`
theme_input.style = box_style
// --------------display---------------------------
let el = input_number({ value:5, min: 0, max: 100, step: 1, theme }, make_protocol(`input-${count++}`))
const display = document.createElement('div') // @TODO: should probably be shadow dom
display.style = box_style
display.append(el)
// --------------------------------------------------
container.append(editor)
container.append(theme_input)
container.append(display)

body.append(container)

////////////////
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
const node_modules = {
  'datdot-ui-input-number': input_number,
}

const execute = make_execute({ environment, node_modules })

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
  }
  function require (name) {
    const module = node_modules[name]
    if (!module) throw new Error(`unknown module name "${name}"`)
    return module
  }
}
