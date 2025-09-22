const express = require('express');
const post = require("../controllers/post.controller");

const router = express.Router();

router.post('/posts', post.create);
router.get('/posts', post.getAll);
router.get('/posts/:id', post.getById);
router.patch('/posts/:id', post.update);
router.delete('/posts/:id', post.delete);

module.exports = router;