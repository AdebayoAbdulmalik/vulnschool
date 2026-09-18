const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ path: './.env.student' });
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const compression = require('compression');
const fs = require('fs');
const app = express();

app.set('trust proxy', true);

connectDB();


const logger = require('./middleware/logger');
app.use(logger);
app.use(compression());
app.use(express.json());

const pages = ['dashboard', 'login', 'register', 'profile', 'results', 'admin', 'superadmin', 'soc','About', 'Contact'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${page}.html`));
    });
});
const cors = require('cors');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-soc-password']
}));
app.options('/{*path}', cors());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/user'));
app.use('/api/courses', require('./routes/course'));
app.use(express.static('public', {
    maxAge: '1d',              
    etag: true
}));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/results', require('./routes/results'));
app.use('/api/logs', require('./routes/logs'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

setInterval(() => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) return;

    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    const fiveDays = 5 * 24 * 60 * 60 * 1000;

    files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > fiveDays) {
            fs.unlinkSync(filePath);
            console.log(`Deleted old upload: ${file}`);
        }
    });
}, 24 * 60 * 60 * 1000);