const router = require('express').Router();
const { User, Blog, Comment } = require('../../models');

//----- GET all users -----//
router.get('/', (req, res) => {
  User.findAll({
    attributes: { exclude: ['password'] },
  })
    .then((userData) => res.json(userData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//----- GET a single user by ID -----//
router.get('/:id', (req, res) => {
  User.findOne({
    attributes: {
      exclude: ['password'],
    },
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: Blog,
        attributes: ['id', 'title', 'content', 'created_at'],
      },
      {
        model: Comment,
        attributes: ['id', 'content', 'created_at'],
      },
    ],
  })
    .then((userData) => {
      if (!userData) {
        res.status(404).json({ message: 'No developer found with that ID!' });
        return;
      }
      res.json(userData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//----- POST - Create a user -----//
router.post('/', (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  })
    .then((userData) => {
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.username = userData.username;
        req.session.loggedIn = true;

        res.json(userData);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//----- POST - User login -----//
router.post('/login', (req, res) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  }).then((userData) => {
    if (!userData) {
      res.json(400).json({ message: "That username doesn't exist!" });
      return;
    }

    const validPassword = userData.passwordConfirm(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: "That's not the right password..." });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.username = userData.username;
      req.session.loggedIn = true;

      res.json({
        user: userData,
        message: `Hi ${userData.username}, you're logged in! Time to blog!!`,
      });
    });
  });
});

//---- POST - User logout ----//
router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

//---- PUT - update a user ----//
router.put('/:id', (req, res) => {
  User.update(req.body, {
    individualHooks: true,
    where: {
      id: req.params.id,
    },
  })
    .then((userData) => {
      if (!userData) {
        res.status(400).json({ message: 'No developer found with that ID!' });
      }
      res.json(userData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//---- DELETE - delete a user ----//
router.delete('/:id', (req, res) => {
  User.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((userData) => {
      if (!userData) {
        res.status(404).json({ message: 'No developer found with that ID!' });
        return;
      }
      res.json(userData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
