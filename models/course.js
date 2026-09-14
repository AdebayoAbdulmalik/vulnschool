const mongoose = require('mongoose');
const Course = require('../models/course');
const User = require('../models/user');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    semester: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Course', courseSchema);