// db.js

const { MongoClient } = require('mongodb');
require("dotenv").config()
const connectionString = process.env.DB_CONNECTION_STRING;

let client;

async function connectToDatabase() {
  try {
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

function getClient() {
  if (!client) {
    throw new Error('MongoDB client is not connected');
  }
  return client;
}

module.exports = { connectToDatabase, getClient };
