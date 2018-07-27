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
        
          io.emit('chat message', msg);
         if (proxy.text.indexOf("@bot") == 0)
         { const typecheck = new AnswerType().check(proxy.text);
            const botAnwer = new BotAnswer().answer(typecheck, proxy.text);
            const botMessage = botAnwer.apply(proxy.text);
            messages.push(botMessage);
            io.emit('chat message', botMessage);
         }
         //Proxy
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
  //Factory
  
  class WeatherAnswer {
    constructor (message) {
      this.type = 'Weather'
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
    apply (message) {
        for (let k in currency)
        {for (let i in currency)
            {
               if ((message.indexOf(currency[k]) !=-1) && 
               (message.indexOf(currency[i]) !=-1) && 
               (k != i) &&
               ((message.indexOf(currency[k])>(message.indexOf(currency[i])))))
               {
                if (currency[i] == "dollar")
                  {let amount = ((message.match(/\d+( dollar)/))[0].match(/\d+/))[0];
                    if (currency[k] == "euro")
                    {let dollarToEuro = 0.86
                    return {name: "Tom", nickname:"IamTheBotHere", text:"Ok "+amount+" dollars"+" = "+(amount*dollarToEuro)+" euro"}
                    }
                    if (currency[k] == "hryvnia")
                    {
                        let dollarToHryvnia = 26.78
                    return {name: "Tom", nickname:"IamTheBotHere", text:"Ok "+amount+" dollars"+" = "+(amount*dollarToHryvnia)+" hryvnia"}
                    }
                  }
                if (currency[i] == "euro")
                {let amount = ((message.match(/\d+( euro)/))[0].match(/\d+/))[0];
                    if (currency[k] == "dollar")
                    {let euroToDollar = 1.16
                    return {name: "Tom", nickname:"IamTheBotHere", text:"Ok "+amount+" euros"+" = "+(amount*euroToDollar)+" dollar"}
                    }
                    if (currency[k] == "hryvnia")
                    {
                        let euroToHryvnia = 31.17
                    return {name: "Tom", nickname:"IamTheBotHere", text:"Ok "+amount+" euros"+" = "+(amount*euroToHryvnia)+" hryvnia"}
                    }
                  }
                if (currency[i] == "hryvnia")
                {let amount = ((message.match(/\d+( hryvnia)/))[0].match(/\d+/))[0];
                    if (currency[k] == "euro")
                    {let hryvniaToEuro = 0.032
                    return {name: "Tom", nickname:"IamTheBotHere", text:"Ok "+amount+" hryvnias"+" = "+(amount*hryvniaToEuro)+" euro"}
                    }
                    if (currency[k] == "dollar")
                    {
                        let hryvniaToDollar = 0.037
                    return {name: "Tom", nickname:"IamTheBotHere", text:"Ok "+amount+" hryvnias"+" = "+(amount*hryvniaToDollar)+" dollar"}
                    }
                  }
                else {
                    return {name: "Tom", nickname:"IamTheBotHere", text:"I can`t read your thoughts, please correct your question!"}
                }
               }
            }
        }
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