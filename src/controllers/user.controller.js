const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

const User = require('../models/user.model');
const { ConflictError, BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');

exports.register = async (req, res, next) => {
  const { name, email, password, bio } = req.body;
  if (!name || !email || !password) {
    return next(new BadRequestError('name, email, and password are required.'));
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      bio
    });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError('Email already exists.'));
    }
    next(new BadRequestError(err.message));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError('email and password are required.'));
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new UnauthorizedError('Invalid credentials.'));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new UnauthorizedError('Invalid credentials.'));
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    next(new BadRequestError(err.message));
  }
};

exports.details = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'posts'
      });
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
    res.status(200).json(user);
  } catch (err) {
    next(new BadRequestError(err.message));
  }
};

