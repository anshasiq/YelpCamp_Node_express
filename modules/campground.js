const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const CampgroundSchema = new Schema({
    title: String,
    image: {
        type: String,
        default: 'https://www.dynatrap.com/media/wysiwyg/Articles/DynaTrap/DT_setting-up-your-campsite-to-avoid-mosquitoes.jpg'
    },
    // images: [ImageSchema],
    // geometry: {
    //     type: {
    //         type: String,
    //         enum: ['Point'],
    //         required: true
    //     },
    //     coordinates: {
    //         type: [Number],
    //         required: true
    //     }
    // },
    price: Number,
    description: String,
    location: String,
    // author: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    // reviews: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Review'
    //     }
    // ]
});

module.exports= mongoose.model('Campground',CampgroundSchema);