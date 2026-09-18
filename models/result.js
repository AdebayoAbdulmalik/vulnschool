const mongoose = require('mongoose');
const resultSchema = new mongoose.Schema({
    
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        index:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required:true
    },
    grade :{
        type:String
    },
    score:{
        type:Number
    },
    attedance:{
        type:Number,
        default:0
    },
    semester:{
        type:String,
        required:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdAt: {
    type: Date,
    default: Date.now,
    expires: 432000  // 5 days in seconds
}
})

module.exports = mongoose.model('Result', resultSchema);