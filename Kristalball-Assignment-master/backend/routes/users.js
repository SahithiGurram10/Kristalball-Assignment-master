const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Users, UserRole, Role  } = require('../models/index');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const logger = require('../utils/logger');


// Register User (Admin-only)
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, full_name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Users.create({
      username,
      password_hash: hashedPassword,
      email,
      full_name,
      created_at: new Date()
    });

    logger.info({ action: 'USER_REGISTERED', user: req.user.username, target: newUser.username });
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username } });
  if (!user) return res.status(400).json({ message: 'Invalid username or password' });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });


  const roles = await UserRole.findAll({
  where: { user_id: user.user_id },
  include: Role
  });

  const roleNames = roles.map(r => r.Role.role_name);

  const token = jwt.sign(
  { id: user.user_id, username: user.username, roles: roleNames },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
  );

  logger.info({ action: 'USER_LOGIN', user: user.username });
  res.json({ token });
});

module.exports = router;
