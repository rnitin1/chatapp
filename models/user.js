const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = new Schema ({
        _id:mongoose.Schema.Types.ObjectId,
        name:{
            type:String,
            trim:true,
            default:null                                                        
        },
        email:{
            type:String,
            trim:true,
            unique:true       
        },
        password:{
            type: String,
        },
        phoneNumber:{
            type:String,
            default:null
        },
        age:{
            type:Number,
            trim:true,
            default:null
        },
        rooms:{
            type:Array, 
            default:"" 
        },
        isOnline:{
            type:Boolean,
            default:false
        },
    
    image:{
        type:Array,
        default:null
    },

    passwordResetToken: String,
    passwordResetExpire: Date,
    deviceToken:{
        type:String,
        default:null
    },
    accessToken:{
        type:String,
        default:null
    }
})




// const notificationSchema = new Schema ({
//     otherUserId:{
//         type:Schema.Types.ObjectId,
//         user:userSchema
//     },
//     userId:{
//         type:Schema.Types.ObjectId,
//         user:userSchema
//     },
//     notificationStatus:{
//         type:String,
//         default:"PENDING"
//     }
// })

module.exports = mongoose.model('User',User)
// module.exports =mongoose.model('Message',messageSchema)
// module.exports =mongoose.model('Notification',notificationSchema)
