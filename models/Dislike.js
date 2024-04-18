const { ObjectId } = require("mongodb");
const { getClient } = require("../utils/db");

async function dislikeBlog(userId,blogId) {
  let client = getClient();
  const dislikesCollection = client.db("test").collection("dislikes");
  const blogsCollection = client.db("test").collection("blogs");
  
  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  if (!blog) {
      return "nonExistent"
  }
  const existingDisike = await dislikesCollection.findOne({ userID: new ObjectId(userId), blogID: new ObjectId(blogId) }) ;
  if (existingDisike) {
      return "already"
  }
  return await dislikesCollection.insertOne({ blogID: new ObjectId(blogId), userID: new ObjectId(userId) });
}
async function removeDislike(userId,blogId) {
  let client = getClient();
  const dislikesCollection = client.db("test").collection("dislikes");
  return await dislikesCollection.deleteOne({ blogID: new ObjectId(blogId), userID: new ObjectId(userId) });
}

module.exports={dislikeBlog,removeDislike}