const User = require('../models/user');
const Room = require('../models/room')
const fcm = require('fcm-node')

let io;



//implementing the chat
exports.connectSocket = (server,redisClient)=>{
    // console.log('server===',server.app);
    // console.log('Client=',redisClient);

    try {
        if (!server.app) {
            server.app={}
        }
        // console.log(server.app);
        
        server.app.socketConnections = {};
        io = require('socket.io')(server);
        // console.log('helloWorld');

        io.on('connection',(socket)=>{
            console.log('connected');
            // console.log(socket.handshake.query.accessToken,'accesstoken')

            let criteria ={
                accessToken:socket.handshake.query.accessToken
            }
            
            User.findOne(criteria,(err,result)=>{
                if (err ) {
                    console.log('====Error',err);
                    
                    
                }if (!result) {
                    console.log('Invalid aceesstoken or unauthorized');
                    
                }else{
                    // console.log('Authorized');
                    // console.log('sokect id',socket.id);
                    // console.log(result._id);
                    // let userId = "" + result._id
                    // console.log(userId,"userid");


                    socket.on('disconnect', function () {
                        console.log('disconnected');
                        console.log(socket.id, 'socket id');
                    });
                    
                    socket.on('sendMessages',(data,cb)=>{
                        console.log('data',data);
                        let chatData={}
                        if (data.message) {
                            chatData.message = data.message;
                            chatData.messageType = "TEXT"
                        }
                        console.log("4444444444444", data.message)
                        
                    })
                }
            })

        })
        // console.log('hello');
        
    } catch (error) {
        console.log('=========Error',error);
        
    }

       
}