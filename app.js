require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const db = require('./config/db');
const requestResponseLogger = require('./middlewares/requestResponseLogger');
const loginRoutes = require('./routes/loginRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
// const registerRoutes = require('./routes/registerRoutes');
// const logoutRoutes = require('./routes/logoutRoutes');

const app = express();

const PORT = process.env.PORT || 3003;

app.use(requestResponseLogger);

app.use('/api', loginRoutes);
app.use('/api', adminRoutes);

// Password reset routes
app.use('/api', passwordRoutes);

app.use('/api', vendorRoutes);

app.use(cookieParser());
// 404 error
//   - Error format: { "response": "error", "error": "message" } or { "response": "error", "error": ["msg1", "msg2"] }
app.use((req, res, next) => {
    res.status(404).json({ response: "error", error: "Route not found" });
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});