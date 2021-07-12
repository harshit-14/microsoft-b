require('dotenv').config()
const AppUser=require('./user-model')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

module.exports=(app)=>{
    
    //registering new user
    app.post('/register',(req,res)=>{
        console.log(req.body)
        const {name,email,password}=req.body
        if(!name||!email||!password)
        {
            return res.status(400).json({msg:'Enter all fields'})
        }
        AppUser.findOne({email})
            .then(user=>{
                if(user)
                {
                    return res.status(400).json({msg:'user already exist'})
                }
                else
                {
                    const newAppUser=new AppUser({
                        name,
                        email,
                        password
                    })

                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newAppUser.password,salt,(err,hash)=>{
                            if(err) throw err;
                            newAppUser.password=hash;
                            newAppUser.save()
                                    .then(user=>{
                                        jwt.sign(
                                            {id:user.id},
                                            process.env.jwtSecret,
                                            {expiresIn:7*3600},
                                            (err,token)=>{
                                                if(err) throw err;

                                                res.json({
                                                    token,
                                                    user:{
                                                        id:user.id,
                                                        name:user.name,
                                                        email:user.email
                                                    }
                                                })
                                            }
                                        )
                                    })
                                    .catch(err=>{
                                        return res.status(500).json(err)
                                    })
                        })
                    })

                }
            })
            .catch(err=>{
                return res.status(500).json(err)
            })
        


    })

    //login user
    app.post('/login',(req,res)=>{
        const {email,password}=req.body
        if(!email||!password)
        {
            return res.status(400).json({msg:"Enter all fields"})
        }
        AppUser.findOne({email})
            .then(user=>{
                if(!user)
                {
                    return res.status(400).json({msg:"user does not exist"})
                }
                bcrypt.compare(password,user.password)
                    .then(valid=>{
                        if(!valid)
                        {
                            return  res.status(400).json({msg:"Invalid User"})
                        }
                        jwt.sign(
                            {id:user.id},
                            process.env.jwtSecret,
                            {expiresIn:7*3600},
                            (err,token)=>{
                                if(err) throw err;
                                res.json({
                                    token,
                                    user:{
                                        id:user.id,
                                        name:user.name,
                                        email:user.email
                                    }
                                })
                            }
                        )

                    })
                    .catch(err=>{
                        return res.status(500).json(err)
                    })
            })
            .catch(err=>{
                return res.status(500).json(err)
            })


    })

}