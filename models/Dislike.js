const { ObjectId } = require("mongodb");
const { getClient } = require("../db");

async function dislikeBlog(userId,blogId) {
  let client = getClient();
  const dislikesCollection = client.db("test").collection("dislikes");
  const existingDislike = await dislikesCollection.findOne({ userID: new ObjectId(userId), blogID: new ObjectId(blogId) });
  if (existingDislike) {
      return "err"
  }
  return await dislikesCollection.insertOne({ blogID: new ObjectId(blogId), userID: new ObjectId(userId) });
}
async function removeDislike(userId,blogId) {
  let client = getClient();
  const dislikesCollection = client.db("test").collection("dislikes");
  return await dislikesCollection.deleteOne({ blogID: new ObjectId(blogId), userID: new ObjectId(userId) });
}

module.exports={dislikeBlog,removeDislike}