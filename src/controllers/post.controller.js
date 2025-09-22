const Post = require('../models/post.model');

exports.create = async (req, res) => {
	try {
		const { title, text, author } = req.body;
		const post = new Post({ title, text, author });
		await post.save();
		res.status(201).json(post);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

exports.getAll = async (req, res) => {
	try {
		const posts = await Post.find();
		res.status(200).json(posts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getById = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ error: 'Post not found' });
		res.status(200).json(post);
	} catch (err) {
		res.status(404).json({ error: 'Post not found' });
	}
};

exports.update = async (req, res) => {
	try {
		const updates = {};
		['title', 'text', 'author'].forEach(field => {
			if (req.body[field] !== undefined) updates[field] = req.body[field];
		});
		const post = await Post.findByIdAndUpdate(
			req.params.id,
			updates,
			{ new: true, runValidators: true }
		);
		if (!post) return res.status(404).json({ error: 'Post not found' });
		res.status(200).json(post);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

exports.delete = async (req, res) => {
	try {
		const post = await Post.findByIdAndDelete(req.params.id);
		if (!post) return res.status(404).json({ error: 'Post not found' });
		res.status(204).send();
	} catch (err) {
		res.status(404).json({ error: 'Post not found' });
	}
};
