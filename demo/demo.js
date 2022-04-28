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


