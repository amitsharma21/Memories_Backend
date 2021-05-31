import mongoose from "mongoose";

import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
  try {
    const postMessages = await PostMessage.find();
    res.status(200).json(postMessages);
  } catch (error) {
    res.status(404).json({ message: error.message });
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
