const mongoose = require('mongoose');

const StaticSchema = new mongoose.Schema({
    
    Sex: { type: String , required: true } ,
    Age: { type: String , required: true } ,
    Location: {type: String , required: true  } , 
    Consumption: { type: String , required: true },
    Price: { type: Number , required: true },
    Kind: { type: String , required: true },
    Color: { type: String , required: true },
    OldWine: { type: String , required: true },
    Country: { type: String , required: true },

    Christmas: { type: String , required: true } ,
    Easter: {type: String , required: true  } , 
    Valentine: { type: String , required: true },
    Summer: { type: String , required: true },
    Winter: { type: String , required: true },

    WhiteMeat: { type: String , required: true },
    RedMeat: { type: String , required: true },
    Fish: { type: String , required: true },
    Vegetables: { type: String , required: true },
    Cheece: { type: String , required: true },
    Pasta: { type: String , required: true },
    Pizza: { type: String , required: true },


}, 
    {collection: 'static'}
)


const model = mongoose.model('StaticSchema' , StaticSchema)

module.exports = model