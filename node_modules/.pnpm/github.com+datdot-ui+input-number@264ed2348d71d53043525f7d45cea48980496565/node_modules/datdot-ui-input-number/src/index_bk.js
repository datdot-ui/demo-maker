const message_maker = require('message-maker')
module.exports = input

function input (option, protocol) {
    const {page, flow = 'ui-input', name, body = '', role = 'input', type = 'text', checked = false, disabled = false} = option
    let is_checked = checked
    let is_disabled = disabled
    const send = protocol(get)
    let make = message_maker(`${name} / ${role} / ${flow}`)
    let message = make({type: 'ready', data: body})
    send(message)
    const el = document.createElement('input')
    el.setAttribute('role', role)
    el.setAttribute('type', type)
    el.setAttribute('aria-label', name)
    el.name = name
    el.value = body
    // events
    el.onblur  = (e) => handle_blur(e)
    el.onfocus = (e) => handle_focus(e)
    el.onkeyup = (e) => handle_keyup(e)

    function handle_keyup (e) {
        if (e.keyCode === 13 && e.target.value != '') {
            message = make({to: 'demo', type: 'pressed', data: {input: e.target.value}})
            el.blur()
            return send(message)
        } 
        return false
    }
    function handle_focus (e) {
        message = make({to: 'demo', type: 'focus'})
        send(message)
    }
    function handle_blur (e) {
        const input = e.target.value
        if (input === '') return
        message = make({to: 'demo', type: 'blur', data: {input} })
        send(message)
    }

    function get (msg) {}

    return el
}
