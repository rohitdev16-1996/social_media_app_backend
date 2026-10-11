require('dotenv').config();

const mongoose = require('mongoose');

const url = process.env.DATABASE_URL;

const connectDB = async () => {
    await mongoose.connect(url);
    console.log('Connected to DB:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
}

/* Do not call the connectDB function here, instead call it from your main application file (e.g., app.js) */
module.exports = {
    connectDB
};