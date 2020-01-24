/* Visit https://firebase.google.com/docs/database/security to learn more about security rules. */
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const functions = require('firebase-functions');
const app = require('express')();

const admin = require('firebase-admin');
const serviceAccount = require('./utils/serviceAcctKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const firebaseConfig = {
  apiKey: 'AIzaSyDQ7ZDyZco52r91kcEw494l2eIwxD0MvDQ',
  authDomain: 'socialapp-c82fa.firebaseapp.com',
  databaseURL: 'https://socialapp-c82fa.firebaseio.com',
  projectId: 'socialapp-c82fa',
  storageBucket: 'socialapp-c82fa.appspot.com',
  messagingSenderId: '346717562810',
  appId: '1:346717562810:web:3cb19d9d7a76ee4947df83',
  measurementId: 'G-JJMDR1NXCB'
};
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

app.get('/screams', async (req, res) => {
  try {
    const data = await db
      .collection('screams')
      .orderBy('createdAt', 'desc')
      .get();
    let screams = [];
    data.forEach(doc => {
      screams.push({
        screamId: doc.id,
        ...doc.data()
      });
    });
    return res.json(screams);
  } catch (error) {
    console.error(error);
    ('something went wrong');
  }
});

app.post('/scream', async (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  try {
    const doc = await db.collection('screams').add(newScream);
    return res.json({
      message: `Document ${doc.id} created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'something went wrong' });
    console.error(error);
  }
});

// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // TODO: validate data
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({
          handle: 'This handle is already taken'
        });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(error => {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email already in use' });
      } else {
        return res.status(500).json({ error: error.code });
      }
    });
});

exports.api = functions.region('europe-west1').https.onRequest(app);
