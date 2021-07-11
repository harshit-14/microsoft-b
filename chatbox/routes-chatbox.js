const RoomIdModel = require("./room-id-model")
const UserInRooms= require("./user-in-room-model")
const RoomMessages=require('./chat-in-rooms-model')
module.exports=(app)=>{

    app.post("/chatbox/createRoom",(req,res)=>{
     const {name,email,roomname,roomId} =req.body
     console.log(req.body)
      const team=new RoomIdModel({
       roomId,
       name:roomname,
       participants:[
            {
                email,
                ParticipantsName:name
            }
        ]
      })
       team.save()
            .then(data=>{
                UserInRooms.findOne({email})
                .then((data)=>{
                    if(data)
                    {
                        data.rooms.push({
                            roomId,
                            name:roomname
                        })
                        data.save()
                        .then((result)=>{
                           return  res.json(result)
                        })
                        .catch((e)=>{
                            return res.json(e)
                        })
                    }
                    else
                    {
                        const newParti=new UserInRooms({
                            name,
                            email,
                            rooms:[
                                {
                                    roomId,
                                    name:roomname
                                }
                            ]
                        })
                        newParti.save()
                        .then(result=>{
                           return res.json(result)
                        })
                        .catch(e=>{
                            return res.json(e)
                        })
                    }
                  
                })
                .catch(e=>{
                    return res.json(e)
                })
             
            })
            .catch(e=>{
                res.json(e)
            })
    })
    
    app.post("/chatbox/joinRoom",(req,res)=>{
        const {name,email,roomId} = req.body;
        RoomIdModel.findOne({roomId})
        .then(team=>{
         const roomname=team.name
         UserInRooms.findOne({email})
          .then(user=>{
              if(user)
              {
                  console.log(user)
                  user.rooms.push({
                      roomId,
                      name:roomname
                  })
                  user.save()
                  .then(data=>{
                      team.participants.push({
                          email,
                          ParticipantsName:name
                      })
                      team.save()
                      .then(result=>{
                          return res.status(200).json({result})
                      })
                      .catch(e=>{
                          return res.status(400).json(e)
                      })
                  })
                  .catch(e=>{
                      return res.status(400).json(e)
                  })
              }
              else
              {
                  const newUser=new UserInRooms({
                      name,
                      email,
                      rooms:[
                          {
                            roomId,
                            name:roomname    
                          }
                      ]
                  })
                  newUser.save()
                  .then(participant=>{
                      team.participant.push({
                          email,
                          ParticipantsName:name
                      })
                      team.save()
                      .then(result=>{
                          return res.status(200).json({result})
                      })
                      .catch(e=>{
                          return res.status(400).json(e)
                      })
                      return res.status(200).json(participant)
                  })
                  .catch(e=>{
                  
                      return res.status(500).json(e)
                  })
              }
          })
          .catch(e=>{
            
              return res.status(400).json(e)
          })
        })
        .catch(e=>{
           
            return res.status(400).json({msg:"no room found"})
        })
    })

    app.post('/chatbox/messArrived',(req,res)=>{
        const {roomId,name,mess,email}=req.body;
        RoomMessages.findOne({roomId})
            .then(data=>{
                if(data)
                {
                    data.message.push({
                        email,
                        name,
                        mess
                    })
                    
                    data.save()
                        .then(success=>{
                            return res.json(success)
                        })
                        .catch(err=>{
                            return res.status(400).json(err)
                        })
                }
                else
                {
                    const newChat=new RoomMessages({
                        roomId,
                        message:[
                            {
                                email,
                                name,
                                mess,
                                time:new Date()
                            }
                        ]
                    })
                    newChat.save()
                        .then(success=>{
                            return res.json(success)
                        })
                        .catch(err=>{
                            return res.json(err)
                        })
                }
            })
            .catch(err=>{
                return res.json(err)
            })

    })
    app.get('/chatbox/mess/:roomId',(req,res)=>{
        const {roomId}=req.params
        RoomMessages.findOne({roomId})
            .then(result=>{
                return res.json(result);
            })
            .catch(err=>{
                console.log(err)
                return res.json(err)
            })
    })
  
    app.get('/chatbox/userInfo/:email',(req,res)=>{
        const {email}=req.params
        UserInRooms.findOne({email})
                    .then(data=>{
                        return res.json(data)
                    })
                    .catch(err=>{
                        res.json(err)
                    })
    })
    app.get('/chatbox/roomInfo/:roomId',(req,res)=>{
        const {roomId}=req.params
        RoomIdModel.findOne({roomId}) 
            .then(data=>{
                return res.json(data)
            })
            .catch(err=>{
                res.json(err)
            })
    })
    app.post('/chatbox/leaveroom',(req,res)=>{
        const {email,name,roomId} = req.body
      
        
        UserInRooms.find(email)
        .then((data)=>{
            console.log(data[0].rooms.length);
            for(let i=0;i<data[0].rooms.length;i++)
            {  
                if(data[0].rooms[i].roomId==roomId.roomId)
                {
                   console.log("mil gyi");
                   data[0].rooms.splice(i,1)
                   data[0].save()
                   RoomIdModel.find(roomId)
                   .then((room)=>{
                    
                      for(let j=0;j<room[0].participants.length;j++)
                      {
                          console.log(room[0].participants[j].email)
                          console.log(email)
                          if(room[0].participants[j].email==email.email)
                          {
                           
                            room[0].participants.splice(j,1)
                            room[0].save()
                            return res.json("success")
                          }
                      }
                   })
                   .catch((e)=>console.log(e))
                }
            }
           // console.log(data.rooms.size)
        })
        .catch(e=>console.log(e))
    })
}


