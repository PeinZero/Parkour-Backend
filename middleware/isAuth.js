import jsonwebtoken from 'jsonwebtoken';
const verify = jsonwebtoken.verify;

export default (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  // token: header.payload.signature <-- usually
  // here our token is: header.signature.payload, so...
  const signature = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = verify(signature, 'secretkey');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not Authorized.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
