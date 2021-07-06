const { reset } = require('nodemon')
const Feedback=require('./feedback_model')
module.exports=(app)=>{
    app.post("/api/feedback",(req,res)=>{
    const {email,rating}=req.body 
    console.log(req.body)
    const newRating = new Feedback({
        email,
        rating
    })
    newRating.save() 
    .then(Rated=>{  
        res.json({
            "msg":"thanks for your feedback"
        })
    })
    .catch((err)=>{
        res.json(err)
    })
    })

}