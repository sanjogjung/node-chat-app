const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = document.querySelector("input")
const $messageFormButton = document.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

// Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML
const $locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const $sideBarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const params = new URLSearchParams(location.search)
const username = params.get('username')
const room = params.get('room')

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    // container height
    const containerHeight = $messages.scrollHeight
    console.log(newMessageHeight)

    // how far i have scrolled
    //scrollTop: how much from top i have scrolled
    // we need to know how much from bottom we have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeEnd', html)
    autoScroll()
}
)

socket.on('locationMessage', (message)=> {
    const html = Mustache.render($locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeEnd", html)
    autoScroll()

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sideBarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})
$messageForm.addEventListener('submit',(event) => {
    event.preventDefault()
    $messageFormButton.disabled = true
    const message = event.target.elements.message.value
    socket.emit("sendMessage", message, (error) => {  // socket.emit ----- sends to all the connected users
        $messageFormButton.disabled = false
        $messageFormInput.value=''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }

        console.log("Message delivered!")
    })
})


$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    
    $sendLocationButton.disabled=true
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {latitude: position.coords.latitude, longitude: position.coords.longitude}
        socket.emit("sendLocation", location, () => {
            $sendLocationButton.disabled=false
            console.log("Location shared!")
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href="/"
    }

})