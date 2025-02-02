const mongoose = require("mongoose");

const connectToDB = async ()=>{
    await mongoose.connect("mongodb+srv://prafulkusugal:yCYg6MKcXWGYxAg3@cluster0.klvwa.mongodb.net/devTinder");
};

module.exports= connectToDB;
