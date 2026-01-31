import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./db.js";

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/classrooms", async (req, res) => {
  const { name, term } = req.body ?? {};
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const classroom = await prisma.classroom.create({
    data: { name, term },
  });
  res.status(201).json(classroom);
});

app.post("/api/students", async (req, res) => {
  const { name, email, classroomId } = req.body ?? {};
  if (!name || !classroomId) {
    return res
      .status(400)
      .json({ error: "name and classroomId are required" });
  }

  const student = await prisma.student.create({
    data: { name, email, classroomId },
  });
  res.status(201).json(student);
});

app.post("/api/essays", async (req, res) => {
  const { studentId, classroomId, title, content, analysis, errors } = req.body ?? {};
  if (!studentId || !classroomId || !content) {
    return res.status(400).json({
      error: "studentId, classroomId, and content are required",
    });
  }

  const created = await prisma.$transaction(async (tx) => {
    const essay = await tx.essay.create({
      data: {
        studentId,
        classroomId,
        title,
        content,
        analysis: analysis
          ? {
              create: {
                grammarScore: analysis.grammarScore ?? 0,
                vocabScore: analysis.vocabScore ?? 0,
                toeicScore: analysis.toeicScore ?? 0,
                summary: analysis.summary ?? null,
              },
            }
          : undefined,
      },
    });

    if (Array.isArray(errors) && errors.length > 0) {
      for (const item of errors) {
        const code = item?.categoryCode;
        const name = item?.categoryName ?? item?.categoryCode;
        const count = Number.isFinite(item?.count) ? item.count : 1;

        if (!code) {
          continue;
        }

        const category = await tx.errorCategory.upsert({
          where: { code },
          create: { code, name },
          update: { name },
        });

        await tx.essayError.upsert({
          where: {
            essayId_categoryId: {
              essayId: essay.id,
              categoryId: category.id,
            },
          },
          create: {
            essayId: essay.id,
            categoryId: category.id,
            count,
          },
          update: {
            count,
          },
        });
      }
    }

    return essay;
  });

  res.status(201).json(created);
});

app.get("/api/classes/:classId/dashboard", async (req, res) => {
  const { classId } = req.params;
  const start = req.query.start ? new Date(String(req.query.start)) : null;
  const end = req.query.end ? new Date(String(req.query.end)) : null;

  const dateFilter =
    start || end
      ? {
          submittedAt: {
            ...(start ? { gte: start } : {}),
            ...(end ? { lte: end } : {}),
          },
        }
      : undefined;

  const [errors, analyses] = await Promise.all([
    prisma.essayError.findMany({
      where: {
        essay: {
          classroomId: classId,
          ...(dateFilter ? dateFilter : {}),
        },
      },
      include: { category: true },
    }),
    prisma.essayAnalysis.findMany({
      where: {
        essay: {
          classroomId: classId,
          ...(dateFilter ? dateFilter : {}),
        },
      },
      select: {
        grammarScore: true,
        vocabScore: true,
        toeicScore: true,
      },
    }),
  ]);

  const errorStats = errors.reduce((acc, item) => {
    const key = item.category.code;
    if (!acc[key]) {
      acc[key] = {
        code: item.category.code,
        name: item.category.name,
        totalCount: 0,
      };
    }
    acc[key].totalCount += item.count;
    return acc;
  }, {});

  const count = analyses.length || 1;
  const totals = analyses.reduce(
    (acc, item) => {
      acc.grammar += item.grammarScore;
      acc.vocab += item.vocabScore;
      acc.toeic += item.toeicScore;
      return acc;
    },
    { grammar: 0, vocab: 0, toeic: 0 }
  );

  res.json({
    classId,
    errorStats: Object.values(errorStats).sort(
      (a, b) => b.totalCount - a.totalCount
    ),
    avgScores: {
      grammar: Math.round(totals.grammar / count),
      vocab: Math.round(totals.vocab / count),
      toeic: Math.round(totals.toeic / count),
    },
    essayCount: analyses.length,
  });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
