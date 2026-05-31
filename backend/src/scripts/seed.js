// backend/src/scripts/seed.js
// Creates a demo user only. No fake investigation data is seeded.
// Investigations must be created through the real Wire API pipeline.

import { User } from '../models/index.js';
import mongoose from 'mongoose';
import 'dotenv/config';

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existing = await User.findOne({ email: 'demo@specter.ai' });
    if (existing) {
      console.log('Demo user already exists:', existing.email);
      await mongoose.disconnect();
      return;
    }

    const demoUser = new User({
      email: 'demo@specter.ai',
      password: 'demopassword123',
      displayName: 'Demo User',
      subscriptionTier: 'pro'
    });

    await demoUser.save();
    console.log('✓ Demo user created:', demoUser.email);
    console.log('  Note: No fake investigations seeded.');
    console.log('  All investigations must use the live Wire API.');

    await mongoose.disconnect();
    console.log('Done.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
