const express = require("express");
const router = express.Router();
const Course = require('../models/course');
const auth = require("../middleware/auth");
const rolecheck = require("../middleware/roleCheck");
const roleCheck = require("../middleware/roleCheck");

router.post('/', auth, roleCheck("admin","super_admin"),async(req,res) =>{
    try{
        const {title,code,semester,capacity} = req.body;
        const course = await Course.create({
            title,
            code,
            semester,
            capacity,
            createdBy : req.user.userId
        });
        res.status(201).json({success: true , message:'course created', data: course});
    }catch (err) {
    console.error(err);
    if (err.code === 11000) {
        return res.status(409).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'failed to create course' });
    }
});

router.get("/", async(req,res) => {
    try{
        const courses = await Course.find();
        res.status(200).json({success: true, data:courses});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Failed to fetch courses"});
    }
});

router.get('/:id', async(req,res) => {
    try{
        const course = await Course.findById(req.params.id);
        if (!course){
            return res.status(404).json({ message:"course not found"});
        }
        res.status(200).json({ success: true, data: course});
    }catch (err){
        console.error(err);
        res.status(500).json({message : "failed to fetch course"});
    }
});

router.put('/:id', auth, roleCheck('admin', 'super_admin'), async(req,res) =>{
    try{
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        if (!updatedCourse){
            return res.status(400).json({message: 'course not found '});
        }
        res.status(200).json({ success: true, message: "course updated!", data: updatedCourse})
    }catch(err){
        console.error(err);
        res.status(500).json({ message : "failed to update course"});
    }
});

router.delete('/:id', auth, roleCheck('admin', "super_admin"), async(req, res) => {
    try {
        const deletdCourse = await Course.findByIdAndDelete(req.params.id);
        if(!deletdCourse){
            return res.status(404).json({message : "course not found"});
        }
        res.status(200).json({success: true, message:"course deleted! ", data: deletdCourse});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'failed to delete course'});
    }
});

router.post('/:id/register', auth, async(req,res) =>{
    try{
        const {userId} = req.body;
        const course = await Course.findById(req.params.id);
        if(!course){
            return res.status(404).json({message: "Not Found !"});
        }
        if (course.enrolledStudents.length >= course.capacity){
            return res.status(400).json({message : 'Course is full'});
        }
        course.enrolledStudents.push(userId);
        await course.save();
        const Result = require('../models/result');
        await Result.create({
            student: userId,
            course: req.params.id,
            semester: course.semester,
            attendance: 0
        });
        res.status(200).json({ success: true, message: "Registered for course", data: course});
    }catch(err){
        console.error(err);
        res.status(500).json({message:'failed to register for course'});
    }
});

router.post('/:id/drop', auth, async (req,res) =>{
    try{
        const{userId} = req.body
        const course = await Course.findById(req.params.id);
        if (!course){
            return res.status(404).json({message:'course not found'});
        }
        course.enrolledStudents = course.enrolledStudents.filter(
            (id) => id.toString() !==userId
        );
        await course.save();
        res.status(200).json({success: true, message:'dropped from course ', data : course});
    }catch (err){
        console.error(err);
        res.status(500).json({ message: "failed to drop course"});
    }
});





module.exports = router;