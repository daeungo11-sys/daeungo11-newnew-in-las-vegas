import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './db.js';

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/students', async (req, res) => {
  const { name, email } = req.body ?? {};
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const student = await prisma.student.create({
    data: { name, email },
  });
  res.status(201).json(student);
});

app.get('/api/students/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) {
    return res.status(404).json({ error: 'student not found' });
  }
  res.json(student);
});

app.post('/api/students/:studentId/history', async (req, res) => {
  const { studentId } = req.params;
  const { activityType, inputText, outputText } = req.body ?? {};

  if (!activityType || !inputText || !outputText) {
    return res.status(400).json({
      error: 'activityType, inputText, outputText are required',
    });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) {
    return res.status(404).json({ error: 'student not found' });
  }

  const activity = await prisma.studentActivity.create({
    data: {
      studentId,
      activityType,
      inputText,
      outputText,
    },
  });

  res.status(201).json(activity);
});

app.get('/api/students/:studentId/history', async (req, res) => {
  const { studentId } = req.params;
  const limit = Number.parseInt(String(req.query.limit || '20'), 10);

  const history = await prisma.studentActivity.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    take: Number.isNaN(limit) ? 20 : Math.min(limit, 50),
  });

  res.json(history);
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
