// models/User.js
const { getClient } = require('../db');
async function createUser(userData) {
  const client = getClient();
  const usersCollection = client.db('test').collection('users');
  const result = await usersCollection.insertOne(userData);
  return result;
}

async function findUserByEmail( email) {
  const client = getClient();
  const usersCollection = client.db('test').collection('users');
  const user = await usersCollection.findOne({ email });
  return user;
}

module.exports = { createUser, findUserByEmail };
