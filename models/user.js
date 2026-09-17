const { default: mongoose } = require('mongoose');
const mogoose = require ('mongoose');

const userSchema = new mongoose.Schema({
    name :{
        type : String ,
        required : true 
    },

    email :{
        type : String ,
        unique : true,
        required : true
    },

    password: {
        type : String,
        required : true
    },

    role : {
        type : String,
        enum : ['student', 'admin', 'super_admin'],
        default : "student"
    },

    registeredCourses: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "course"
        }
    ],

    bio:{
        type:String,
        default:''
    },
    website:{
        type:String,
        default:''
    },

    profile:{
        type:String,
        default:''
    },
    createdAt: {
    type: Date,
    default: Date.now,
    expires: 432000  // 5 days in seconds
}
});

module.exports = mongoose.model('User', userSchema);