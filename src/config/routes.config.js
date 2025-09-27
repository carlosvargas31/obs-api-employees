const express = require('express');

const auth = require("../middleware/auth");
const upload = require('../middleware/avatarUpload');
const user = require("../controllers/user.controller");
const post = require("../controllers/post.controller");

const router = express.Router();

router.post('/login', user.login);
router.post('/users', upload.single('avatar'), user.register);
router.get('/users/activate/:id', user.activate);
router.get('/users/:id', auth, user.details);

router.post('/posts', auth, post.create);
router.get('/posts', auth, post.getAll);
router.get('/posts/:id', auth, post.getById);
router.patch('/posts/:id', auth, post.update);
router.delete('/posts/:id', auth, post.delete);

module.exports = router;