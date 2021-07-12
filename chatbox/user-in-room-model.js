//collection of all the rooms user has joined
const mongoose=require('mongoose')
const Schema=mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true 
    },
    rooms:[{
        name:{
                type:String
        },
        roomId:{
            type:String
        }
    }]
})

module.exports = mongoose.model('UserInRooms',userSchema)