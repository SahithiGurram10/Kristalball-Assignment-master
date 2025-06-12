const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_jwt_secret_key'; // Ideally from process.env

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      username: user.username,
      roles: user.roles.map(role => role.role_name)
    },
    SECRET_KEY,
    { expiresIn: '8h' }
  );
};

module.exports = { generateToken, SECRET_KEY };
