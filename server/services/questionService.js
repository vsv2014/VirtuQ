const Question = require('../models/Question');
const User = require('../models/user');
const Product = require('../models/product');
const { io } = require('../socket');

const questionService = {
  // Create a new question
  createQuestion: async (userId, productId, questionData) => {
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const question = await Question.create({
      user: userId,
      product: productId,
      ...questionData
    });

    // Notify product owner or admin about new question
    io.to(`product-${productId}`).emit('new-question', {
      questionId: question._id,
      productId,
      title: question.title
    });

    return question;
  },

  // Get questions for a product
  getProductQuestions: async (productId, options = {}) => {
    const {
      page = 1,
      limit = 10,
      sort = '-upvotes.count',
      category,
      status,
      answered,
      expertAnswered
    } = options;

    const query = { product: productId };
    if (category) query.category = category;
    if (status) query.status = status;
    if (answered !== undefined) query.isAnswered = answered;
    if (expertAnswered !== undefined) query.hasExpertAnswer = expertAnswered;

    const questions = await Question.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar isExpert')
      .populate('answers.user', 'name avatar isExpert');

    const total = await Question.countDocuments(query);

    return {
      questions,
      total,
      pages: Math.ceil(total / limit)
    };
  },

  // Add an answer to a question
  addAnswer: async (questionId, userId, answerData) => {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const user = await User.findById(userId);
    const answer = {
      user: userId,
      content: answerData.content,
      isExpertAnswer: user.isExpert || false,
      images: answerData.images || []
    };

    question.answers.push(answer);
    await question.save();

    // Notify question asker about new answer
    io.to(`user-${question.user}`).emit('new-answer', {
      questionId,
      answerId: answer._id,
      isExpertAnswer: answer.isExpertAnswer
    });

    return question;
  },

  // Update a question
  updateQuestion: async (questionId, userId, updates) => {
    const question = await Question.findOne({
      _id: questionId,
      user: userId
    });

    if (!question) {
      throw new Error('Question not found or unauthorized');
    }

    Object.assign(question, updates);
    await question.save();

    return question;
  },

  // Delete a question
  deleteQuestion: async (questionId, userId) => {
    const question = await Question.findOne({
      _id: questionId,
      user: userId
    });

    if (!question) {
      throw new Error('Question not found or unauthorized');
    }

    await question.remove();
    return { message: 'Question deleted successfully' };
  },

  // Upvote a question
  upvoteQuestion: async (questionId, userId) => {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const hasUpvoted = question.upvotes.users.includes(userId);
    if (hasUpvoted) {
      question.upvotes.users.pull(userId);
      question.upvotes.count--;
    } else {
      question.upvotes.users.push(userId);
      question.upvotes.count++;
    }

    await question.save();
    return question;
  },

  // Mark answer as helpful
  markAnswerHelpful: async (questionId, answerId, userId) => {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      throw new Error('Answer not found');
    }

    const hasMarked = answer.helpful.users.includes(userId);
    if (hasMarked) {
      answer.helpful.users.pull(userId);
      answer.helpful.count--;
    } else {
      answer.helpful.users.push(userId);
      answer.helpful.count++;
    }

    await question.save();
    return question;
  },

  // Get expert answers
  getExpertAnswers: async (productId) => {
    const questions = await Question.find({
      product: productId,
      hasExpertAnswer: true
    })
    .populate('user', 'name avatar isExpert')
    .populate('answers.user', 'name avatar isExpert');

    return questions;
  },

  // Search questions
  searchQuestions: async (query, options = {}) => {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = options;

    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    const questions = await Question.find(searchQuery)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar isExpert')
      .populate('answers.user', 'name avatar isExpert');

    const total = await Question.countDocuments(searchQuery);

    return {
      questions,
      total,
      pages: Math.ceil(total / limit)
    };
  }
};

module.exports = questionService;
