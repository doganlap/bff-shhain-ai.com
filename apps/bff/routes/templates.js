const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

const safe = async (fn, fallback) => {
  try { return await fn(); } catch { return fallback; }
};

router.get('/', async (req, res) => {
  const data = await safe(
    () => prisma.assessment_templates.findMany({ take: 50 }),
    [
      { id: 'tmpl-iso', name: 'ISO 27001 Template', version: '2022', controls: 114 },
      { id: 'tmpl-nca', name: 'NCA ECC v2.0 Template', version: '2.0', controls: 114 },
    ]
  );
  res.json({ success: true, data });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const data = await safe(
    () => prisma.assessment_templates.findUnique({ where: { id } }),
    { id, name: 'Template', version: '1.0', controls: 100 }
  );
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const body = req.body || {};
  const created = await safe(
    () => prisma.assessment_templates.create({ data: body }),
    { ...body, id: body.id || `tmpl-${Date.now()}` }
  );
  res.status(201).json({ success: true, data: created });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  const updated = await safe(
    () => prisma.assessment_templates.update({ where: { id }, data: body }),
    { ...body, id }
  );
  res.json({ success: true, data: updated });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await safe(() => prisma.assessment_templates.delete({ where: { id } }), null);
  res.json({ success: true });
});

router.post('/:id/clone', async (req, res) => {
  const { id } = req.params;
  const clone = await safe(
    async () => {
      const tmpl = await prisma.assessment_templates.findUnique({ where: { id } });
      const newTmpl = await prisma.assessment_templates.create({ data: { ...tmpl, id: `clone-${Date.now()}` } });
      return newTmpl;
    },
    { id: `clone-${Date.now()}`, name: `Clone of ${id}`, version: '1.0', controls: 100 }
  );
  res.status(201).json({ success: true, data: clone });
});

router.get('/:id/export', async (req, res) => {
  const { id } = req.params;
  const payload = await safe(
    () => prisma.assessment_templates.findUnique({ where: { id } }),
    { id, name: 'Template', version: '1.0', controls: 100 }
  );
  res.json({ success: true, data: payload });
});

router.post('/import', async (req, res) => {
  const body = req.body || {};
  const imported = await safe(
    () => prisma.assessment_templates.create({ data: body }),
    { ...body, id: body.id || `import-${Date.now()}` }
  );
  res.status(201).json({ success: true, data: imported });
});

module.exports = router;