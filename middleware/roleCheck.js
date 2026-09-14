function roleCheck(...allowedRole){
    return(req,res,next) =>{
        if (!req.user){
            return res.status(401).json({message:"Not authenticated"});
        }
        if(!allowedRole.includes(req.user.role)){
            return res.ststus(403).json({messae:"Forbidden: insufficient permissio"});
        }
        next();
    };

}
module.exports = roleCheck