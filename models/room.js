const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let roomData = {
    userId: { type: Schema.Types.ObjectId,default:"" ,ref: "User" },
    name: { type: String },
    users: { type: String,default:"" },
    adminId:{type:Schema.Types.ObjectId,default:"", ref:"user"}
};


const Room = new Schema({
    room:[roomData]
})

module.exports = mongoose.model('Room', Room)