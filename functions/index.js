const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./utils/fbAuth');

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream
} = require('./handlers/screams');
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./handlers/users');

//Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
//TODO delete Scream
//TODO like a scream
//TODO unlike a scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.region('europe-west1').https.onRequest(app);
