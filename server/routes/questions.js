const express = require('express');
const { auth } = require('../middleware/auth');
const questionService = require('../services/questionService');

const router = express.Router();

// Get questions for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page,
      limit,
      sort,
      category,
      status,
      answered,
      expertAnswered
    } = req.query;

    const questions = await questionService.getProductQuestions(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      category,
      status,
      answered: answered === 'true',
      expertAnswered: expertAnswered === 'true'
    });

    res.json(questions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new question
router.post('/product/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, content, category, tags } = req.body;

    const question = await questionService.createQuestion(req.user.id, productId, {
      title,
      content,
      category,
      tags
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add an answer to a question
router.post('/:questionId/answer', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content, images } = req.body;

    const question = await questionService.addAnswer(questionId, req.user.id, {
      content,
      images
    });

    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a question
router.put('/:questionId', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { title, content, category, tags } = req.body;

    const question = await questionService.updateQuestion(questionId, req.user.id, {
      title,
      content,
      category,
      tags
    });

    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a question
router.delete('/:questionId', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const result = await questionService.deleteQuestion(questionId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upvote a question
router.post('/:questionId/upvote', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await questionService.upvoteQuestion(questionId, req.user.id);
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark answer as helpful
router.post('/:questionId/answer/:answerId/helpful', auth, async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const question = await questionService.markAnswerHelpful(questionId, answerId, req.user.id);
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get expert answers for a product
router.get('/product/:productId/expert-answers', async (req, res) => {
  try {
    const { productId } = req.params;
    const questions = await questionService.getExpertAnswers(productId);
    res.json(questions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Search questions
router.get('/search', async (req, res) => {
  try {
    const { q, page, limit, sort } = req.query;
    const results = await questionService.searchQuestions(q, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });
    res.json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
