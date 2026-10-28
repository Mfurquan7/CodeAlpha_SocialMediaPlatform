const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('../database');

// Ensure tables exist
initDatabase();

console.log('Seeding initial fictional demo data into Vibely SQLite database...');

// Clean existing data for reproducible seeding
db.exec('DELETE FROM follows;');
db.exec('DELETE FROM comments;');
db.exec('DELETE FROM likes;');
db.exec('DELETE FROM posts;');
db.exec('DELETE FROM users;');

// Reset sqlite sequences
try {
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'posts', 'likes', 'comments', 'follows');");
} catch {
  // Ignored if sqlite_sequence is empty
}

const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('Password123!', salt);

// Demo Users
const users = [
  {
    name: 'Sarah Chen',
    username: 'sarah_chen',
    email: 'sarah@vibely.dev',
    bio: 'Product designer & creative technologist. Passionate about typography, design systems, and delightful UX.',
    avatar_color: '#6C4CF1'
  },
  {
    name: 'Alex Rivera',
    username: 'alex_codes',
    email: 'alex@vibely.dev',
    bio: 'Full-stack software engineer building fast web apps with React & Node. Coffee enthusiast & open-source contributor.',
    avatar_color: '#3B82F6'
  },
  {
    name: 'Priya Patel',
    username: 'priya_ux',
    email: 'priya@vibely.dev',
    bio: 'Senior UI/UX Architect. Obsessed with accessibility, micro-interactions, and human-centered design.',
    avatar_color: '#EC4899'
  },
  {
    name: 'Marcus Vance',
    username: 'marcus_v',
    email: 'marcus@vibely.dev',
    bio: 'Engineering Lead & tech mentor. Exploring distributed systems, clean code, and team productivity.',
    avatar_color: '#10B981'
  }
];

const insertUser = db.prepare(`
  INSERT INTO users (name, username, email, password_hash, bio, avatar_color)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const createdUserIds = [];
for (const u of users) {
  const result = insertUser.run(u.name, u.username, u.email, passwordHash, u.bio, u.avatar_color);
  createdUserIds.push(Number(result.lastInsertRowid));
}

console.log(`Created ${createdUserIds.length} demo users.`);

// Demo Posts
const posts = [
  {
    userId: createdUserIds[0], // Sarah
    content: "Just shipped the new Vibely design system! Focusing on restrained violet accents, consistent 8px grid spacing, and high-legibility typography makes such a massive difference in user focus. What do you think?"
  },
  {
    userId: createdUserIds[1], // Alex
    content: "Clean architecture is not about writing fewer lines of code; it's about making future modifications effortless and predictable. Parameterized queries, clear route layers, and atomic components are a dev's best friends."
  },
  {
    userId: createdUserIds[2], // Priya
    content: "Pro-tip for UI designers: Always test your color contrast with WCAG standards early on. A beautiful violet like #6C4CF1 against pure white cards gives both emotional warmth and perfect readability."
  },
  {
    userId: createdUserIds[3], // Marcus
    content: "Welcome to Vibely! Really excited to see an internship project built with this level of attention to visual detail, relational database integrity, and smooth interaction states. Great work!"
  },
  {
    userId: createdUserIds[0], // Sarah
    content: "Morning coffee ritual + sketching wireframes before touching Figma. Analog thinking before digital execution keeps your ideas much more grounded."
  }
];

const insertPost = db.prepare(`
  INSERT INTO posts (user_id, content)
  VALUES (?, ?)
`);

const createdPostIds = [];
for (const p of posts) {
  const res = insertPost.run(p.userId, p.content);
  createdPostIds.push(Number(res.lastInsertRowid));
}
console.log(`Created ${createdPostIds.length} demo posts.`);

// Demo Likes
const insertLike = db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)');
insertLike.run(createdUserIds[1], createdPostIds[0]); // Alex likes Sarah's post
insertLike.run(createdUserIds[2], createdPostIds[0]); // Priya likes Sarah's post
insertLike.run(createdUserIds[3], createdPostIds[0]); // Marcus likes Sarah's post
insertLike.run(createdUserIds[0], createdPostIds[1]); // Sarah likes Alex's post
insertLike.run(createdUserIds[2], createdPostIds[1]); // Priya likes Alex's post
insertLike.run(createdUserIds[1], createdPostIds[2]); // Alex likes Priya's post
insertLike.run(createdUserIds[0], createdPostIds[3]); // Sarah likes Marcus's post
console.log('Seeded demo likes.');

// Demo Comments
const insertComment = db.prepare('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)');
insertComment.run(createdUserIds[1], createdPostIds[0], "The Midnight Violet aesthetic is stunning, Sarah! Super clean.");
insertComment.run(createdUserIds[2], createdPostIds[0], "The contrast between the soft lavender and deep violet is so cohesive.");
insertComment.run(createdUserIds[0], createdPostIds[1], "100% agreed Alex. Maintainability is the true test of engineering quality.");
insertComment.run(createdUserIds[3], createdPostIds[2], "Bookmarked this tip. Crucial for enterprise UX.");
console.log('Seeded demo comments.');

// Demo Follows
const insertFollow = db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)');
insertFollow.run(createdUserIds[0], createdUserIds[1]); // Sarah follows Alex
insertFollow.run(createdUserIds[0], createdUserIds[2]); // Sarah follows Priya
insertFollow.run(createdUserIds[1], createdUserIds[0]); // Alex follows Sarah
insertFollow.run(createdUserIds[2], createdUserIds[0]); // Priya follows Sarah
insertFollow.run(createdUserIds[3], createdUserIds[0]); // Marcus follows Sarah
insertFollow.run(createdUserIds[3], createdUserIds[1]); // Marcus follows Alex
console.log('Seeded demo follows.');

console.log('Database seeded successfully!');
console.log('Demo Login: sarah@vibely.dev or alex@vibely.dev with password: Password123!');
