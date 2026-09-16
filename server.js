const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ path: './.env.student' });
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

app.set('trust proxy', true);

connectDB();


const logger = require('./middleware/logger');
app.use(logger);

app.use(express.json());

const pages = ['dashboard', 'login', 'register', 'profile', 'results', 'admin', 'superadmin', 'soc','About', 'Contact'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${page}.html`));
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/user'));
app.use('/api/courses', require('./routes/course'));
app.use(express.static('public'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/results', require('./routes/results'));
app.use('/api/logs', require('./routes/logs'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));