const http=require('http')
const express=require('express')
const mongoose = require('mongoose')
const bodyParser=require('body-parser')
const cors=require('cors')
const  nodemailer = require('nodemailer')
const app=express()
require('dotenv').config()
app.use(bodyParser.json())
app.use(cors())

app.get('/',(req,res)=>{
    res.send('Hello World ..!!!')
})

const rooms=[]

const {Server} =require('socket.io')

const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:'*'
    }
})

const Room=require('./room')

const socketToPeerHashMap={} 
let share_id=null;
io.on('connection',(socket)=>{
    socket.emit('get:peerId')
   /// console.log('connected') 
  //  console.log(socket.id); 
   console.log("room array ki length",rooms.length)
    socket.on('send:peerId',(peerId)=>{
        //console.log('lets see if it is set--',peerId)
        socketToPeerHashMap[socket.id]=peerId
    }) 
        
    socket.on('send-message',(message,roomId,currentUserId,name)=>{
       //  console.log(message)
       // socket.broadcast.emit('receive-message',message);
     //  console.log("roomID",roomId)
      // console.log("backend message",message)
        socket.broadcast.emit('receive-message',message,roomId,currentUserId,name) 
       
    }) 

   socket.on('user-screen-share-id',(share_id)=>{
       // console.log("i am sharing my screen and my id is ",share_id);
        share_id=share_id;
        socket.broadcast.emit("id-of-person-sharing-screen",share_id);
       // console.log("i am server and send your userid")
   })

   socket.on("user-stop-sharing",(roomid)=>{
       socket.broadcast.emit("stop-sharing",roomid)
     //  console.log("user-stop-sharing")
   }) 
    socket.on('raise-hand',(name,roomId)=>{
       // console.log("i have share hand",name)
       // console.log("with room id",roomId)
        socket.broadcast.emit('receive-raise-hand',name,roomId) 
    })
    socket.on('hand-down',(name,roomId)=>{
       // console.log("i have down the hand",name)
        //console.log("with room id",roomId)
        socket.broadcast.emit('receive-hand-down',name,roomId) 
    })
    socket.on('disconnect',()=>{
        //console.log('disconnect')
        const peerId=socketToPeerHashMap[socket.id]
        //console.log("peereeeer___id",peerId)
        io.emit("user:left",peerId)
       // console.log("roooooooooooooomssssssssss",rooms)
        //const roomIndex = rooms.findIndex(existingRoom =>{ existingRoom.participants.includes(peerId)});
        let roomIndex=-1;
        for(var i=0;i<rooms.length;i++)
        {
            let existingRoom=rooms[i]
            for(var j=0;j<existingRoom.participants.length;j++)
            {
                if(existingRoom.participants[j].id===peerId)
                {
                    roomIndex=i;
                    
                }
            }
        }
        //console.log('room Index is - ',roomIndex)
            if (roomIndex > -1) {
                let room = rooms[roomIndex]
                room.removeParticipants(peerId);
                rooms[roomIndex] = room
            }
    })
  
     
})

mongoose.connect(process.env.MONGO_URL,{useUnifiedTopology:true,useNewUrlParser:true})
.then(()=>{
    console.log('database connection establish')
})
.catch((e)=>{
  console.log(e) 
})


require("./auth/auth-route")(app)

app.post('/rooms',(req,res)=>{
    const newRoom=new Room(req.body.author)
    rooms.push(newRoom)
    res.json({
        roomId:newRoom.roomId
    })
})

app.get('/rooms/:roomId',(req,res)=>{
    const room =rooms.find((existingRoom)=>existingRoom.roomId===req.params.roomId)
    res.json({...room})
})

app.post('/rooms/:roomId/join',(req,res)=>{
  
    const { params, body } = req;
  //  console.log(",,,,,,,,,,,,,,,,,,,,body,,,,,,,,,,,,,,,,,,",body)
    const roomIndex = rooms.findIndex(existingRooms => existingRooms.roomId === params.roomId);
    let room = null;
    
    if (roomIndex > -1) {
        room = rooms[roomIndex]
        room.addParticipants(body.participant);
        rooms[roomIndex] = room
    }
    res.json({ ...room.getInfo() })


})

///api to frtch name of person who called

app.post('/name',(req,res)=>{
    const room =rooms.find((existingRoom)=>existingRoom.roomId===req.body.roomId)
   // console.log("----------------req.body----------------",req.body)
    for(let i=0;i<room.participants.length;i++)
    {
        if(room.participants[i].id===req.body.peerId)
        {
           // console.log("user found we can call")
            return res.json(room.participants[i].name)
        }
    }
})

app.post('/api/send',(req,res)=>{
    let transporter = nodemailer.createTransport({
     host:'smtp.gmail.com',
     port:465,
     secure:true,
     service:'gmail',
     auth:{
         user:process.env.user,
         pass:process.env.pass
     }
    })
    var x = req.body.to.split(',');
    for(var i=0;i<x.length;i++)
    { 
        console.log(x[i])
        var options={
           to:x[i].trim(),
           subject:"Link to join teams",
           html:"<h3>"+req.body.from+"</h3><br></br><h2>Joining Link</h2>"+"<h3 style='font-weight:bold'>"+req.body.url+"</h3>"
        }
        transporter.sendMail(options,(error,info)=>{
           if(error)
           {
               return console.log(error)
           }
          //// console.log('Message sent : %s',info.messageId);
          // console.log('Preview URL: %s',nodemailer.getTestMessageUrl(info));
          /// console.log('link sent')
       })
        
    }
    console.log(req.body)
})




const PORT=process.env.PORT||5000;
server.listen(PORT,()=>{
    console.log("server is live ")
}) 