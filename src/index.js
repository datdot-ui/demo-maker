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