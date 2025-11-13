/**
 * Documents Routes - Basic implementation
 */

const express = require('express');
const router = express.Router();

// Get documents
router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            documents: [],
            total: 0,
            metadata: {
                retrievedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add document
router.post('/', async (req, res) => {
    try {
        const { title, content, type } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }

        // Mock document creation
        res.json({
            success: true,
            document: {
                id: Date.now().toString(),
                title,
                content,
                type: type || 'text',
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
