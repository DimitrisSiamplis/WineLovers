const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    
    WinesList: { type: Array , required: true } ,
    UserId: {type: String , required: true  } , 
    Date: { type: Date , required: true },
    Price: {type: Number , required: true}
}, 
    {collection: 'history'}
)


const model = mongoose.model('HistorySchema' , HistorySchema)

module.exports = model