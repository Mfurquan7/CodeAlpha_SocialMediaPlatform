const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const AVATAR_COLORS = [
  '#6C4CF1', // Midnight Violet
  '#5635D8', // Deep Violet
  '#3B82F6', // Ocean Blue
  '#10B981', // Emerald Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4'  // Cyan
];

/**
 * Register a new user
 */
function register(req, res) {
  try {
    let { name, username, email, password, bio } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    name = name.trim();
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();
    bio = bio ? bio.trim() : '';

    // Check valid username characters (letters, numbers, underscores)
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores.' });
    }

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check duplicate username
    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
    }

    // Check duplicate email
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Pick avatar color based on username hash
    const colorIndex = Math.abs(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % AVATAR_COLORS.length;
    const avatarColor = AVATAR_COLORS[colorIndex];

    const insertStmt = db.prepare(`
      INSERT INTO users (name, username, email, password_hash, bio, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(name, username, email, passwordHash, bio, avatarColor);
    const userId = Number(result.lastInsertRowid);

    const user = {
      id: userId,
      name,
      username,
      email,
      bio,
      avatar_color: avatarColor,
      created_at: new Date().toISOString()
    };

    // Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

/**
 * Log in an existing user
 */
function login(req, res) {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Username or email is required.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    identifier = identifier.trim().toLowerCase();

    // Query user by email or username
    const userStmt = db.prepare(`
      SELECT id, name, username, email, password_hash, bio, avatar_color, created_at
      FROM users
      WHERE username = ? OR email = ?
    `);

    const user = userStmt.get(identifier, identifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password does not match.' });
    }

    // Remove password_hash before returning
    delete user.password_hash;

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Logged in successfully!',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

/**
 * Get currently authenticated user
 */
function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};
