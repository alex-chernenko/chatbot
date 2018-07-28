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
         {  
            const typecheck = new AnswerType().check(proxy.text);
            const botAnswer = new BotAnswer().answer(typecheck, proxy.text);
            const botMessage = botAnswer.apply(proxy.text);
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

const notes = [];
const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","today","tomorrow"]
const city = ["Lviv", "Kyiv", "Kharkiv", "Odessa", "Dnipro"]
const currency = ["dollar", "euro", "hryvnia"]
const advices = ["Listen to some music","Just go for a walk","Wowowo, all will be ok","Just DO IT!!!","Yep, life is strange"]
const quotes = ["Train yourself to let go of everything you fear to lose. - Yoda", "If you cannot do great things, do small things in a great way. - Napoleon Hill",
"Honesty is the first chapter in the book of wisdom. - Thomas Jefferson", "The journey of a thousand miles begins with one step. - Lao Tzu", "If opportunity doesn't knock, build a door. - Milton Berle"]

class AnswerType {
    check(message) {
         let type = "notype";
        for (let i in days)
            {for (let k in city)
                if ((message.indexOf("What the weather") !=-1) && (message.indexOf(city[k]) !=-1) && (message.indexOf(days[i]) !=-1))
                    {type = 'WeatherAnswer'}}
        for (let k in currency)
            {if ((message.indexOf(currency[k]) != -1) && (message.indexOf("Convert") != -1))
                { type = 'MoneyExchangeAnswer'}}
                
        if (message.indexOf('show quote') != -1)
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
        else if (type === "notype")
        {
            return answerMessage = new NoTypeAnswer(message)
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
  //Facade
  
  class NotesAnswer {
    constructor () {
      this.type = 'Notes'
    }
    apply (message)
    {
        if (message.indexOf("note") != -1)
        {
            
            if ((message.match(/(Show note)/)) != null)
            {
                if ((message.match(/(Show note list)/)) != null)
                {   
                    if (notes == "")
                    {
                        return {name: "Tom", nickname:"IamTheBotHere", text:"hmmm, no notes were added"}
                    }
                    else
                    { let allNotes = "Your Notes:"
                        for (let i=0; i<notes.length; i++)
                        {
                          let note = "title: "+notes[i].title+" body: "+ notes[i].body
                          allNotes = allNotes + note;
                        }
                        return {name: "Tom", nickname:"IamTheBotHere", text:allNotes}
                    }
                }
                else
                {
                let titleStart = message.indexOf("title:")+7;
                let noteTitle = message.slice(titleStart);
                for (let i=0; i<notes.length; i++)
                        {
                            if (notes[i].title == noteTitle)
                            {  
                                
                                return {name: "Tom", nickname:"IamTheBotHere", text:"title: "+notes[i].title+", body:"+notes[i].body}
                               }
                        
                        }
                }
            }
            if ((message.match(/(Save note title:)/)) != null)
            {   
                let titleStart = message.indexOf("title:")+7;
                let bodyStart = message.indexOf(", body")+7;
                let noteTitle = message.slice(titleStart, bodyStart-7);
                let noteBody = message.slice(bodyStart);
                const Note = {
                    title: noteTitle,
                    body: noteBody
                }
                notes.push(Note);
                return {name: "Tom", nickname:"IamTheBotHere", text:"Your note was saved!"}
                
            }
            if ((message.match(/(Delete note)/)) != null)
            {
                let titleStart = message.indexOf("title:")+7;
                let noteTitle = message.slice(titleStart);
                for (i=0; i<notes.length; i++)
                 {
                     if (notes[i].title == noteTitle)
                     {  
                         notes.splice(i,1);
                         return {name: "Tom", nickname:"IamTheBotHere", text:"Note with title: "+noteTitle+" was deleted"}
                        }
                 }
            }
        }
    }
    
  }

  class NoTypeAnswer {
    constructor (message) {
      this.type = 'NoType'
    }
    apply (message)
    {   
        return {name: "Tom", nickname:"IamTheBotHere", text:"I can`t read your thoughts, please correct your question!"}
    }
    
  }
  class AdviseAnswer {
    constructor () {
      this.type = 'Advise'
    }
    apply (message) {
        if (message.indexOf("? #@)₴?$0") != -1)
        {  
            let adviceText = advices[getRandomInt(0,4)]
            return {name: "Tom", nickname:"IamTheBotHere", text: adviceText}
    }
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  class QuotesAnswer {
    constructor () {
      this.type = 'Quotes'
    }
    apply(message) {
        if (message.indexOf('show quote') != -1)
        {
            let quoteText = quotes[getRandomInt(0,4)]
            return {name: "Tom", nickname:"IamTheBotHere", text: quoteText}
        }
    }
  }