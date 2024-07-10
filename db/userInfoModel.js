const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const UserInfoSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: [true, "Please provide the first name!"],
        unique: false,
    },
    last_name:{
        type: String,
        required: [true, "Please provide the last name!"],
        unique: false,
    },
    age:{
        type: Number,
        required: [true, "Please provide a age!"],
        unique: false,
    },
    gender:{
        type: String,
        required: [true, "Please provide a gender!"],
        unique: false,
    },
    region:{
        type: String,
        required: [true, "Please provide a region!"],
        unique: false,
    },
    phone:{
        type: String,
        required: [true, "Please provide a phone!"],
        unique: false,
    },
    email:{
        type: String,
        required: [true, "Please provide a email!"],
        unique: false,
    },
    marital_status:{
        type: String,
        required: [true, "Please provide a marital status!"],
        unique: false,
    },
    network_provider:{
        type: String,
        required: [true, "Please provide a network provider!"],
        unique: false,
    },
    interest:{
        type: String,
        required: [true, "Please provide a interest!"],
        unique: false,
    },
})

module.exports = mongoose.model.UserInfo || mongoose.model("UserInfo", UserInfoSchema);
