
let data = {}
console.log(data)

const login = () => {
    let username = $('#login_name').val();
    data['username'] = username;
    data['user_id'] = Math.floor((1 + Math.random() * 0x10000)).toString(16).substring(1);
    if (data) {
        $('#login').hide();
        $('#after-login').show();
        $('#me').html(`
                <div class="me">
                   ${data.username}
                </div>
                  `);
        socket.emit('loggedin', data);
    }
}

socket.on('updateUserList', userList => {
    let loggedInUser = data
    $('#user-list').html('<ul></ul>');
    userList.forEach(item => {
        if (loggedInUser.user_id != item.user_id) {
            $('#user-list ul').append(`<li data-id="${item.user_id}" onclick="createRoom('${item.user_id}')">${item.username}</li>`)
        }
    });

});

const createRoom = (id) => {
    let loggedInUser = data
    let room = Date.now()
    room = room.toString()
    console.log(room)
    socket.emit('create', { room: room, userId: loggedInUser.userId, withUserId: id });
    console.log(openChatWindow(room));
}

const openChatWindow = (room) => {
    if (room) {
        $('#after-login').append(`
        <div class="chat-window" id="${room}">
            <div class="body"></div>
            <div class="footer">
                <input type="text" class="messageText"/><button onclick="sendMessage('${room}')">Send</button>
            </div>
        </div>
        `)
    }
}


const sendMessage = (room) => {
    let loggedInUser = data
    let message = $('#' + room).find('.messageText').val();
    $('#' + room).find('.messageText').val(' ');
    socket.emit('message', { room: room, message: message, from: loggedInUser });
    sendMyMessage(room, loggedInUser, message)
}

const sendMyMessage = (chatWidowId, fromUser, message) => {
    let loggedInUser = data
    let meClass = loggedInUser.user_id == fromUser.user_id ? 'me' : '';

    $('#after-login').find(`#${chatWidowId} .body`).append(`
     <div class="chat-text ${meClass}">
 <div>
<span class="message">${message}<span>
 </div>
 </div>
 `);
}

socket.on('invite', function (data) {
    socket.emit("joinRoom", data)
});


socket.on('message', function (msg) {
    //If chat window not opened with this roomId, open it
    if (!$('#after-login').find(`#${msg.room}`).length) {
        openChatWindow(msg.room)
    }
    sendMyMessage(msg.room, msg.from, msg.message)
});

