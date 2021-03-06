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
const FbLogin = require('../models/fbogin')


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
           accessToken: token,
           isOnline:true
       }
   }
//    console.log('==============',req.user)
   await User.update({email:req.body.email},dataToSet);
   res.send(`Welcome `)
   
 }

 //login with facebook
 exports.loginwithfacebook= async (req, res) =>{
    try {
        FbLogin.findOne({facebookId:req.body.facebookId},async (err,user)=>{
            if(err){
                res.send(err)
            }if(user){
                return res.send(user)
            }else{
                const validateData = (user)=>{
                    const schema = {
                        facebookId:joi.string().trim().min(3),
                        email:req.body.email,
                        name:joi.string().trim().min(3),
                        }
                        return joi.validate(user,schema);
                        }
                let {error} = validateData(req.body) // equals to result.error or object destructuring
                if(error ) return res.status(404).send(error.details[0].message);
                console.log(req.body);
    
                let fbogin = new FbLogin({
                    name:req.body.name,
                    email:req.body.email,
                    facebookId:req.body.facebookId
                })
                
                await fbogin.save()
                            .then(result=>console.log(result))
                            .catch(err=>console.log(err));
                res.send(fbogin)
            }
        })
 

    } catch (err) {
        console.log('================', err);
    }

}


 //logout
 exports.logout=async (req,res)=>{
    try{
        // Updating access token to null
        let dataToSet = {
            $set: {
                accessToken: "",
                isOnline:false
            }
        }
        await User.update({_id:req.user._id},dataToSet);
        console.log(req.header);
        
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

//Editing User profile 
exports.edituserprofile=async (req,res)=>{
    console.log(req.body);
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
        await User.update({_id:req.user._id}, { $set: dataToSet });

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
        User.findOne({name:req.body.name},{password:0,deviceToken:0,accessToken:0,_id:0,__v:0,rooms:0},(err,user)=>{
            if(err){
                return res.send(err)
            }else{
                //sending users profile
                return res.send(user)
            }
        })
    } catch (err) {
        res.send(err)
    }
}



//Creating a chatroom

exports.createchatroom=async (req,res)=>{
    // //checking whether chat room already exists or not 
    // User.findOne( {rooms:req.body.name},async (err,room)=>{
    //     if (err) {
    //         return res.send(err);
    //     }if (!room) {
    //         if (req.user._id) {
    //             //validation schema
    //             const validateData = (user)=>{
    //             const schema = {
    //                 name:joi.string().trim().min(3)
    //                 }
    //             return joi.validate(user,schema);
    //             }
    //             let {error} = validateData(req.body) // equals to result.error or object destructuring
    //             if(error ) return res.status(404).send(error.details[0].message);
    //             console.log(req.body);
                
    //             //saving chatroom in the data base 
    //             try {
    //                 // const room = new Room({
    //                 //     name: req.body.name,
    //                 //     })
    //                 // const saveData=room.save()
    //                 //                 .then(result=>console.log(result))
    //                 //                 .catch(err=>console.log(err))      
    //                 console.log('efee',req.body);
                    
    //                 let dataToSet = {
    //                     $push: {
    //                         rooms: req.body.name
    //                     }
    //                 } 
    //                 await User.update( {_id:req.user._id},dataToSet)
    //                 // await User.findOne({_id:req.user._id})
    //                 res.send(`Successfully created ${req.body.name}`)    
    //             } catch (error) {
    //                 res.send(error)
    //             }
    //     }
    //     }else{
    //         res.send('Chatroom With this name already exists')
    //     }
    // })
    try {
        //Checking authorization
        if(req.user._id){
            //Checking whether id exists or not
            await User.findOne({_id:req.user._id},async (err,user)=>{
                if (err) {
                    return res.send(err)
                } if(!user) {
                    res.send('login first')
                }else{
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
                    //Checkinf whether room exists or not        
                    await Room.findOne({name:req.body.name},async (err,room)=>{
                        if(err){
                            return res.send(err)
                        }if(room){
                            res.send('Room with this name is already exists')
                        }else{
                           try {

                            //   const room = new Room({
                            //     //   name:req.body.name,
                            //     //   adminId:req.user._id
                            //     "roomData.$.name": req.body.name
                            //   }) 


                            //Saving room in the Database     
                            const room = new Room({
                                name: req.body.name,
                                adminId: req.user._id,
                                users:req.user.name,
                                userId:req.user._id
                                
                            })

                            await room.save()
                                        .then(result=>console.log(result))
                                        .catch(err=>console.log(err));


                              res.send(`${req.body.name} created`)
                           } catch (error) {
                               return res.send(error)
                           }
                        }
                    })
                }
            })
        }
    } catch (err) {
        res.send(err)
    }

}



//Accessing user created and invited chatroom
exports.accesschatrooms=async (req,res)=>{
    try {
        console.log(req.user);
        if (req.user) {
            // Finding user in the rooms
            await Room.find({users:req.user.name},{userId:0,_id:0,__v:0,adminId:0,users:0},(err,rooms)=>{
                if (err) {
                    res.send(err)
                }if (rooms) {
                    res.send(rooms)
                }if(!rooms){
                    res.send('Unauthorized')
                }
            })
        } else {
            res.send('Unauthorized')
        }
        
        
    } catch (error) {
        res.send(error)
    }
}

//delete chatroom
exports.deletechatroom= async (req,res)=>{
    // try {
    //     console.log('eeeefee',req.user._id);

    //     if(req.user._id){
    //         console.log('gyjgugjnkjbkjbbjk');
            
    //        await User.finfOne({rooms:req.body.name},async (err,room)=>{
    //            if (err) {
    //                console.log('fyugfuyuygug',err);
    //                console.log('fvufyug',room);
                   
                   
    //               return res.send(err)
    //            }if (!room) {
    //                res.send('No room with this Name')
    //            } else {
    //                try {
    //                 console.log('efee',req.body);

    //                    let dataToSet={
    //                        $pop:{
    //                            rooms:req.body.name
    //                        }
    //                    }
    //                    await User.update({_id:req.user._id},dataToSet)
    //                    res.send(`${req.body.name} deleted`)
    //                } catch (error) {
    //                    res.send(error)
    //                }
    //            }
    //        })
    //     }
    // } catch (error) {
    //     res.send(error)
    // }
    try {
        //checking whether logged in or not
        if (req.user._id) {
            //comparing user's id with storage 
            await Room.findOne({adminId:req.user._id},(err,user)=>{
                if (err) {
                    res.send(err)
                } if (user) {
                    //further checking rooms in db
                    Room.findOne({name:req.body.name},async (err,room)=>{
                        if (err) {
                            return res.send(err)
                        } if (!room) {
                            return res.send('No room with this Name')
                        }else{
                            // // variable for poping up the room
                            // const dataToSet = {
                            //     $pop :{
                            //         name:req.body.name
                            //     }
                            // }
                            // // checking criteria
                            // const criteria = {
                            //     adminId:req.user._id
                            // }
                            // console.log('biucbod',criteria);
                            // console.log('bnonfiowjenfro',dataToSet);
                            
                            
                            //deleting the room froom the database
                                await Room.deleteOne(/*criteria,dataToSet*/ {name:req.body.name},(err,room)=>{
                                    if(err){
                                        return res.send(err)
                                    }if (room) {  
                                        res.send(`${req.body.name} deleted`)
                                    }
                                })
                        }
                    })
                }if(!user){
                    res.send('Unauthorized')
                }
            })
        } else {
            res.send('log in first')
        }
        
    } catch (error) {
        res.send(error)
    }
}

//addusers
exports.addusers= async (req,res)=>{
    try {
        // cheking authorization
        if (req.user._id) {
            // checking whether admin or not
            await Room.findOne({adminId:req.user._id},async (err,user)=>{
                if (err) {
                    res.send(err)
                }if (!user) {
                    res.send('unauthorized')
                }else{
                    //validation schema
                    const validateData = (user)=>{
                        const schema = {
                            user:joi.string().trim().min(3),
                            name:joi.string().trim().min(3)
                            }
                        return joi.validate(user,schema);
                    }
                    let {error} = validateData(req.body) // equals to result.error or object destructuring
                    if(error ) return res.status(404).send(error.details[0].message);
                    console.log(req.body);
                    
                    // checking whether room exists or not
                    await Room.findOne({name:req.body.name},async (err,room)=>{
                        if(err){
                            res.send(err)
                        }if(!room){
                            res.send('No room with this name ')
                        }else{
                            try {
                                // Adding user in the room
                                await User.findOne({name:req.body.user},async (err,user)=>{
                                    // console.log('========',user);
                                    
                                    if(err){
                                        return res.send(err)
                                    }if(!user){
                                        return res.send('User not exists')
                                    }else{
                                        //comparing id's of that specific room
                                        await Room.findOne({_id:room._id},async (err,result)=>{
                                            console.log('====================',result.users);
                                            
                                            if (err) {
                                                res.send(err)
                                            }
                                            // checking whether user already in tje room or not
                                            if(result.users==req.body.user){
                                                return res.send(`${req.body.user} is already in the room ${req.body.name}`)
                                            }else{
                                                let dataToSet={
                                                    $push:{
                                                        users:req.body.user,
                                                        userId:user._id
                                                    }
                                                }
                                                let criteria={
                                                    _id:result._id
                                                }
                                                // updating the database
                                                await Room.update(criteria,dataToSet)
                                                res.send(`${req.body.user} is added in the Room ${req.body.name}`)

                                            }
                                        })
                                    }
                                })
                                
                            } catch (error) {
                                res.send(error)
                            }
                        }
                    })
                }
            })
        } else {
            res.send('Unauthorised or login in first')
        }
    } catch (error) {
        res.send(error)
    }
}



//chatroom list
//Implementing socket.io
// chatroom messages
//notification to non active users 
//------------sending notification


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