const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Room = new Schema({
    userId: { type:Array,ref: "User", default : "" },
    name: { type: String },
    users: { type: Array,default:"" },
    adminId:{type:Schema.Types.ObjectId, ref:"User", default: null}
})

module.exports = mongoose.model('Room', Room)