const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
function auth (req,res,next){
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json({message:"No token provided"});
    }
    const token = authHeader.split(' ')[1];
    if (!token){
        return res.status(401).json({message: 'Malformed authorization header'});
    }
    try {
        console.log('Token recived', token);
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err){
        console.log('jwt verify failed', err.message)
        return res.status(401).json({message:"invalid or expired token"});
    };
};

module.exports = auth;
