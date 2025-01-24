const express = require('express');
const { auth } = require('../middleware/auth');
const reviewService = require('../services/reviewService');

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page, limit, sort, rating, verified } = req.query;
    
    const reviews = await reviewService.getProductReviews(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      rating: rating ? parseInt(rating) : undefined,
      verified: verified === 'true'
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new review
router.post('/product/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;
    
    const review = await reviewService.createReview(req.user.id, productId, {
      rating,
      title,
      comment,
      images
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;
    
    const review = await reviewService.updateReview(reviewId, req.user.id, {
      rating,
      title,
      comment,
      images
    });
    
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewService.deleteReview(reviewId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewService.markReviewHelpful(reviewId, req.user.id);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add reply to review
router.post('/:reviewId/reply', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const review = await reviewService.addReply(reviewId, req.user.id, comment);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
