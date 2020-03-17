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

const isEmpty = string => {
  if (string.trim() === '') return true;
  else return false;
};

// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const isEmail = email => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = 'Must not be empty';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address';
  }

  if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = 'Passwords must match';

  if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);
  // TODO: validate data

  let token, userId;
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
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
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

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
});

exports.api = functions.region('europe-west1').https.onRequest(app);
