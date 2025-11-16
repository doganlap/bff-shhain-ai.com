/**
 * AI Health and Status Router
 * Provides health status for AI services without making external calls
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/ai/health
 * AI services health check - non-crashing version
 * Returns configuration status of AI providers without making external calls
 */
router.get('/health', async (req, res) => {
    try {
        // Check environment variables for AI service configuration
        const providers = {
            openai: {
                configured: !!process.env.OPENAI_API_KEY,
                error: process.env.OPENAI_API_KEY ? null : 'MISSING_API_KEY'
            },
            azure: {
                configured: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY),
                error: (() => {
                    if (!process.env.AZURE_OPENAI_ENDPOINT && !process.env.AZURE_OPENAI_KEY) {
                        return 'MISSING_ENDPOINT_AND_KEY';
                    } else if (!process.env.AZURE_OPENAI_ENDPOINT) {
                        return 'MISSING_ENDPOINT';
                    } else if (!process.env.AZURE_OPENAI_KEY) {
                        return 'MISSING_KEY';
                    }
                    return null;
                })()
            },
            huggingface: {
                configured: !!process.env.HUGGINGFACE_API_KEY,
                error: process.env.HUGGINGFACE_API_KEY ? null : 'MISSING_API_KEY'
            },
            azure_vision: {
                configured: !!(process.env.AZURE_VISION_ENDPOINT && process.env.AZURE_VISION_KEY),
                error: (() => {
                    if (!process.env.AZURE_VISION_ENDPOINT && !process.env.AZURE_VISION_KEY) {
                        return 'MISSING_ENDPOINT_AND_KEY';
                    } else if (!process.env.AZURE_VISION_ENDPOINT) {
                        return 'MISSING_ENDPOINT';
                    } else if (!process.env.AZURE_VISION_KEY) {
                        return 'MISSING_KEY';
                    }
                    return null;
                })()
            }
        };

        // Count configured providers
        const configuredCount = Object.values(providers).filter(p => p.configured).length;
        const totalCount = Object.keys(providers).length;

        res.json({
            ok: true,
            providers,
            summary: {
                total: totalCount,
                configured: configuredCount,
                missing: totalCount - configuredCount
            },
            timestamp: new Date().toISOString(),
            note: 'This endpoint checks environment configuration only. No external API calls are made.'
        });
    } catch (error) {
        console.error('AI Health Check Error:', error);
        res.status(200).json({
            ok: false,
            error: 'Failed to check AI service configuration',
            providers: {},
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;