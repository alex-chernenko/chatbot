$(document).ready(function(){

    var nameInput = document.getElementById('userName');
    var nickInput = document.getElementById('userNick');
    var messages = document.getElementById('messages');
    var text = document.getElementById('text');
    var socket = io.connect();
    
   
    $("#enter").click(function(){
        
        userName = nameInput.value;
        userNick = nickInput.value;
        
        var user = {
            name: userName,
            nickname: userNick,
            status: "just appeared"
        };
        socket.emit("validation", user.nickname);
        socket.on('val-',function (data) {
            alert(data);
    })
    socket.on('val+',function (data) {
        alert(data);
        socket.emit("newUser", user);
       socket.emit('user data', user);
       $(".chat").css("visibility","visible");
       $("#authorization").css("visibility","hidden");
    })
        
       
    });
  
    $("#submit").click(function(){
        
        var data = {
            name: userName,
            nickname: userNick,
            text: text.value
        };
        
        text.value = '';
       
        socket.emit('chat message', data);
    });
    
socket.on('chat history',function(msg){
    
            messages.innerHTML = "";
        for (var i in msg) {
            if (msg.hasOwnProperty(i)) {
                var el = document.createElement('li');
                el.innerText = msg[i].name+"(@"+ msg[i].nickname + "): " +msg[i].text;

                if ((msg[i].text).indexOf("@"+userNick) !== -1)
                {
                  
                    el.style.background = "pink";
                }
                messages.appendChild(el);
                if (messages.childElementCount > 100)
                {
                    messages.removeChild(messages.firstChild);
                }
               
                
             }
             
        }
});

socket.on('user data',function(msg){
    users.innerHTML = "";
for (var i in msg) {
    for (key in msg[i]) {
        if (key == "name"){
        var el = document.createElement('li');
        el.innerText = msg[i].name ;
        users.appendChild(el);
        }
        if (key == "nickname"){
            var el2 = document.createElement('li');
            el2.innerText = "(@" +msg[i].nickname + ")";
            el.appendChild(el2);
            }
            if (key == "status"){
                var el3 = document.createElement('li');
                var el4 = document.createElement('li');
                el3.innerText = msg[i].status;
                if (msg[i].status == "offline")
                {
                    el4.style.background = "red";
                }
                if (msg[i].status == "just left")
                {
                    el4.style.background = "pink";
                }
                if (msg[i].status == "online")
                {
                    el4.style.background = "green";
                }
                if (msg[i].status == "just appeared")
                {
                    el4.style.background = "blue";
                }
                 el4.innerText = " ";
                    el4.style.width = "20px";
                    el4.style.height = "20px";
                    
                
                el2.appendChild(el3);
                el3.appendChild(el4);
            }    
            }  
}
});
socket.on('user data2',function(msg){
    users.innerHTML = "";
for (var i in msg) {
    for (key in msg[i]) {
        if (key == "name"){
        var el = document.createElement('li');
        el.innerText = msg[i].name ;
        users.appendChild(el);
        }
        if (key == "nickname"){
            var el2 = document.createElement('li');
            el2.innerText = "(@" +msg[i].nickname + ")";
            el.appendChild(el2);
            }
            if (key == "status"){
                var el3 = document.createElement('li');
                var el4 = document.createElement('span');
                el3.innerText = msg[i].status;
                el2.appendChild(el3);
                el4.innerText = " ";
                    el4.style.width = "20px";
                    el4.style.height = "20px";
                if (msg[i].status == "offline")
                {
                    el4.style.background = "red";
                }
                if (msg[i].status == "just left")
                {
                    el4.style.background = "pink";
                }
                if (msg[i].status == "online")
                {
                    el4.style.background = "green";
                }
                if (msg[i].status == "just appeared")
                {
                    el4.style.background = "blue";
                }
                el3.appendChild(el4);

            }    
            }  
}
});
var timeout;

function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
}

$('#text').keyup(function() {
    console.log('happening');
    typing = true;
    let data = userNick+' typing...'
    socket.emit('typing', data);
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 2000);
});

socket.on('typing', function(data) {
    if (data) {
        console.log(data);
        $('.typing').html(data);
    } else {
        $('.typing').html("");
    }
});


socket.on('chat message', function(msg){
    var el = document.createElement('li');
    el.innerText = msg.name + "(@"+ msg.nickname + ")" + ": " +msg.text;

            if ((msg.text).indexOf("@"+userNick) !== -1)
            {
                
                el.style.background = "pink";
            }
         
    messages.appendChild(el);
    if (messages.childElementCount > 100)
    {
        messages.removeChild(messages.firstChild);
    }  
});



socket.on('disconnected', function(connectionMessage){
    console.log('user disc');
    var el = document.createElement('li');
    el.style.color = "#adadad";
    el.innerText = connectionMessage;
    messages.appendChild(el);
    

});


});