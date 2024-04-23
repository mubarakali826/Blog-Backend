const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

async function connectToDatabase() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

function getClient() {
  throw new Error('Mongoose client is not needed. Use mongoose directly.');
}

module.exports = { connectToDatabase, getClient };
