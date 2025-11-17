const express = require('express')
const router = express.Router()
const prisma = require('../db/prisma')
const crypto = require('crypto')

router.post('/', async (req, res) => {
  try {
    const { email, tenantId, ttlHours = 48 } = req.body || {}
    if (!email || !tenantId) return res.status(400).json({ success: false, error: 'Missing email or tenantId' })
    const token = crypto.randomBytes(24).toString('hex')
    const expires = new Date(Date.now() + ttlHours * 3600000)
    const invite = await prisma.invitations.create({ data: { id: crypto.randomUUID(), email: email.toLowerCase(), tenant_id: tenantId, token, expires_at: expires } })
    res.status(201).json({ success: true, data: { token: invite.token, expires_at: invite.expires_at } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create invitation' })
  }
})

router.get('/', async (req, res) => {
  try {
    const { status, email, tenantId, limit = 50, offset = 0 } = req.query || {}
    const where = {}
    if (status) where.status = status
    if (email) where.email = email.toLowerCase()
    if (tenantId) where.tenant_id = tenantId
    const items = await prisma.invitations.findMany({ where, orderBy: { created_at: 'desc' }, take: parseInt(limit, 10), skip: parseInt(offset, 10) })
    const total = await prisma.invitations.count({ where })
    res.json({ success: true, data: items, pagination: { total, limit: parseInt(limit, 10), offset: parseInt(offset, 10) } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'List failed' })
  }
})

router.patch('/:token/revoke', async (req, res) => {
  try {
    const { token } = req.params
    await prisma.invitations.update({ where: { token }, data: { status: 'revoked' } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Revoke failed' })
  }
})

router.get('/validate', async (req, res) => {
  try {
    const { token } = req.query || {}
    if (!token) return res.status(400).json({ success: false, error: 'Missing token' })
    const invite = await prisma.invitations.findUnique({ where: { token } })
    if (!invite) return res.status(404).json({ success: false, error: 'Invalid token' })
    if (invite.status !== 'pending') return res.status(400).json({ success: false, error: 'Invite used or revoked' })
    if (new Date(invite.expires_at).getTime() < Date.now()) return res.status(400).json({ success: false, error: 'Invite expired' })
    res.json({ success: true, data: { email: invite.email, tenantId: invite.tenant_id, expires_at: invite.expires_at } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Validation failed' })
  }
})

router.post('/consume', async (req, res) => {
  try {
    const { token } = req.body || {}
    if (!token) return res.status(400).json({ success: false, error: 'Missing token' })
    const invite = await prisma.invitations.findUnique({ where: { token } })
    if (!invite) return res.status(404).json({ success: false, error: 'Invalid token' })
    if (invite.status !== 'pending') return res.status(400).json({ success: false, error: 'Invite used or revoked' })
    if (new Date(invite.expires_at).getTime() < Date.now()) return res.status(400).json({ success: false, error: 'Invite expired' })
    await prisma.invitations.update({ where: { token }, data: { status: 'used', used_at: new Date() } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Consume failed' })
  }
})

module.exports = router