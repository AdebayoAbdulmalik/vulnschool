const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', async (req, res) => {
    try {
        const newStudent = await User.create(req.body);
        res.status(201).json({ message: "student created", data: newStudent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create student' });
    }
});

router.get('/', async (req, res) => {
    try {
        const students = await User.find().select('-password');
        res.status(200).json({ success: true, data: students });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch students' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch student' });
    }
});

router.put('/:id', async(req,res) =>{
    try {
        const updateUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        ).select('-password');
        if (!updateUser){
            return res.status(404).json({message : "student not foud"});
        }
        res.status(200).json({success: true, message:"student update", data:updateUser});
    } catch (err){
        console.error(err);
        res.status(500).json({message : "Falied to update user"})
    }
})

router.put("/:id", async(req,res)=>{
    try{
        if(re.body.role === "super_admin"){
            return res.status(403).json({message:"super_admin cannot be set via this route"});
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true} 
        ).select('-password');
        if (!updatedUser){
            return res.status(404).json({message:"student not found"});
        }
        res.status(200).json({success:true, message:"student updated!", data : updatedUser });
    } catch (err){
        console.error(err);
        res.status(500).json({message: "Falied to update student"});
    }

});

router.get('/:id/preview', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!user.website) {
            return res.status(400).json({ message: 'No website set on this profile' });
        }
         const response = await fetch(user.website);
        const body = await response.text();

        res.status(200).json({
            success: true,
            url: user.website,
            preview: body.substring(0, 500) 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch preview' });
    }
});


router.put('/:id/promote', auth, roleCheck('super_admin'), async (req, res) => {
    try {
        const { role } = req.body;

      
        const allowedRoles = ['student', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be student or admin' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ success: true, message: `User role updated to ${role}`, data: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update role' });
    }
});


















module.exports = router;