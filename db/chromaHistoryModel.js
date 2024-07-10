const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ChromaHistorySchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "Please provide a Email!"],
        unique: [true, "Email Exist"],
    },
    vector: [{
        file_name: String,
        file_id: String
    }]
})

module.exports = mongoose.model("ChromaHistory", ChromaHistorySchema, "chroma_history");
