const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let applications = [];

// Check backend
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running"
  });
});

// Get applications
app.get("/api/applications", (req, res) => {
  res.json(applications);
});

// Add application
app.post("/api/applications", (req, res) => {
  const {
    company,
    role,
    status,
    notes
  } = req.body;

  const newApplication = {
    _id: Date.now().toString(),
    company,
    role,
    status: status || "Applied",
    notes: notes || ""
  };

  applications.unshift(newApplication);

  res.status(201).json(newApplication);
});

// Delete application
app.delete(
  "/api/applications/:id",
  (req, res) => {
    applications =
      applications.filter(
        (application) =>
          application._id !==
          req.params.id
      );

    res.json({
      message:
        "Application deleted"
    });
  }
);

// AI FEEDBACK
app.post(
  "/api/ai-feedback",
  (req, res) => {
    const {
      role,
      question,
      answer
    } = req.body;

    if (
      !role ||
      !question ||
      !answer
    ) {
      return res
        .status(400)
        .json({
          message:
            "Fill all fields"
        });
    }

    const wordCount =
      answer
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    let score = 60;

    if (
      wordCount >= 30
    ) {
      score += 10;
    }

    if (
      wordCount >= 60
    ) {
      score += 10;
    }

    if (
      answer
        .toLowerCase()
        .includes("project")
    ) {
      score += 5;
    }

    if (
      answer
        .toLowerCase()
        .includes("team")
    ) {
      score += 5;
    }

    res.json({
      score: Math.min(
        score,
        100
      ),

      strengths: [
        "Your answer is relevant to the question.",
        "You explained your skills and background.",
        "Your response is connected to the target role."
      ],

      improvements: [
        "Use the STAR method.",
        "Add a specific project example.",
        "Include measurable results."
      ],

      suggestion:
        "Start with a short introduction, explain one relevant experience, describe your contribution, and finish with the result."
    });
  }
);

app.listen(
  PORT,
  () => {
    console.log(
      `Backend running at http://localhost:${PORT}`
    );
  }
);