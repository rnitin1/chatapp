const mongoose = require('mongoose');
const User = require('../models/user');
const joi = require('joi');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer= require('nodemailer')
const async = require('async');


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
        (done,token)=>{
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