const mongoose = require('mongoose');
const User = require('../models/user');
const joi = require('joi');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer= require('nodemailer')
const async = require('async');


// Registering the user
exports.signup = (req,res)=>{
    User.findOne({email:req.body.email},async (err,user)=>{
        if(user){
            return res.send('Email already exists')
        }else{
            //validation schema
            const validateData = (user)=>{
                const schema = {
                    name:joi.string().trim().min(3),
                    email:joi.string().trim().email(),
                    password:joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{3,25}$/).min(6),
                    phoneNumber:joi.number().min(10).max(10),
                    age:joi.string().max(2)
                }
                return joi.validate(user,schema);
            }
            let {error} = validateData(req.body) // equals to result.error or object destructuring
            if(error ) return res.status(404).send(error.details[0].message);

            // saving data in the data base
            try {
                const hashPassword =await bcrypt.hash(req.body.password,10)
                const user = new User({
                    _id:new mongoose.Types.ObjectId,
                    name: req.body.name,
                    email:req.body.email,
                    password:hashPassword,
                    phoneNumber:req.body.phoneNumber                  
                })
                const saveData=user.save()
                    .then(result=>console.log(result))
                    .catch(err=>console.log(err))                
                
            } catch (error) {
                
            }
        }
    })
}

//Sending OTP for Email verification
exports.emailverification = (req,res)=>{
    async.waterfall([
        // creating otp or token
        (done)=>{
            crypto.randomBytes(2,(err,buf)=>{
                let token = buf.toString('hex');
                    done(err,token)
                })
        },
        // checking whether email exists or not
        (token,done)=>{
            User.findOne({email:req.body.email},(err,user)=>{
                console.log('hello',req.body);
                
                if(user){
                    return res.send('Email already registered')
                }else{
                //saving the token in the database            
                    user.emailVerificationToken =token;
                    user.emailVerificationExpire=Date.now()+3600000;
                }
                user.save((err)=>{
                    done(err,token,user)

                })                        
            })
        },
        (token,user,done)=>{
            if(req.body.email){
                //sending otp via nodemailer
                const smtpTransport=nodemailer.createTransport({
                    service:'Gmail',
                    auth:{
                        user:'nitinrana000111@gmail.com',
                        pass : process.env.GMAILPW
                    }
                })
                const mailOptions={
                    to:req.body.email,
                    from:'nitinrana000111@gmail.com',
                    subject:'OTP for Email verifiction',
                    text:'OTP : '+ token
                }
                smtpTransport.sendMail(mailOptions,(err)=>{
                    res.send('OTO sent');
                })
            }
        }
        
    ],(err)=>{
    return res.send(err)
})
}