const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentDetails: user.studentDetails || null,
            collegeDetails: user.collegeDetails || null,
            vendorDetails: user.vendorDetails || null,
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, collegeDetails, studentDetails, vendorDetails } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            collegeDetails,
            studentDetails,
            vendorDetails
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email is already registered' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // Mock getting me without middleware for now, just checking token header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if(!token) return res.status(401).json({ success: false, error: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(401).json({ success: false, error: 'Not authorized' });
    }
};

// @desc    Get all students
// @route   GET /api/auth/students
// @access  Private (College only)
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all colleges
// @route   GET /api/auth/colleges
// @access  Public
exports.getColleges = async (req, res) => {
    try {
        const colleges = await User.find({ role: 'college' }).select('name email collegeDetails');
        res.status(200).json({ success: true, count: colleges.length, data: colleges });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) return res.status(401).json({ success: false, error: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { name, email, vendorDetails, collegeDetails, studentDetails } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (vendorDetails) updateFields.vendorDetails = vendorDetails;
        if (collegeDetails) updateFields.collegeDetails = collegeDetails;
        if (studentDetails) updateFields.studentDetails = studentDetails;

        const updatedUser = await User.findByIdAndUpdate(decoded.id, updateFields, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        sendTokenResponse(updatedUser, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
