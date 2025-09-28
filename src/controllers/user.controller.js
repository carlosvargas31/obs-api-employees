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
    let avatar = undefined;
    if (req.file) {
      avatar = `/uploads/avatars/${req.file.filename}`;
    }
    const user = new User({
      name,
      email,
      password: hashedPassword,
      bio,
      avatar
    });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    userObj.activationLink = `http://localhost:8000/api/users/activate/${user._id}`;
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
    if (!user.active) {
      return next(new UnauthorizedError('Account not activated.'));
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


exports.activate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
    if (user.active) {
      return res.status(200).json({ message: 'Account already activated.' });
    }
    user.active = true;
    await user.save();
    res.status(200).json({ message: 'Account activated successfully.' });
  } catch (err) {
    next(new BadRequestError(err.message));
  }
};

exports.details = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.user || req.user.id !== id) {
      return next(new UnauthorizedError('You are not authorized to view this user.'));
    }
    const user = await User.findById(id)
      .select('-password')
      .populate({
        path: 'posts'
      });
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
    const userObj = user.toObject();
    if (userObj.avatar) {
      userObj.avatarUrl = `${req.protocol}://${req.get('host')}${userObj.avatar}`;
    }
    res.status(200).json(userObj);
  } catch (err) {
    next(new BadRequestError(err.message));
  }
};


