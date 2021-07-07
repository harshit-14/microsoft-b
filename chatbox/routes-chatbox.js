const RoomIdModel = require("./room-id-model")
const UserInRooms= require("./user-in-room-model")
const RoomMessages=require('./chat-in-rooms-model')
const roomIdModel = require("./room-id-model")
module.exports=(app)=>{

    app.post("/chatbox/createRoom",(req,res)=>{
     const {name,email,roomname,roomId} =req.body
      const user=new RoomIdModel({
       roomId,
       name:roomname,
       participants:[
            {
                email
            }
        ]
      })
       user.save()
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
                        .then((success)=>{
                           return  res.json(success)
                        })
                        .catch((err)=>{
                            return res.json(err)
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
              //return res.status(200).json(data)  
            })
            .catch(err=>{
                res.json(err)
            })
    })
    
    app.post("/chatbox/joinRoom",(req,res)=>{
        const {name,email,roomId} = req.body;
        console.log(req.body)
        RoomIdModel.findOne({roomId})
        .then(room=>{
         const roomname=room.name
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
                      room.participants.push({
                          email
                      })
                      room.save()
                      .then(success=>{
                          return res.status(200).json({
                              data,
                              success
                            })
                      })
                      .catch(err=>{
                          console.log("111111111111111111111")
                          return res.status(400).json(err)
                      })
                  })
                  .catch(err=>{
                    console.log("22222222222222222")
                      return res.status(400).json(err)
                  })
              }
              else
              {
                  const data=new Partipant({
                      name,
                      email,
                      rooms:[
                          {
                            roomId,
                            name:roomname    
                          }
                      ]
                  })
                  data.save()
                  .then(participant=>{
                      room.participant.push({
                          email
                      })
                      room.save()
                      .then(success=>{
                          return res.status(200).json({
                              participant,
                              success
                          })
                      })
                      .catch(err=>{
                          return res.status(400).json(err)
                      })
                      return res.status(200).json(participant)
                  })
                  .catch(err=>{
                   // console.log("aaaaaaaaaaaaaaaaaa")
                      return res.status(500).json(err)
                  })
              }
          })
          .catch(err=>{
             // console.log("hhhhhhhhhhhhhhhhhhhh")
              return res.status(400).json(err)
          })
        })
        .catch(err=>{
            //console.log("kkkkkkkkkkkkkkkkkkkk")
            return res.status(400).json({msg:"no room found"})
        })
    })

    app.post('/newMess',(req,res)=>{
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
    app.get('/allMess/:roomId',(req,res)=>{
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
  
    app.get('/personDetails/:email',(req,res)=>{
        const {email}=req.params
        UserInRooms.findOne({email})
                    .then(data=>{
                        return res.json(data)
                    })
                    .catch(err=>{
                        res.json(err)
                    })
    })

    app.get('/roomDetails/:roomId',(req,res)=>{
        const {roomId}=req.params
        RoomIdModel.findOne({roomId}) 
            .then(data=>{
                return res.json(data)
            })
            .catch(err=>{
                res.json(err)
            })
    })

}


