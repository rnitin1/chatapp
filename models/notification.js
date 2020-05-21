const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Notificatioon = new Schema ({
    otherUserId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    senderId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    notificationStatus:{
        type:String,
        default:"PENDING"
    }
})


module.exports = mongoose.model('Notificatioon', Notificatioon)