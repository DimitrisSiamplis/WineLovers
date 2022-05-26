const mongoose = require('mongoose');

const BlogQuestionSchema = new mongoose.Schema({
    
    Question: { type: String , required: true } , 
    QuestionDate: { type: Date , required: true },
    UserId: {type: String , required: true  } ,
    UserName: { type: String , required: true },
    UserEmail: { type: String , required: true },

}, 
    {collection: 'blogQuestion'}
)


const model = mongoose.model('BlogQuestionSchema' , BlogQuestionSchema)

module.exports = model