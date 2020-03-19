const { db } = require('../utils/admin');

exports.getAllScreams = async (req, res) => {
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
};

exports.postOneScream = async (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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
};

//Fetch one Scream
exports.getScream = (req, res) => {
  let screamData = {};

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }

      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', req.params.screamId)
        .get();
    })
    .then(data => {
      screamData.comments = [];
      data.forEach(doc => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Comment on a Scream
exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ error: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      return db
        .collection('comments')
        .add(newComment)
        .then(() => {
          res.json(newComment);
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'something went wrong' });
        });
    });
};
