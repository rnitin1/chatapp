const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Message =new Schema({
    room:{
        type:Schema.Types.ObjectId,
        ref:"Room"
    },
    user: {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    message: String,
    senderId:{
        type:Schema.Types.ObjectId,
        ref:"Room"
    },

    chatCreateTime: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('Message', Message)