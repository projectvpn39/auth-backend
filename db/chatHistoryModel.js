const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ChatHistorySchema = new mongoose.Schema({
    SessionId:{
        type: String,
        required: [true, "Please provide a SessionId!"],
        unique: false,
    },
    History:{
        type: String,
        required: [true, "Please provide a History!"],
        unique: false
    },
})

module.exports = mongoose.model("ChatHistory", ChatHistorySchema, "chat_history");
