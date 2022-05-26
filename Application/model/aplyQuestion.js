const mongoose = require('mongoose');

const ApplyQuestionSchema = new mongoose.Schema({
    
    QuestionId: { type: String , required: true } ,
    Aply: { type: String  , required: true },
    AplyDate: { type: Date , required: true },
    AplierId: {type: String , required: true  } ,
    AplierName: { type: String , required: true },
    AplierEmail: { type: String , required: true },
}, 
    {collection: 'aplyQuestion'}
)


const model = mongoose.model('ApplyQuestionSchema' , ApplyQuestionSchema)

module.exports = model