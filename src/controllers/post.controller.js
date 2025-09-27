const Post = require('../models/post.model');

exports.create = async (req, res) => {
	try {
		const { title, text } = req.body;
		// El usuario autenticado es el author
		const author = req.user.id;
		const post = new Post({ title, text, author });
		await post.save();
		await post.populate({
			path: 'author',
			select: 'name email bio active createdAt updatedAt -_id'
		});
		res.status(201).json(post);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

exports.getAll = async (req, res) => {
	try {
		// Solo los posts del usuario autenticado
		const posts = await Post.find({ author: req.user.id })
			.populate({
				path: 'author',
				select: 'name email bio active createdAt updatedAt -_id'
			});
		res.status(200).json(posts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getById = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
			.populate({
				path: 'author',
				select: 'name email bio active createdAt updatedAt -_id'
			});
		if (!post) return res.status(404).json({ error: 'Post not found' });
		// Verificar que el usuario autenticado es el author
		if (post.author && post.author.email && req.user.email !== post.author.email) {
			return res.status(403).json({ error: 'Unauthorized access' });
		}
		res.status(200).json(post);
	} catch (err) {
		res.status(404).json({ error: 'Post not found' });
	}
};

exports.update = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ error: 'Post not found' });
		if (String(post.author) !== req.user.id) {
			return res.status(403).json({ error: 'Unauthorized access' });
		}
		const updates = {};
		['title', 'text'].forEach(field => {
			if (req.body[field] !== undefined) updates[field] = req.body[field];
		});
		Object.assign(post, updates);
		await post.save();
		await post.populate({
			path: 'author',
			select: 'name email bio active createdAt updatedAt -_id'
		});
		res.status(200).json(post);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

exports.delete = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ error: 'Post not found' });
		if (String(post.author) !== req.user.id) {
			return res.status(403).json({ error: 'Unauthorized access' });
		}
		await post.deleteOne();
		res.status(204).send();
	} catch (err) {
		res.status(404).json({ error: 'Post not found' });
	}
};
