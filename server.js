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

    //chatbox page
    socket.on('join-room',(roomId)=>{
        socket.join(roomId)
    })


   console.log("room array ki length",rooms.length)
    socket.on('send:peerId',(peerId)=>{
       
        socketToPeerHashMap[socket.id]=peerId
    }) 
        
    socket.on('send-message',(message,roomId,currentUserId,name)=>{
   
        socket.broadcast.emit('receive-message',message,roomId,currentUserId,name) 
       
    }) 
    socket.on('send',(data)=>{
        console.log('message sent-',data)
        socket.broadcast.emit('recieve-mess',data)
    })

   socket.on('user-screen-share-id',(share_id)=>{
      
        share_id=share_id;
        socket.broadcast.emit("id-of-person-sharing-screen",share_id);
       
   })

   socket.on("user-stop-sharing",(roomid)=>{
       socket.broadcast.emit("stop-sharing",roomid)
   
   }) 
    socket.on('raise-hand',(name,roomId)=>{
     
        socket.broadcast.emit('receive-raise-hand',name,roomId) 
    })
    socket.on('hand-down',(name,roomId)=>{
    
        socket.broadcast.emit('receive-hand-down',name,roomId) 
    })
    socket.on('disconnect',()=>{
       
        const peerId=socketToPeerHashMap[socket.id]
    
        io.emit("user:left",peerId)
       
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
            if (roomIndex > -1) {
                let room = rooms[roomIndex]
                room.removeUser(peerId);
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

require("./chatbox/routes-chatbox")(app)
require("./auth/auth-route")(app)
require("./feedback/feedback_api")(app)

app.post('/rooms',(req,res)=>{
    console.log(req.body)
    const newRoom=new Room(req.body)
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
 
    const roomIndex = rooms.findIndex(existingRooms => existingRooms.roomId === params.roomId);
    let room = null;
    console.log(roomIndex)
    if (roomIndex > -1) {
        room = rooms[roomIndex]
        room.addUser(body.participant);
        rooms[roomIndex] = room
        console.log(room.getInfo())
        res.json({ ...room.getInfo() })
    }
   


})


app.post('/name',(req,res)=>{
    const room =rooms.find((existingRoom)=>existingRoom.roomId===req.body.roomId)
    for(let i=0;i<room.participants.length;i++)
    {
        if(room.participants[i].id===req.body.peerId)
        {
           
            return res.json(room.participants[i].name)
        }
    }
})

app.post('/api/send',(req,res)=>{
    let sender = nodemailer.createTransport({
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
        sender.sendMail(options,(error,info)=>{
           if(error)
           {
               return console.log(error)
           }
       })
        
    }
    console.log(req.body)
})




const PORT=process.env.PORT||5000;
server.listen(PORT,()=>{
    console.log("server is live ")
}) 