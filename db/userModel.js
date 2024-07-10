const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],  
    },
    password:{
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    token:{
        type: String,
        required: false,
        unique: [true, "Token Exist"],
    },
    conversationID_list:{
        type: Array,
        required: false,
        unique: false,
    },
})

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
