// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        throw new Error(errors.array()[0].msg);
    }

    const { username, email, password, full_name, phone, address } = req.body;

    // Check if user exists
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
        res.status(400);
        throw new Error('Email already registered');
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
        res.status(400);
        throw new Error('Username already taken');
    }

    // Create user
    const userId = await UserModel.create({
        username,
        email,
        password,
        full_name,
        phone,
        address
    });

    // Get created user
    const user = await UserModel.findById(userId);

    res.status(201).json({
        success: true,
        message: 'Registration successful! Please login to continue.',
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name
        }
        // REMOVED: token is not returned
    });
});