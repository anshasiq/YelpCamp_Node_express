const express = require('express');
const router = express.Router();
const Campground = require('../modules/campground');
const Review = require('../modules/review');
const { isLoggedIn } = require('../middleware');



router.delete('/campgrounds/:id/:reviewid',isLoggedIn,async(req,res)=>{
    const { id, reviewid } = req.params; // Destructure params
    // console.log(req.params);
    const R = await Review.findById(reviewid);
    let y= R.author.toString();
    console.log(y, req.user.id);
  
    if(y==req.user.id){
    await Review.findByIdAndDelete(reviewid);
    await Campground.findByIdAndUpdate(id,{$pull:{ reviews: reviewid}});
    req.flash('success', 'Successfully Removed The Review');}
    else
    req.flash('error', 'You must be the owner');
    res.redirect(`/campgrounds/${id}`);
    
});

router.post('/addreview/:id',isLoggedIn , async (req,res)=>{
console.log(req.params);
    console.log(req.body);
    const cg= await Campground.findById(req.params.id);
    const review= new Review(req.body.review);
    review.author=req.user.id;
    await review.save();
    await cg.reviews.push(review);
    await cg.save();
    res.redirect(`/campgrounds/${req.params.id}`);
});


module.exports = router;
