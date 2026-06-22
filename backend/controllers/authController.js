// Restarting server to load new Prisma Client... again
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { sendEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please add all required fields (name, email, password, phone)' });
    }

    // Sanitize email: remove spaces, lowercase
    email = email.trim().replace(/\s+/g, '').toLowerCase();

    // Validate phone: 10 digits, numbers only
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Require verified OTP
    const verifiedOtp = await prisma.otpVerification.findFirst({
      where: {
        email,
        verified: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verifiedOtp) {
      return res.status(400).json({ message: 'Email not verified. Please verify OTP first.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role based on email domain
    let targetRoleName = 'Customer';
    if (email.endsWith('@luxestore.co.in')) {
      targetRoleName = 'Admin';
    }

    let role = await prisma.role.findUnique({ where: { name: targetRoleName } });

    if (!role) {
      role = await prisma.role.create({ data: { name: targetRoleName } });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phone,
        roleId: role.id,
      },
      include: { role: true },
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpVerification.create({
      data: {
        email,
        otp,
        expiresAt
      }
    });

    await sendEmail({
      to: email,
      subject: 'LuxeStore Registration OTP',
      text: `Your OTP for LuxeStore registration is ${otp}. It expires in 5 minutes.`
    });

    res.json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error("sendOtp Error:", error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        otp,
        expiresAt: { gt: new Date() },
        verified: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error("verifyOtp Error:", error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  sendOtp,
  verifyOtp
};
