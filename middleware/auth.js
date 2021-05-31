import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    //extracting the token that we have sent from the frontend
    const token = req.headers.authorization.split(" ")[1];

    //checking whether the token is custom token or the token is google token
    const isCustomAuth = token.length < 500;

    let decodedData;
    //if login is through the form
    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, "test");
      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

export default auth;
