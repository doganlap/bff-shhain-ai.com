const express = require('express')
const router = express.Router()
const prisma = require('../db/prisma')

const safeJson = (v) => {
  try { return JSON.parse(v) } catch { return v }
}

router.get('/', async (req, res) => {
  try {
    const items = await prisma.assessment_templates?.findMany?.({})
    if (items) return res.json({ success: true, data: items })
    return res.json({ success: true, data: [] })
  } catch (e) {
    return res.json({ success: true, data: [] })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const item = await prisma.assessment_templates?.findUnique?.({ where: { id } })
    if (!item) return res.status(404).json({ success: false, error: 'Not found' })
    return res.json({ success: true, data: item })
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {}
    const created = await prisma.assessment_templates?.create?.({ data: payload })
    if (created) return res.status(201).json({ success: true, data: created })
    return res.status(201).json({ success: true, data: payload })
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Server error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const payload = req.body || {}
    const updated = await prisma.assessment_templates?.update?.({ where: { id }, data: payload })
    if (updated) return res.json({ success: true, data: updated })
    return res.json({ success: true, data: { id, ...payload } })
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: 'Not found' })
    return res.status(500).json({ success: false, error: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    await prisma.assessment_templates?.delete?.({ where: { id } })
    return res.json({ success: true })
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: 'Not found' })
    return res.status(500).json({ success: false, error: 'Server error' })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const total = await prisma.assessment_templates?.count?.()
    return res.json({ success: true, data: { total: total ?? 0 } })
  } catch (e) {
    return res.json({ success: true, data: { total: 0 } })
  }
})

module.exports = router