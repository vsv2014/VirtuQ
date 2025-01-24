const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isExpertAnswer: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  }]
}, {
  timestamps: true
});

const QuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['sizing', 'material', 'shipping', 'care', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'resolved'],
    default: 'pending'
  },
  upvotes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  answers: [AnswerSchema],
  tags: [{
    type: String,
    trim: true
  }],
  isAnswered: {
    type: Boolean,
    default: false
  },
  hasExpertAnswer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
QuestionSchema.index({ product: 1, createdAt: -1 });
QuestionSchema.index({ product: 1, category: 1 });
QuestionSchema.index({ status: 1 });
QuestionSchema.index({ 'upvotes.count': -1 });

// Update question status when answers are added
QuestionSchema.pre('save', function(next) {
  if (this.isModified('answers')) {
    this.isAnswered = this.answers.length > 0;
    this.hasExpertAnswer = this.answers.some(answer => answer.isExpertAnswer);
    this.status = this.hasExpertAnswer ? 'resolved' : (this.isAnswered ? 'answered' : 'pending');
  }
  next();
});

module.exports = mongoose.model('Question', QuestionSchema);
