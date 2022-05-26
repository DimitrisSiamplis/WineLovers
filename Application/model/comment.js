const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    
    WineId: { type: String , required: true } ,
    UserId: {type: String , required: true  } , 
    Comment: { type: String , required: true },
    Rating: { type: Number , required: true },
    CommentDate: { type: Date , required: true },

}, 
    {collection: 'comments'}
)


const model = mongoose.model('CommentSchema' , CommentSchema)

module.exports = model