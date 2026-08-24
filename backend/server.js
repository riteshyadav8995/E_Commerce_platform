require('dotenv').config();

const { getJwtSecret } = require('./utils/jwtSecret');

// Fail fast on missing required config rather than at the first login attempt.
try {
  getJwtSecret();
} catch (err) {
  console.error(`\nStartup aborted: ${err.message}\n`);
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
