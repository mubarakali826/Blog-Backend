const { ObjectId } = require("mongodb");
const { getClient } = require("../utils/db");

async function likeBlog(userId,blogId) {
  let client = getClient();
  const likesCollection = client.db("test").collection("likes");
  const existingLike = await likesCollection.findOne({ userID: new ObjectId(userId), blogID: new ObjectId(blogId) });
  if (existingLike) {
      return "err"
  }
  return await likesCollection.insertOne({ blogID: new ObjectId(blogId), userID: new ObjectId(userId) });
  }async function getLikeCounts(blogId) {
  let client = getClient();
  const likesCollection = client.db("test").collection("likes");
  const count = await likesCollection.countDocuments({ blogID: new ObjectId(blogId) });
  return count;
}

async function removeLike(userId,blogId) {
  let client = getClient();
  const likesCollection = client.db("test").collection("likes");
  return await likesCollection.deleteOne({ blogID: new ObjectId(blogId), userID: new ObjectId(userId) });
}

async function getLikedBlogs(userId) {
    let client = getClient();
    const likesCollection = client.db("test").collection("likes");
    const blogIDs = await likesCollection.find({ userID: new ObjectId(userId) }).toArray();

    const blogsCollection = client.db('test').collection('blogs');
    const likedBlogs = [];

    for (const like of blogIDs) {
        const blog = await blogsCollection.findOne({ _id: new ObjectId(like.blogID) });
        likedBlogs.push(blog);
    }
    return likedBlogs;
}


module.exports={likeBlog,removeLike,getLikedBlogs,getLikeCounts}
