const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Room = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        default:null
    },
    users: {ref:"User"}
    
})

module.exports=mongoose.model('Room',Room)