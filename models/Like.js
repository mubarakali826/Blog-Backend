const { ObjectId } = require("mongodb");
const { getClient } = require("../utils/db");

async function likeBlog(userId, blogId) {
  let client = getClient();
  const blogsCollection = client.db("test").collection("blogs");
  const likesCollection = client.db("test").collection("likes");
  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  if (!blog) {
    return "nonExistent";
  }
  const existingLike = await likesCollection.findOne({
    userID: new ObjectId(userId),
    blogID: new ObjectId(blogId),
  });
  if (existingLike) {
    return "already";
  }
  return await likesCollection.insertOne({
    blogID: new ObjectId(blogId),
    userID: new ObjectId(userId),
  });
}

async function getLikeCounts(blogId) {
  let client = getClient();
  const likesCollection = client.db("test").collection("likes");
  const count = await likesCollection.countDocuments({
    blogID: new ObjectId(blogId),
  });
  return count;
}

async function removeLike(userId, blogId) {
  let client = getClient();
  const likesCollection = client.db("test").collection("likes");
  return await likesCollection.deleteOne({
    blogID: new ObjectId(blogId),
    userID: new ObjectId(userId),
  });
}

async function getLikedBlogs(userId) {
  let client = getClient();
  const likesCollection = client.db("test").collection("likes");

  const Blogs = await likesCollection
    .aggregate([
      {
        $match: { userID: new ObjectId(userId) },
      },
      {
        $lookup: {
          from: "blogs",
          localField: "blogID",
          foreignField: "_id",
          as: "likedBlogs",
        },
      },
    ])
    .toArray();

  return Blogs.map((like) => like.likedBlogs[0]);
}

module.exports = { likeBlog, removeLike, getLikedBlogs, getLikeCounts };
