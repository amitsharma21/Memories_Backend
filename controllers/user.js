import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    //extracting the email and password of the user that he entered
    const existingUser = await User.findOne({ email });

    // checking whether the user exist in the database with provided email id
    if (!existingUser)
      return res.status(404).json({ message: "user don't exist" });

    //comparing the password that he enterd to that was present inside the  database
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    //  if password is not correct sending the response
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    // generation of the token for the valid user

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      /* at 2nd argument position we need to enter the secret string */ "test",
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  try {
    //checking whether user already present or not
    const existingUser = await User.findOne({ email });

    //if user is present we are not moving forward and send the error to the frontend
    if (existingUser) res.status(400).json({ message: "User already exists" });

    //checking whether the password match with the confirm password
    if (password !== confirmPassword)
      res.status(400).json({ message: "password don't match" });

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 12 /*salt number*/);

    //entering the details of the user into the database
    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });

    //generating the token
    const token = jwt.sign(
      { email: result.email, id: result._id },
      /* at 2nd argument position we need to enter the secret string */ "test",
      { expiresIn: "1h" }
    );

    //sending back the details of the created user
    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};
