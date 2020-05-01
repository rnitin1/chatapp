const mongoose = require('mongoose');
const User = require('../models/user');
const joi = require('joi');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer= require('nodemailer')
const async = require('async');
const EmailVer = require('../models/emailVerification');
const Room = require('../models/room');
const randomstring=require('randomstring')


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
                    phoneNumber:joi.number(),
                    age:joi.string().max(2),
                    token:joi.string()
                    
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
                    phoneNumber:req.body.phoneNumber,
                    age:req.body.age,
                    accessToken:randomstring.generate(150)
                               
                })
                const saveData=user.save()
                    .then(result=>console.log(result))
                    .catch(err=>console.log(err))                
                
            } catch (error) {
                res.send(error)
            }
            async.waterfall([
                (done)=>{
                    //checking OTP 
                    EmailVer.findOne({emailVerificationToken:req.body.token,
                        emailVerificationExpire:{$gt:Date.now()}},
                        (err,user)=>{
                            if (!user) {
                                return res.send(`OTP is invalid or has expired ${err}`)
                            } else {
                                    //user.setPassword(req.body.newpassword,(err)=>{
                                        user.emailVerificationToken=undefined;
                                        user.emailVerificationExpire=undefined;
                                            user.save((err,user)=>{
                                                if (err) {
                                                    return res.send(err)
                                                }
                                                res.send('Registered successfully ');
                                            })
                                   // })
                              
                            }
                        })
                }
            ])
            
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
                    const user = new EmailVer({
                        emailVerificationToken : token,
                        emailVerificationExpire:Date.now()+3600000
                    })           

                    user.save((err)=>{
                        done(err,token,user)
                })

                }                        
            })

        },
        (token,user,done)=>{
            if(req.body.email){
                //sending otp via nodemailer
                const smtpTransport=nodemailer.createTransport({
                    service:'Gmail',
                    auth:{
                        user:'nitinrana000111@gmail.com',
                        pass:process.env.GMAILPW
                    }
                })
                const mailOptions={
                    to:req.body.email,
                    from:'nitinrana000111@gmail.com',
                    subject:'OTP for Email verifiction',
                    text:'OTP : '+ token
                }
                smtpTransport.sendMail(mailOptions,(err)=>{
                    res.send('OTP sent');
                })
            }
        }
        
    ],(err)=>{
    return res.send(err)
})
}

//login
exports.login= async (req,res)=>{   
   let token = await randomstring.generate(150);
   let dataToSet = {
       $set: {
           accessToken: token
       }
   }
   await User.update(dataToSet);
   res.send(`Welcome `)

 }

 //logout
 exports.logout=async (req,res)=>{
    try{
        // Updating access token to null
        let dataToSet = {
            $set: {
                accessToken: ""
            }
        }
        await User.update(dataToSet);

        req.logOut();
        return res.send('Logged out')

    }catch(err){
        res.send(err)
    }
}

 //changepassword 
 exports.changepassword = (req,res)=>{
    sess=req.session;

    //checking whether in session
    if (sess.passport.user.email) {
        // validating change password 
        const validateChangepassword = (user)=>{
            const schema = {
                newpassword:joi.string().min(6).regex(/^[a-zA-Z0-9!@#$%&*]{3,25}$/),
                password:joi.string(),
                confirmpassword:joi.string()
            }
            return joi.validate(user,schema)
        }
        let {error}=validateChangepassword(req.body);//object distucturing(result.error)
        if(error ) return res.status(404).send(error.details[0].message);
    
        const oldPassword=req.body.password;
        const newPassword=req.body.newpassword;
        const confirmPassword=req.body.confirmpassword;

        //checking whether email is in session or not
        User.findOne({'email':sess.passport.user.email},async (err,user)=>{
            //console.log('testing 2',req.body)

            if(user !=null){
                //comparing password
                await bcrypt.compare(oldPassword,user.password,async (err,res)=>{
                    if (res) {
                        //confirming password
                        if (newPassword==confirmPassword) {
                            await bcrypt.hash(newPassword,10,(err,hash)=>{
                                user.password=hash;
                                console.log('newpassword',user.password);
                                
                                user.save((err,user)=>{
                                    if (err) {
                                        return console.log(err);
                                        
                                    } else {
                                        console.log('Your password has been changed');
                                        
                                    }
                                })
                            })
                        }
                    }
                    
                })
            }

        })       
    }    
}

//forgotpassord
//-------------Sending OTP to user by nodemailer
exports.resetpasswordtoken= (req,res,next)=>{
    async.waterfall([
        (done)=>{
            //creating token or OTP
            crypto.randomBytes(2,(err,buf)=>{
                let token = buf.toString('hex');
                done(err,token)
            })
        },
        //Checking whether mail exists or not
        (token,done)=>{
            User.findOne({email:req.body.email},(err,user)=>{
                if (!user) {
                    return res.send('No user with this Email')
                    
                    
                }else{
                    //assigning token to user
                    user.passwordResetToken=token;
                    user.passwordResetExpire=Date.now()+3600000;//hour
                }
                user.save((err)=>{
                    done(err,token,user)
                })
            })
        },
        //Initializing nodemailer
        (token,user,done)=>{
            const smtpTransport = nodemailer.createTransport({
                service:'Gmail',
                auth:{
                    user:'nitinrana000111@gmail.com',
                    pass:process.env.GMAILPW
                }
            })
            const mailOptions = {
                to:user.email,
                from: 'nitinrana000111@gmail.com',
                subject:"Password reset OTP",
                text:'OTP : '+token
            }
            smtpTransport.sendMail(mailOptions,(err)=>{
                console.log('mail sent');
                res.send('OTP sent')
                return done(err)
            })
        }
    ],
    (err)=>{
        if (err) {
            //res.send(err)
            return next(err)
            
        }
    })

}

// ----------------Reseting the password by OTP
exports.resetpassword = (req,res)=>{
    async.waterfall([
        (done)=>{
            //checking OTP 
            User.findOne({passwordResetToken:req.body.token,
                passwordResetExpire:{$gt:Date.now()}},
                (err,user)=>{
                    if (!user) {
                        return res.send(`OTP is invalid or has expired ${err}`)
                    } else {
                        if (req.body.password===req.body.confirmpassword) {
                            //user.setPassword(req.body.newpassword,(err)=>{
                                user.resetPasswordToken=undefined;
                                user.resetPasswordExpire=undefined;
                                bcrypt.hash(req.body.password,10,(err,hash)=>{
                                    user.password=hash;

                                    user.save((err,user)=>{
                                        if (err) {
                                            return res.send(err)
                                        }
                                        res.send('Password changed successfully ')
                                    })
                                })
                           // })
                        }else{
                            res.send('Password did not match')
                        }
                    }
                })
        }
    ])
}



//Creating a chatroom

exports.createchatroom=(req,res)=>{
    //checking whether chat room already exists or not 
    Room.findOne({name:req.body.name},(err,room)=>{
        if (err) {
            return res.send(err);
        }if (!room) {
             //validation schema
            const validateData = (user)=>{
            const schema = {
                 name:joi.string().trim().min(3)
                }
            return joi.validate(user,schema);
            }
            let {error} = validateData(req.body) // equals to result.error or object destructuring
            if(error ) return res.status(404).send(error.details[0].message);
            console.log(req.body);
            
            //saving chatroom in the data base 
            try {
                const room = new Room({
                    name: req.body.name,
                    })
                const saveData=room.save()
                                .then(result=>console.log(result))
                                .catch(err=>console.log(err))                
                            
            } catch (error) {
                res.send(error)
            }
 
        }else{
            res.send('Chatroom With this name already exists')
        }
    })
}

//Editing User profile 
exports.edituserprofile=async (req,res)=>{
    try {
        let dataToSet={};
        //storing name in dataToSet variable
        if(req.body.name){
            dataToSet.name=req.body.name
        }
        //storing P.no in dataToSet variable
        if(req.body.phoneNumber){
            dataToSet.phoneNumber=req.body.phoneNumber
        }
        //storing age in dataToSet variable
        if(req.body.age){
            dataToSet.age=req.body.age
        }
        //storing profile pic in dataToSet variable
        if(req.body.image){
            dataToSet.image=req.body.image
        }
        //Udating the user in the database
        await User.update({ $set: dataToSet });

        res.send(dataToSet)

    } catch (err) {
        res.send(err)
    }
}

//searching User
exports.searchuser=async (req,res)=>{
    try {
        //validation schema
       const validateData = (user)=>{
       const schema = {
            name:joi.string().trim().min(3).required()
           }
       return joi.validate(user,schema);
       }
       let {error} = validateData(req.body) // equals to result.error or object destructuring
       if(error ) return res.status(404).send(error.details[0].message);
       console.log(req.body);
       // finding the user by name 
        User.findOne({name:req.body.name},(err,user)=>{
            if(err){
                return res.send(err)
            }else{
                //sending users profile
                res.send(user)
            }
        })
    } catch (err) {
        res.send(err)
    }
}







//Invite User
//chatroom list
//Implementing socket.io
// chatroom messages
//notification to non active users 
//delete chatroom

// exports.socketchat=(server,redisClient)=>{
//     try {
//         if (!server.app) {
//             server.app = {}
//         }
//         server.app.socketConnections = {};
//         const io = require('socket.io')(server);

//         const botName = 'Chat-App';
                
//         // Run when client connects
//         io.on('connection', socket => {
//             socket.on('joinRoom', ({ username, room }) => {
//             const user = userJoin(socket.id, username, room);
        
//             socket.join(user.room);
        
//             // Welcome current user
//             socket.emit('message', formatMessage(botName, 'Welcome to ChatApp!'));
        
//             // Broadcast when a user connects
//             socket.broadcast
//                 .to(user.room)
//                 .emit(
//                 'message',
//                 formatMessage(botName, `${user.username} has joined the chat`)
//                 );
        
//             // Send users and room info
//             io.to(user.room).emit('roomUsers', {
//                 room: user.room,
//                 users: getRoomUsers(user.room)
//             });
//             });
        
//             // Listen for chatMessage
//             socket.on('chatMessage', msg => {
//             const user = getCurrentUser(socket.id);
        
//             io.to(user.room).emit('message', formatMessage(user.username, msg));
//             });
        
//             // Runs when client disconnects
//             socket.on('disconnect', () => {
//             const user = userLeave(socket.id);
        
//             if (user) {
//                 io.to(user.room).emit(
//                 'message',
//                 formatMessage(botName, `${user.username} has left the chat`)
//                 );
        
//                 // Send users and room info
//                 io.to(user.room).emit('roomUsers', {
//                 room: user.room,
//                 users: getRoomUsers(user.room)
//                 });
//             }
//             });
//         });


//     }catch (err) {
//         console.log(err);
//         console.log(err.code);
//     }
// }

























