//storing messages in chat room (adapt feature)
const mongoose=require('mongoose')
const Schema=mongoose.Schema

const chatboxSchema=new Schema({
    roomId:{
        type:String
    },
    message:[{
        email:{
            type:String
        },
        name:{
            type:String
        },
        mess:{
            type:String 
        },
        time:{
            type:String,
        }
    }]
})

module.exports=mongoose.model('RoomMessages',chatboxSchema)