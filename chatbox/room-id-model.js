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
        }
    }]
})

module.exports = mongoose.model('RoomIdModel',roomIdSchema)