/* Visit https://firebase.google.com/docs/database/security to learn more about security rules. */
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const functions = require('firebase-functions');

const admin = require('firebase-admin');
const serviceAccount = require('./utils/serviceAcctKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require('express');
const app = express();

app.get('/screams', async (req, res) => {
  try {
    const data = await admin
      .firestore()
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
    const doc = await admin
      .firestore()
      .collection('screams')
      .add(newScream);
    return res.json({
      message: `Document ${doc.id} created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'something went wrong' });
    console.error(error);
  }
});

exports.api = functions.region('europe-west1').https.onRequest(app);
