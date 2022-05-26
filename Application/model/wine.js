const mongoose = require('mongoose');

const WineSchema = new mongoose.Schema({
    
    WineName: { type: String , required: true } ,
    Type: {type: String , required: true  } , 
    Color: { type: String , required: true },
    Winery: { type: String , required: true },
    Country: { type: String , required: true },
    Location: { type: String , required: true },
    Price: { type: Number , required: true },
    Year: { type: Number , required: true },
    ImageUrl: { type: String , required: true },
    WineDescription: { type: String , required: true },
    Grapes :  { type: String , required: true }

}, 
    {collection: 'wine'}
)


const model = mongoose.model('WineSchema' , WineSchema)

module.exports = model