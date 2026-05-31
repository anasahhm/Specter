import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, ActivityLog } from '../models/index.js';

const router = express.Router();

const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// REGISTER


router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const user = new User({
      email,
      password,
      displayName: displayName || email.split('@')[0]
    });

    await user.save();

    const apiKey = crypto.randomBytes(32).toString('hex');
    user.apiKey = apiKey;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      ipAddress: req.ip
    });

    const token = generateToken(user._id, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      apiKey,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        subscriptionTier: user.subscriptionTier
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});


// LOGIN


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

  
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    
    user.lastLogin = new Date();
    await user.save();

    
    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      ipAddress: req.ip
    });

    const token = generateToken(user._id, user.email);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        subscriptionTier: user.subscriptionTier,
        investigationLimit: user.investigationLimit,
        investigationsUsed: user.investigationsUsed
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET PROFILE


router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        subscriptionTier: user.subscriptionTier,
        investigationLimit: user.investigationLimit,
        investigationsUsed: user.investigationsUsed,
        settings: user.settings,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// UPDATE PROFILE

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { displayName, settings } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      {
        ...(displayName && { displayName }),
        ...(settings && { settings: { ...settings } })
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        settings: user.settings
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


// LOGOUT


router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await ActivityLog.create({
        userId: decoded.id,
        action: 'logout',
        ipAddress: req.ip
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;

