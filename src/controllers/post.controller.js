const Post = require('../models/post.model');
const { NotFoundError, UnauthorizedError, BadRequestError } = require('../utils/errors');

exports.create = async (req, res, next) => {
	const { title, text } = req.body;
	if (!title || !text) return next(new BadRequestError('title and text are required'));
	const author = req.user.id;
	try {
		const post = new Post({ title, text, author });
		await post.save();
		await post.populate({
			path: 'author',
			select: 'name email bio active createdAt updatedAt -_id'
		});
		res.status(201).json(post);
	} catch (err) {
		next(new BadRequestError(err.message));
	}
};

exports.getAll = async (req, res, next) => {
	try {
		const posts = await Post.find({ author: req.user.id })
			.populate({
				path: 'author',
				select: 'name email bio active createdAt updatedAt -_id'
			});
		res.status(200).json(posts);
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id)
			.populate({
				path: 'author',
				select: 'name email bio active createdAt updatedAt -_id'
			});
		if (!post) return next(new NotFoundError('Post not found'));
		if (post.author && post.author.email && req.user.email !== post.author.email) {
			return next(new UnauthorizedError('Unauthorized access'));
		}
		res.status(200).json(post);
	} catch (err) {
		next(new NotFoundError('Post not found'));
	}
};

exports.update = async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return next(new NotFoundError('Post not found'));
		if (String(post.author) !== req.user.id) {
			return next(new UnauthorizedError('Unauthorized access'));
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
		next(new BadRequestError(err.message));
	}
};

exports.delete = async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return next(new NotFoundError('Post not found'));
		if (String(post.author) !== req.user.id) {
			return next(new UnauthorizedError('Unauthorized access'));
		}
		await post.deleteOne();
		res.status(204).send();
	} catch (err) {
		next(new NotFoundError('Post not found'));
	}
};
