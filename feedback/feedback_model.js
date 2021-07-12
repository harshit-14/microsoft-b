//collection of user response
const mongoose=require('mongoose')
const Schema=mongoose.Schema

const feedbackSchema = new Schema({
 
    email:{
        type:String,
        required:true 
    },
  
    rating:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Feedback',feedbackSchema)