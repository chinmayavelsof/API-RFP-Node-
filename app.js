require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const db = require('./config/db');
const cors = require('cors');
const requestResponseLogger = require('./middlewares/requestResponseLogger');
const loginRoutes = require('./routes/loginRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const RFPRoutes = require('./routes/RFPRoutes');
// const registerRoutes = require('./routes/registerRoutes');
// const logoutRoutes = require('./routes/logoutRoutes');

const app = express();

const PORT = process.env.PORT || 3003;

app.use(requestResponseLogger);
app.use(cors());
app.use('/api', loginRoutes);
app.use('/api', adminRoutes);

// Password reset routes
app.use('/api', passwordRoutes);

app.use('/api', vendorRoutes);
app.use('/api', categoryRoutes);
app.use('/api', RFPRoutes);

app.use(cookieParser());
// All responses use HTTP 200; body indicates success/error via response field
app.use((req, res, next) => {
    res.status(200).json({ response: "error", error: ["Route not found"] });
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});