const User = require('../models/user');
const Room = require('../models/room')
const Message = require('../models/message')
const Notification = require ('../models/notification')
 
let io;



//implementing the chat
exports.connectSocket = (server,redisClient)=>{
    // console.log('server===',server.app);
    // console.log('Client=',redisClient);

    try {
        // if (!server.app) {
        //     server.app={}
        // }
        // // console.log(server.app);
        
        // server.app.socketConnections = {};
        io = require('socket.io')(server);
        // console.log('helloWorld');

        io.on('connection',(socket)=>{
            console.log('connected');
            // console.log(socket.handshake.query.accessToken,'accesstoken')

                    socket.on('disconnect', function () {
                        console.log('disconnected');
                        console.log(socket.id, 'socket id');
                    });
                
                    socket.on('chat',(data,cb)=>{
                        console.log("entered in socket");
                        
                        //console.log('data',data);
                        let chatData={}

                        chatData.message=data.message;
                        chatData.senderId=data.senderId;
                        chatData.roomId=socket.handshake.query.roomId;
                        chatData.chatCreateTime = new Date();
 
 
                        // //console.log(socket.handshake);
                        // console.log(socket.handshake.query,'======');
                        console.log('chatData',chatData);
                        console.log('senderId',data.senderId);
                        console.log('message',data.message);

                        User.findOne({_id:data.senderId},(err,result)=>{
                            if(err){
                                return console.log(err);
                                
                            }if(!result){
                                return console.log('Unauthorized');
                                
                            }else{
                                Room.findOne({_id:socket.handshake.query.roomId})
                                .populate('userId')   
                                .exec((err,users) => {
                                    // console.log(users);
                                    
                                    if(err){
                                        console.log(err);
                                    } 
                                    const message = new Message(chatData)
                                    message.save()
                                                .then(result=>console.log(result))
                                                .catch(err=>console.log(err))

                                    users.userId.forEach(user => {
                                    //console.log(user); 

                                        if(user.isOnline){
                                            //console.log(user._id);
                                            
                                            // console.log('==========Online users',user.isOnline);
                                            
                                            io.in(user._id).emit('message created', chatData) 
                                        }else{
                                            // console.log('==============',user.isOnline);
                                            // console.log('ofline',user._id);
                                            console.log('sender',result.name);

                                            const FCM = require('fcm-node');
                                            const serverKey ='AAAAiq3eC30:APA91bFx95YQl0IoN20uI8QrV1a0gwFP58JMAbzKFFyRFnm1igFKkf3oSfWL4FJExMSyOGqNBqPXDE8EYb5u_9afKMm8HJ_fqulvhoAk562V1BCgpi23arNvtz2wtVepwq0csTvQ87ZE'
                                            const fcm =new FCM(serverKey);


                                            let message = {
                                                to: user.deviceToken,

                                                notification:{
                                                    title:"New Chat",
                                                    text:`${result.name} sent you a message`,
                                                    body:data.message,
                                                    sound:'default',
                                                    badge:0
                                                },

                                                data:chatData
                                            }

                                            fcm.send(message,(err,result)=>{
                                                if (err) console.log('===========',err);

                                                else {

                                                    const notification = new Notification({
                                                        otherUserId:user._id,
                                                        senderId:data.senderId,
                                                        notificationStatus:'Done'
                                                    })
                                                    notification.save()
                                                                    .then(res=>console.log(res))
                                                                    .catch(err=>console.log(err))
        
                                                    console.log('Notification sent successfully',result);
                                                }
                                                
                                            })
                                            // let sendPush = function (deviceToken, data) {
                                            //     return new Promise((resolve, reject) => {
                                            //         let message = {
                                            //             to: deviceToken,
                                            //             notification: {
                                            //                 title: 'New Chat!',
                                            //                 text:`${result.name} sent you a message`,
                                            //                 body: data.message,
                                            //                 sound: "default",
                                            //                 badge: 0
                                            //             },
                                            //             data: chatData,
                                            //             priority: 'high'
                                            //         };
                                            //         fcm.send(message, function (err, result) {
                                            //             if (err) {
                                            //                 resolve(errr);
                                            //             } else {
                                            //                 resolve(null, result);
                                            //             }
                                            //         });

                                            //     })
                                            // };
                                                                                                                              
                                        }
                                    });
                                })
                            }
                        })
                        
                        

                    })
        })      
        // console.log('hello');
        
        
    }catch (error) {
        console.log('=========Error',error);
        
    }

       
}