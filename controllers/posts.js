import mongoose from "mongoose";

import PostMessage from "../models/postMessage.js";

export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostMessage.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 2;
    const startIndex = (Number(page) - 1) * LIMIT; //get the starting index of the every page
    const total = await PostMessage.countDocuments({}); //counting the total number of the posts in the postmessage collection
    const post = await PostMessage.find()
      .sort({ _id: -1 }) /*sort on the basis of id newese first*/
      .limit(LIMIT) /*give only LIMIT no of posts*/
      .skip(startIndex); /*skip all the posts till startIndex*/
    res.status(200).json({
      data: post,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const posts = await PostMessage.find({
      $or: [{ title: title }, { tags: { $in: tags.split(",") } }],
    });
    res.json({ data: posts });
  } catch (error) {
    res.status(404).json({ message: "somethinnngg went wrong" });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send(`No post with the id`);

  const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });
  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with the id`);

  await PostMessage.findByIdAndDelete(id);
  res.json({ message: "post deleted successfully" });
};

export const likePost = async (req, res) => {
  //extracting the id of the post you want to like from the request
  const { id } = req.params;

  //req.userId has been send here from auth middleware
  if (!req.userId) return res.json({ message: "unAuthenticated" });

  //checking whethere the id is valid or not
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with the id`);

  const post = await PostMessage.findById(id);

  //checking whether the userId is already present in the like section
  const index = post.likes.findIndex((id) => id === String(req.userId));

  if (index === -1) {
    //user has not like the post yet he can like  the post
    post.likes.push(req.userId);
  } else {
    // user had already liked the post he can not like the post twice
    post.likes = post.likes.filter((id) => id !== String(req.userId));
  }

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.json(updatedPost);
};
