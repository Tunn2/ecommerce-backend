const jwt = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} = require("../core/error.response");

//service
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    //accessToken
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify:`, err);
      } else {
        console.log(`decode verify:`, decode);
      }
    });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {}
};

// const authentication = asyncHandler(async (req, res, next) => {
//   const userId = req.headers[HEADER.CLIENT_ID];
//   if (!userId) {
//     throw new AuthFailureError("Invalid request");
//   }
//   const keyStore = await KeyTokenService.findByUserId(userId);

//   if (!keyStore) throw new NotFoundError("Not found key store");

//   const accessToken = req.headers[HEADER.AUTHORIZATION];
//   if (!accessToken) throw new AuthFailureError("Invalid request");

//   try {
//     const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
//     if (userId !== decodeUser.userId)
//       throw new AuthFailureError("Invalid UserId");

//     req.keyStore = keyStore;
//     return next();
//   } catch (error) {
//     throw error;
//   }
// });

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1. Check userId missing?
   * 2. get accesstoken
   * 3. verify token
   * 4. check user in db
   * 5. check keyStore with this userId
   * 6. OK all? => return next()
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Invalid request");
  }
  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found key store");

  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      console.log(refreshToken);
      console.log(keyStore.privateKey);

      const decodeUser = jwt.verify(refreshToken, keyStore.privateKey);
      console.log(decodeUser);
      if (userId !== decodeUser.userId)
        throw new AuthFailureError("Invalid UserId");

      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid UserId");

    req.keyStore = keyStore;
    req.user = decodeUser;

    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, secretKey) => {
  return await jwt.verify(token, secretKey);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
