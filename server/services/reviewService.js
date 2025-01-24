const Review = require('../models/Review');
const Product = require('../models/product');
const Order = require('../models/Order');

const reviewService = {
  // Create a new review
  createReview: async (userId, productId, reviewData) => {
    // Check if user has purchased the product
    const order = await Order.findOne({
      user: userId,
      'items.product': productId,
      status: 'delivered'
    });

    if (!order) {
      throw new Error('You can only review products you have purchased');
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      ...reviewData,
      verified: true // Since we verified the purchase
    });

    // Update product rating
    await updateProductRating(productId);

    return review;
  },

  // Get reviews for a product
  getProductReviews: async (productId, options = {}) => {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      rating,
      verified
    } = options;

    const query = { product: productId };
    if (rating) query.rating = rating;
    if (verified !== undefined) query.verified = verified;

    const reviews = await Review.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar');

    const total = await Review.countDocuments(query);

    return {
      reviews,
      total,
      pages: Math.ceil(total / limit)
    };
  },

  // Update a review
  updateReview: async (reviewId, userId, updates) => {
    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      throw new Error('Review not found or unauthorized');
    }

    Object.assign(review, updates);
    await review.save();

    // Update product rating if rating was changed
    if (updates.rating !== undefined) {
      await updateProductRating(review.product);
    }

    return review;
  },

  // Delete a review
  deleteReview: async (reviewId, userId) => {
    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      throw new Error('Review not found or unauthorized');
    }

    await review.remove();
    await updateProductRating(review.product);

    return { message: 'Review deleted successfully' };
  },

  // Mark review as helpful
  markReviewHelpful: async (reviewId, userId) => {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    const hasMarked = review.helpful.users.includes(userId);
    if (hasMarked) {
      review.helpful.users.pull(userId);
      review.helpful.count--;
    } else {
      review.helpful.users.push(userId);
      review.helpful.count++;
    }

    await review.save();
    return review;
  },

  // Add reply to review
  addReply: async (reviewId, userId, comment) => {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.replies.push({
      user: userId,
      comment
    });

    await review.save();
    return review;
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    rating: averageRating,
    numReviews: reviews.length
  });
}

module.exports = reviewService;
