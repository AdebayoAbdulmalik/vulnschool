const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/user');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create the uploads folder if it doesn't exist yet
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, req.user.userId + '_' + file.originalname);
    }
});

const upload = multer({ storage });
router.get('/debug', auth, (req, res) => {
    const uploadDir = path.join(__dirname, '../uploads');
    const exists = fs.existsSync(uploadDir);
    const files = exists ? fs.readdirSync(uploadDir) : [];
    res.json({ 
        uploadDir, 
        exists, 
        files,
        cwd: process.cwd()
    });
});
router.post('/profile-picture', auth, upload.single('picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
         await User.findByIdAndUpdate(req.user.userId, {
            profilePicture: req.file.filename
        });
        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded',
            filename: req.file.filename,
            path: req.file.path  
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
});


router.get('/file', auth, (req, res) => {
    const filename = req.query.name;
    if (!filename) {
        return res.status(400).json({ message: 'No filename provided' });
    }
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
});

module.exports = router;
