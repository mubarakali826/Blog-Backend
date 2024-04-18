const { ObjectId } = require("mongodb");
const { getClient } = require("../utils/db");

async function createBlog(blogData) {
  const client = getClient();
  const blogsCollection = client.db("test").collection("blogs");
  const result = await blogsCollection.insertOne(blogData);
  return result;
}

async function deleteBlog(id) {
  const client = getClient();
  const blogsCollection = client.db("test").collection("blogs");
  const likesCollection = client.db("test").collection("likes");
  const dislikesCollection = client.db("test").collection("dislikes");
  const blogObjectId = new ObjectId(id);

  await likesCollection.deleteMany({ blogID: blogObjectId });
  await dislikesCollection.deleteMany({ blogID: blogObjectId });
  const result = await blogsCollection.deleteOne({ _id: blogObjectId });
  return result;
}
async function updateBlog(id, blogData) {
  const client = getClient();
  const blogsCollection = client.db("test").collection("blogs");
  const result = await blogsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: blogData }
  );
  return result;
}

async function getAllBlogs() {
  const client = getClient();
  const blogsCollection = client.db("test").collection("blogs");
  const blogs = await blogsCollection.find({}).toArray();
  return blogs;
}

async function findBlogById(id) {
  const client = getClient();
  const blogsCollection = client.db("test").collection("blogs");
  const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
  return blog;
}

async function findBlogBySlug(slug) {
  const client = getClient();
  const blogsCollection = client.db("test").collection("blogs");
  const blog = await blogsCollection.findOne({ slug });
  return blog;
}
module.exports = {
  getAllBlogs,
  createBlog,
  findBlogById,
  findBlogBySlug,
  deleteBlog,
  updateBlog,
};
