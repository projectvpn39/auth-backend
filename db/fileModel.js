const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    }
});

const mySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    files: [fileSchema]
});

module.exports = mongoose.model("files", mySchema, "files");

