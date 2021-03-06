//storing roomId with participants present in those room
const mongoose=require('mongoose')
const Schema=mongoose.Schema

const roomIdSchema = new Schema({
 
   roomId:{
        type:String,
        required:true 
    },
    name:{
        type:String,
        required:true
    },
    participants:[{
        email:{
            type:String
        },
        ParticipantsName:{
            type:String
        }
    }]
})

module.exports = mongoose.model('RoomIdModel',roomIdSchema)