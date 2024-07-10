const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");
const ConversationSchema = new mongoose.Schema({
    conversation_id:{
        type: String,
        required: [true, "Please provide a conversation id!"],
        unique: [true, "Conversation Key Exist"],  
    },
    conversation_name:{
        type: String,
        required: [true, "Please provide a conversation name!"],
        unique: false,
    },
    model:{
        type: String,
        required: [true, "Please provide a model name!"],
        unique: false,
    },
    maxLength:{
        type: Number,
        required: [true, "Please provide a max length!"],
        unique: false,
        default: 96000,
    },
    tokenLimit:{
        type: Number,
        required: [true, "Please provide a token limit!"],
        unique: false,
        default: 32768,
    },
    temperature:{
        type: Decimal128,
        required: [true, "Please provide a temperature!"],
        unique: false,
        default: 1,
    },
    system_msg:{
        type: String,
        required: [true, "Please provide a system message!"],
        unique: false,
    },
})

module.exports = mongoose.model.Conversations || mongoose.model("Conversations", ConversationSchema);
