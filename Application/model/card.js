const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    
    WineId: { type: String , required: true } ,
    UserId: {type: String , required: true  } , 
    CardDate: { type: Date , required: true },
    IsCompleted: { type: Boolean , required: true },
    Amount: { type: Number , required: true },

}, 
    {collection: 'card'}
)


const model = mongoose.model('CardSchema' , CardSchema)

module.exports = model