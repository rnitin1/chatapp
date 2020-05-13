const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Message =new Schema({
    room:{
        type:Array,
        ref:Room
    },
    user: {
        type:Array,
        ref:User
    },
    message: String,
    messageType:String
})


module.exports = mongoose.model('Message', Message)