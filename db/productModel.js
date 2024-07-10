const { Decimal128, Int32, Double } = require("mongodb");
const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
    product_name:{
        type: String,
        required: [true, "Please provide a product name!"],
        unique: [true, "Email Exist"],  
    },
    catagory:{
        type: String,
        required: [true, "Please provide a catagory!"],
        unique: false,
    },
    sub_catagory:{
        type: String,
        required: [true, "Please provide a sub catagory!"],
        unique: false,
    },
    brand:{
        type: String,
        required: [true, "Please provide a brand!"],
        unique: false,
    },
    sale_price:{
        type: Number,
        required: [true, "Please provide a sale price!"],
        unique: false,
    },
    market_price:{
        type: Number,
        required: [true, "Please provide a market price!"],
        unique: false,
    },
    type:{
        type: String,
        required: [true, "Please provide a type!"],
        unique: false,
    },
    rating:{
        type: Decimal128,
        required: [true, "Please provide a rating!"],
        unique: false,
    },
    description:{
        type: String,
        required: [true, "Please provide a description!"],
        unique: false,
    },
    interest:{
        type: String,
        required: [true, "Please provide an interest!"],
        unique: false,
    },
})

module.exports = mongoose.model.Products || mongoose.model("Products", ProductSchema);
