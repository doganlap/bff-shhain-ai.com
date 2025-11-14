const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/assessments - Get all assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: { framework: true, organization: true },
    });
    res.json(assessments);
  } catch (error) {
    handleError(res, error, 'Error fetching assessments');
  }
});

// GET /api/assessments/:id - Get a single assessment by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(id, 10) },
      include: { questions: true, responses: true },
    });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    handleError(res, error, 'Error fetching assessment by ID');
  }
});

// POST /api/assessments - Create a new assessment
router.post('/', async (req, res) => {
  try {
    const newAssessment = await prisma.assessment.create({
      data: req.body,
    });
    res.status(201).json(newAssessment);
  } catch (error) {
    handleError(res, error, 'Error creating assessment');
  }
});

// PUT /api/assessments/:id - Update an existing assessment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedAssessment = await prisma.assessment.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedAssessment);
  } catch (error) {
    handleError(res, error, 'Error updating assessment');
  }
});

// DELETE /api/assessments/:id - Delete an assessment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.assessment.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Error deleting assessment');
  }
});

// GET /api/assessments/:id/questions - Get questions for an assessment
router.get('/:id/questions', async (req, res) => {
  const { id } = req.params;
  try {
    const questions = await prisma.assessmentQuestion.findMany({
      where: { assessmentId: parseInt(id, 10) },
    });
    res.json(questions);
  } catch (error) {
    handleError(res, error, 'Error fetching assessment questions');
  }
});

// POST /api/assessments/:id/responses/:qid - Submit a response to a question
router.post('/:id/responses/:qid', async (req, res) => {
  const { id, qid } = req.params;
  try {
    const response = await prisma.assessmentResponse.create({
      data: {
        assessmentId: parseInt(id, 10),
        questionId: parseInt(qid, 10),
        ...req.body,
      },
    });
    res.status(201).json(response);
  } catch (error) {
    handleError(res, error, 'Error submitting assessment response');
  }
});

// GET /api/assessments/:id/progress - Get the progress of an assessment
router.get('/:id/progress', async (req, res) => {
  const { id } = req.params;
  try {
    const totalQuestions = await prisma.assessmentQuestion.count({
      where: { assessmentId: parseInt(id, 10) },
    });
    const answeredQuestions = await prisma.assessmentResponse.count({
      where: { assessmentId: parseInt(id, 10) },
    });
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    res.json({ progress: Math.round(progress), total: totalQuestions, answered: answeredQuestions });
  } catch (error) {
    handleError(res, error, 'Error fetching assessment progress');
  }
});

// POST /api/assessments/:id/questions/generate - Placeholder for question generation
router.post('/:id/questions/generate', (req, res) => {
    // This would typically involve a more complex logic, possibly calling an AI service.
    res.status(501).json({ message: 'Question generation not implemented yet.' });
});

module.exports = router;
