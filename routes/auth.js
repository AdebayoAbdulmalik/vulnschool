const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;


router.post('/register', async (req, res) => {
    try{
        const {name,email,password} = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({name,email, password: hashedPassword});

    res.status(201).json({success: true, message: "Acount created happy hacking !", userId:user._id});
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Registration Failed'});
    }
})

router.post('/login', async(req,res)=>{
    try{
        const{email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({ message: 'Wrong mail' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        const token = jwt.sign(
        {userId : user._id, email : user.email, role : user.role},
        JWT_SECRET,
        {expiresIn: '4h'}
        );
        res.json({success : true, token, role: user.role});
    } catch(err){
        console.error(err);
        res.status(500).json({message:"login failed"})
    }
})




module.exports = router;