var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];
var users = [];
var nicks = ["nickname"];


app.get('/',function(req,res)
{
    res.sendFile(__dirname + '/index.html');

});

app.get('/style.css',function(req,res)
{
    res.sendFile(__dirname + '/style.css');

});
app.get('/script.js',function(req,res)
{
    res.sendFile(__dirname + '/script.js');

});

io.on('connection', function(socket){
    socket.on('user data', function(nick){
        users.push(nick);
        var place = users.length;
        
        io.emit('user data', users);
        
        setTimeout(function(){
            nick.status = "online";
            users.splice(place,1);
         
            
            io.emit('user data', users);
                }, 60000);
     
    });
    socket.on('validation', function (Nick)
    {   var nope = false;
        for (i in nicks)
            {   
                if (nicks[i] == Nick)
                    {socket.emit('val-', "This Nickname already exist");
                     nope = true;
                        break;}}
                if (nope == false) {
                if (Nick.length < 5)
                        {socket.emit('val-', "Too short, Must be 5 symbols or more"); }
                if (Nick.length > 12)
                        {socket.emit('val-', "Too long, Must be 12 symbols or less"); }
                if ((Nick.length < 12) && (Nick.length > 5)) {
                        socket.emit('val+', "It`s Ok Welcome!");
                         nicks.push(Nick) 
        
                    }
                                     }
        

});
    socket.on('newUser',function (user) {
        socket.username = user.name;
        socket.usernick = user.nickname;
        socket.emit('chat history', messages);
        
   });
   socket.on('disconnect', function () {
    var connectionMessage = socket.usernick + " Disconnected from Chat";
     io.emit('disconnected', connectionMessage);
     for (var user in users)
     {
         if (users[user].nickname == socket.usernick)

         { 
              var place = users.indexOf(users[user]);
            var updatedUser = users[user];
            updatedUser.status = "just left"
            users.splice(place,1,updatedUser);
            io.emit('user data2', users);
            setTimeout(function(){
                updatedUser.status = "offline";
                
                users.splice(place,1,updatedUser);
                io.emit('user data2', users);
                    }, 60000);
         }
     }
     
     
  });
    socket.on('chat message', function(msg){
        messages.push(msg);
        const proxy = new Proxy(msg, {
            get(target, prop) {
              return target[prop];
            }
          });
        
         if (proxy.text.indexOf("@bot") == 0)
         { const typecheck = new AnswerType().check(proxy.text);
            const botMessage = new BotAnswer().answer(typecheck, proxy.text)
            // messages.push(botMessage.apply(proxy.text));
            
            messages.push(botMessage.apply(proxy.text));
                }
        
        io.emit('chat message', msg);
    });
   

    
   
    socket.on('disconnect', function () {
        socket.emit('user disconnected');
      });
      socket.on('typing', function (data) {
       
        socket.broadcast.emit('typing', data);
      });




});



http.listen(3000, function(){
    console.log('listening on 3000');
});

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","today","tomorrow"]
const city = ["Lviv", "Kyiv", "Kharkiv", "Odessa", "Dnipro"]
const currency = ["dollar", "euro", "hryvnia"]
class AnswerType {
    check(message) {
         let type = "notype";
        console.log(message);
        for (let i in days)
            {for (let k in city)
                if ((message.indexOf("What the weather") !=-1) && (message.indexOf(city[k]) !=-1) && (message.indexOf(days[i]) !=-1))
                    {type = 'WeatherAnswer'}}
        for (let k in currency)
            {if ((message.indexOf(currency[k]) != -1) && (message.indexOf("Convert") != -1))
                { type = 'MoneyExchangeAnswer'}}
                
        if (message.indexOf('QuotesAnswer') != -1)
             type = 'QuotesAnswer'      
        if (message.indexOf("? #@)₴?$0") != -1)
             type = 'AdviseAnswer'
        if (message.indexOf("note") != -1)
             {type = 'NotesAnswer'}
        return type;
            }
}
class BotAnswer {
    answer (type, message) {
      
      if (type === 'WeatherAnswer') {
          var answerMessage = new WeatherAnswer(message)
        
      } else if (type === 'MoneyExchangeAnswer') {
        var answerMessage = new  MoneyExchangeAnswer(message)
      } else if (type === 'NotesAnswer') {
        return answerMessage = new NotesAnswer(message)
      } else if (type === 'AdviseAnswer') {
        return answerMessage = new AdviseAnswer(message)
      }
       else if (type === 'QuotesAnswer') {
        return answerMessage = new QuotesAnswer(message)
      }
     return answerMessage
    }
  }
  
  class WeatherAnswer {
    constructor (message) {
      this.type = 'Weather'
      this.question = message; 
    }
    apply (message) {
        for (let i in days)
            {for (let k in city)
                if ((message.indexOf("What the weather") !=-1) && (message.indexOf(city[k]) !=-1) && (message.indexOf(days[i]) !=-1))
                    return {name: "Tom", nickname:"IamTheBotHere", text:"the weather will be cold "+ days[i]+" in "+city[k]};
                }
            }
    
  }
  
  class MoneyExchangeAnswer {
    constructor () {
      this.type = 'MoneyExchange'
    }
  }
  
  class NotesAnswer {
    constructor () {
      this.type = 'Notes'
    }
  }
  class AdviseAnswer {
    constructor () {
      this.type = 'Advise'
    }
  }
  
  class QuotesAnswer {
    constructor () {
      this.type = 'Quotes'
    }
  }