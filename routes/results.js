const express = require('express');
const router = express.Router();
const Result = require('../models/result');
const auth = require('../middleware/auth');
const Course = require('../models/course');
const roleCheck = require('../middleware/roleCheck');

router.post('/',auth,roleCheck('admin','super_admin'), async (req,res) => {
    try{
        const{student,course,grade,score,attedance,semester} = req.body;
        const result = await Result.create({
            student,
            course,
            grade,
            score,
            attedance,
            semester,
            createdBy: req.user.userId
        });
        res.status(201).json({success: true, message: "Reslt created ! ", data: result});
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create result' });
    }
});

router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const results = await Result.find({ student: req.params.studentId })
            .populate('course', 'title code')
            .populate('student', 'name email');

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch results' });
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
        const updatedResult = await Result.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedResult) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.status(200).json({ success: true, message: 'Result updated', data: updatedResult });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update result' });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const deleted = await Result.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.status(200).json({ success: true, message: 'Result deleted', data: deleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete result' });
    }
});

module.exports = router;