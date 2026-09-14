const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ path: './.env.student' });
const express = require('express');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json());
const logger = require('./middleware/logger');
app.use(logger);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/user'));
app.use('/api/courses', require('./routes/course'));
app.use(express.static('public'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/results', require('./routes/results'));
app.use('/api/logs', require('./routes/logs'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));