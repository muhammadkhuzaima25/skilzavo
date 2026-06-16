import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      profilePicture: user.profilePicture || user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      profilePicture: user.profilePicture || user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const fields = ['name', 'bio', 'skills', 'experience', 'hourlyRate', 'portfolio', 'avatar', 'profilePicture', 'username', 'phone', 'location', 'languages', 'portfolioWebsite', 'linkedinUrl', 'githubUrl', 'fiverrUrl'];
    const updates = {};
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (req.file) {
      updates.profilePicture = req.file.path;
      updates.avatar = req.file.path;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const item = user.portfolio.id(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    if (req.body.title !== undefined) item.title = req.body.title;
    if (req.body.description !== undefined) item.description = req.body.description;
    if (req.body.link !== undefined) item.link = req.body.link;
    if (req.body.tags !== undefined) item.tags = req.body.tags;
    if (req.file) item.image = req.file.path;
    await user.save();
    res.json(user.portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const item = {
      title: req.body.title,
      description: req.body.description || '',
      image: req.file ? req.file.path : '',
      link: req.body.link || '',
      tags: req.body.tags || [],
    };
    user.portfolio.push(item);
    await user.save();
    res.status(201).json(user.portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.portfolio.pull({ _id: req.params.id });
    await user.save();
    res.json(user.portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: req.file.path, avatar: req.file.path },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: '', avatar: '' },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: sub + process.env.JWT_SECRET,
        role: role || 'customer',
        avatar: picture || '',
        profilePicture: picture || '',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || picture,
      profilePicture: user.profilePicture || user.avatar || picture,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
