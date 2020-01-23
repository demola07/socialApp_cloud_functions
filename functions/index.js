/* Visit https://firebase.google.com/docs/database/security to learn more about security rules. */
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const functions = require('firebase-functions');

const admin = require('firebase-admin');
const serviceAccount = require('./utils/serviceAcctKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

// exports.getScreams = functions.https.onRequest((req, res) => {
//   admin
//     .firestore()
//     .collection('screams')
//     .get()
//     .then(data => {
//       let screams = [];
//       data.forEach(doc => {
//         screams.push(doc.data());
//       });
//       return res.json(screams);
//     })
//     .catch(error => {
//       console.error(error);
//     });
// });

exports.getScreams = functions.https.onRequest(async (req, res) => {
  try {
    const data = await admin
      .firestore()
      .collection('screams')
      .get();
    let screams = [];
    data.forEach(doc => {
      screams.push(doc.data());
    });
    return res.json(screams);
  } catch (error) {
    console.error(error);
    ('something went wrong');
  }
});

// exports.createScream = functions.https.onRequest((req, res) => {
//   const newScream = {
//     body: req.body.body,
//     userHandle: req.body.userHandle,
//     createdAt: admin.firestore.Timestamp.fromDate(new Date())
//   };
//   admin
//     .firestore()
//     .collection('screams')
//     .add(newScream)
//     .then(doc => {
//       res.json({
//         message: `Document ${doc.id} created successfully`
//       });
//     })
//     .catch(error => {
//       res.status(500).json({ error: 'something went wrong' });
//       console.error(error);
//     });
// });

exports.createScream = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Method not allowed' });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
