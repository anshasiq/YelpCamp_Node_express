const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const CampgroundSchema = new Schema({
    title: String,
    image: {
        type: String,
        default: 'https://www.dynatrap.com/media/wysiwyg/Articles/DynaTrap/DT_setting-up-your-campsite-to-avoid-mosquitoes.jpg'
    },  
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the current date when a new document is created
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});
CampgroundSchema.post('findOneAndDelete',async function name(params) {
    console.log("deleted",params.reviews.ObjectId);
}) 



module.exports= mongoose.model('Campground',CampgroundSchema);