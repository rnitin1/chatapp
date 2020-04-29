const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const emailVerificationSchema = new Schema ({
    emailVerificationToken: String,
    emailVerificationExpire: Date
})

module.exports = mongoose.model('Emailtoken',emailVerificationSchema)


