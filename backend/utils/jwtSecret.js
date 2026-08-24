// A single source of truth for the token signing key.
//
// Both the token issuer and the verifier used to fall back to the literal
// string 'secret' when JWT_SECRET was unset. Because that fallback is in the
// source tree, anyone could mint a token for any user id. Fail loudly at
// startup instead of running with a publicly known key.
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Add it to backend/.env — see .env.example. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
  return secret;
};

module.exports = { getJwtSecret };
