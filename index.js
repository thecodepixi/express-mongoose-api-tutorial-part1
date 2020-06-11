const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

//require dotenv to access variables inside .env
require('dotenv').config();

//tell our express app to use cors and bodyParser
app.use(cors());
app.use(bodyParser.json());

//connect our app to MongoDB with Mongoose
const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;

//open our MongoDB connection
connection.once('open', () => {
  console.log('MongoDB connection established');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
