const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const FbLogin = new Schema({
        type:String,
        facebookId:String,
        email:{
            type:String,
            trim:true,
            default:null
        },
        name:String
})

module.exports = mongoose.model('FbLogin', FbLogin)