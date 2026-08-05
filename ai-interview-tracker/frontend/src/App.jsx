import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("Dashboard");

  const [applications, setApplications] = useState([]);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [notes, setNotes] = useState("");

  const [targetRole, setTargetRole] = useState("");
  const [interviewQuestion, setInterviewQuestion] = useState("");
  const [candidateAnswer, setCandidateAnswer] = useState("");

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  async function readResponse(response) {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Backend returned an invalid response. Make sure the backend is running on port 5000."
      );
    }
  }

  async function loadApplications() {
    try {
      const response = await fetch(
        `${API_URL}/api/applications`
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load applications"
        );
      }

      setApplications(data);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function addApplication(event) {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            company,
            role,
            status,
            notes,
          }),
        }
      );

      const data =
        await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add application"
        );
      }

      setApplications([
        data,
        ...applications,
      ]);

      setCompany("");
      setRole("");
      setStatus("Applied");
      setNotes("");

      setMessage(
        "Application added successfully!"
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to add application"
      );
    }
  }

  async function deleteApplication(id) {
    try {
      const response = await fetch(
        `${API_URL}/api/applications/${id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete application"
        );
      }

      setApplications(
        applications.filter(
          (application) =>
            application._id !== id
        )
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function analyzeAnswer(event) {
    event.preventDefault();

    setFeedback(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai-feedback`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            role: targetRole,
            question:
              interviewQuestion,
            answer:
              candidateAnswer,
          }),
        }
      );

      const data =
        await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to generate feedback"
        );
      }

      setFeedback(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const statistics = useMemo(() => {
    return {
      total:
        applications.length,

      applied:
        applications.filter(
          (item) =>
            item.status ===
            "Applied"
        ).length,

      interview:
        applications.filter(
          (item) =>
            item.status ===
            "Interview"
        ).length,

      offer:
        applications.filter(
          (item) =>
            item.status ===
            "Offer"
        ).length,
    };
  }, [applications]);

  function getStatusClass(status) {
    return status
      .toLowerCase()
      .replaceAll(" ", "-");
  }

  function ApplicationRow({
    application,
    onDelete,
  }) {
    return (
      <div className="application-row">
        <div className="company-icon">
          {application.company
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <div className="application-info">
          <strong>
            {application.company}
          </strong>

          <p>
            {application.role}
          </p>
        </div>

        <span
          className={
            `badge ${getStatusClass(
              application.status
            )}`
          }
        >
          {application.status}
        </span>

        <button
          className="delete-button"
          onClick={() =>
            onDelete(
              application._id
            )
          }
        >
          Delete
        </button>
      </div>
    );
  }

  function Dashboard() {
    return (
      <>
        <section className="welcome">
          <div>
            <span>
              INTERVIEW PREPARATION
            </span>

            <h2>
              Track smarter.
              <br />
              Interview better.
            </h2>

            <p>
              Organize applications
              and improve your
              interview performance.
            </p>

            <button
              onClick={() =>
                setPage(
                  "Add Application"
                )
              }
            >
              + Add Application
            </button>
          </div>

          <div className="welcome-icon">
            ✦
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon">
              📋
            </div>

            <div>
              <p>
                TOTAL
              </p>

              <strong>
                {statistics.total}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              📤
            </div>

            <div>
              <p>
                APPLIED
              </p>

              <strong>
                {statistics.applied}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              💬
            </div>

            <div>
              <p>
                INTERVIEWS
              </p>

              <strong>
                {statistics.interview}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🏆
            </div>

            <div>
              <p>
                OFFERS
              </p>

              <strong>
                {statistics.offer}
              </strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>
              Recent Applications
            </h3>

            <button
              className="primary-button"
              onClick={() =>
                setPage(
                  "Applications"
                )
              }
            >
              View All
            </button>
          </div>

          {applications.length === 0 ? (
            <p>
              No applications yet.
              Add your first
              application.
            </p>
          ) : (
            applications
              .slice(0, 5)
              .map(
                (application) => (
                  <ApplicationRow
                    key={
                      application._id
                    }
                    application={
                      application
                    }
                    onDelete={
                      deleteApplication
                    }
                  />
                )
              )
          )}
        </section>
      </>
    );
  }

  function AddApplication() {
    return (
      <section className="panel">
        <p className="eyebrow">
          APPLICATION TRACKER
        </p>

        <h3>
          Add New Application
        </h3>

        <form
          onSubmit={
            addApplication
          }
        >
          <label>
            Company Name

            <input
              value={company}
              onChange={(event) =>
                setCompany(
                  event.target.value
                )
              }
              placeholder="Google"
              required
            />
          </label>

          <label>
            Job Role

            <input
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
              placeholder="Software Engineer"
              required
            />
          </label>

          <label>
            Application Status

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
            >
              <option>
                Applied
              </option>

              <option>
                Interview
              </option>

              <option>
                Offer
              </option>

              <option>
                Rejected
              </option>
            </select>
          </label>

          <label>
            Notes

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Add notes..."
            />
          </label>

          <button
            className="primary-button"
            type="submit"
          >
            Add Application
          </button>

          {message && (
            <p>
              {message}
            </p>
          )}
        </form>
      </section>
    );
  }

  function Applications() {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              JOB TRACKER
            </p>

            <h3>
              All Applications
            </h3>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setPage(
                "Add Application"
              )
            }
          >
            + Add
          </button>
        </div>

        {applications.length === 0 ? (
          <p>
            No applications found.
          </p>
        ) : (
          applications.map(
            (application) => (
              <ApplicationRow
                key={
                  application._id
                }
                application={
                  application
                }
                onDelete={
                  deleteApplication
                }
              />
            )
          )
        )}
      </section>
    );
  }

  function AICoach() {
    return (
      <section className="two-columns">
        <div className="panel">
          <p className="eyebrow">
            AI INTERVIEW COACH
          </p>

          <h3>
            Analyze Your Answer
          </h3>

          <p>
            Enter an interview
            question and your
            answer to receive
            feedback.
          </p>

          <form
            onSubmit={
              analyzeAnswer
            }
          >
            <label>
              Target Role

              <input
                value={
                  targetRole
                }
                onChange={(
                  event
                ) =>
                  setTargetRole(
                    event.target
                      .value
                  )
                }
                placeholder="Software Engineer"
                required
              />
            </label>

            <label>
              Interview Question

              <textarea
                value={
                  interviewQuestion
                }
                onChange={(
                  event
                ) =>
                  setInterviewQuestion(
                    event.target
                      .value
                  )
                }
                placeholder="Tell me about yourself."
                required
              />
            </label>

            <label>
              Your Answer

              <textarea
                value={
                  candidateAnswer
                }
                onChange={(
                  event
                ) =>
                  setCandidateAnswer(
                    event.target
                      .value
                  )
                }
                placeholder="Write your answer here..."
                required
              />
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={
                loading
              }
            >
              {loading
                ? "Analyzing..."
                : "Analyze My Answer"}
            </button>
          </form>
        </div>

        <div className="panel">
          <p className="eyebrow">
            FEEDBACK REPORT
          </p>

          {!feedback ? (
            <p>
              Your score,
              strengths, and
              suggestions will
              appear here.
            </p>
          ) : (
            <>
              <h2>
                Score: {
                  feedback.score
                }/100
              </h2>

              <h3>
                Strengths
              </h3>

              <ul>
                {feedback.strengths?.map(
                  (
                    item,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>

              <h3>
                Areas to Improve
              </h3>

              <ul>
                {feedback.improvements?.map(
                  (
                    item,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>

              <h3>
                Coach Suggestion
              </h3>

              <p>
                {
                  feedback.suggestion
                }
              </p>
            </>
          )}
        </div>
      </section>
    );
  }

  function renderPage() {
    if (
      page ===
      "Add Application"
    ) {
      return (
        <AddApplication />
      );
    }

    if (
      page ===
      "Applications"
    ) {
      return (
        <Applications />
      );
    }

    if (
      page ===
      "AI Interview Coach"
    ) {
      return (
        <AICoach />
      );
    }

    return (
      <Dashboard />
    );
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">
            AI
          </div>

          <div>
            <h1>
              InterviewAI
            </h1>

            <p>
              SMART CAREER TRACKER
            </p>
          </div>
        </div>

        <nav className="menu">
          {[
            "Dashboard",
            "Applications",
            "Add Application",
            "AI Interview Coach",
          ].map(
            (item) => (
              <button
                key={item}
                className={
                  page === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage(
                    item
                  )
                }
              >
                {item}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <p>
            BUILD. PRACTICE.
            IMPROVE.
          </p>

          <strong>
            InterviewAI
          </strong>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              CAREER DASHBOARD
            </p>

            <h2>
              {page}
            </h2>
          </div>

          <div className="profile">
            <div>
              <strong>
                Interview Tracker
              </strong>

              <p>
                Career Dashboard
              </p>
            </div>

            <div className="avatar">
              AI
            </div>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

export default App;