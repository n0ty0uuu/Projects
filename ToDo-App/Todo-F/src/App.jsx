import { useState, useCallback, useEffect } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item ${task.completed ? "completed" : ""}`}>
      <button
        id={`check-${task.id}`}
        className="task-checkbox"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? "Mark as active" : "Mark as done"}
        title={task.completed ? "Mark as active" : "Mark as done"}
      >
        <span className="check-icon">✓</span>
      </button>

      <span className="task-text">{task.text}</span>

      <span className="task-time">{formatTime(new Date(task.createdAt))}</span>

      <button
        id={`delete-${task.id}`}
        className="delete-btn"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
        title="Delete task"
      >
        ✕
      </button>
    </li>
  );
}

function StatsBar({ total, active, done }) {
  return (
    <div className="stats-bar" role="status" aria-live="polite">
      <div className="stat-chip total">
        <span className="stat-dot" />
        <span className="stat-count">{total}</span>
        Total
      </div>

      <div className="stat-chip active">
        <span className="stat-dot" />
        <span className="stat-count">{active}</span>
        Pending
      </div>

      <div className="stat-chip done">
        <span className="stat-dot" />
        <span className="stat-count">{done}</span>
        Done
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");

  // ── Get tasks from backend ───────────────────────────────────────────────

  useEffect(() => {
    fetch("http://localhost:8080/tasks")
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const addTask = useCallback(async () => {
    const text = inputValue.trim();

    if (!text) return;

    const response = await fetch(
      `http://localhost:8080/tasks?text=${encodeURIComponent(text)}`,
      {
        method: "POST",
      },
    );

    const data = await response.json();

    setTasks((prev) => [data, ...prev]);

    setInputValue("");
  }, [inputValue]);

const toggleTask = useCallback(async (id) => {
  const response = await fetch(`http://localhost:8080/tasks/${id}`, {
    method: "PUT",
  });

  const data = await response.json();

  setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
}, []);

  const deleteTask = useCallback(async (id) => {
    await fetch(`http://localhost:8080/tasks/${id}`, {
      method: "DELETE",
    });
    setTasks((prev) => prev.filter((t) => t.id !== id)
  
  );
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const active = total - done;

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const hasDone = done > 0;

  // ── Empty state messages ──────────────────────────────────────────────────

  const emptyMessages = {
    all: {
      icon: "📋",
      text: "No tasks yet!",
      sub: "Add your first task above to get started.",
    },
    active: {
      icon: "🎉",
      text: "All caught up!",
      sub: "You have no pending tasks right now.",
    },
    done: {
      icon: "✨",
      text: "Nothing completed.",
      sub: "Complete a task and it will show up here.",
    },
  };

  const empty = emptyMessages[filter];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="app-bg" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="app-wrapper">
        <main className="app-container">
          <header className="app-header">
            <div className="app-logo" aria-hidden="true">
              ✦
            </div>

            <h1 className="app-title">TaskFlow</h1>

            <p className="app-subtitle">
              Organize your day, one task at a time
            </p>
          </header>

          <StatsBar total={total} active={active} done={done} />

          <div className="add-task-form" role="search">
            <div className="task-input-wrapper">
              <input
                id="new-task-input"
                className="task-input"
                type="text"
                placeholder="What needs to be done? Press Enter to add…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="New task input"
                maxLength={200}
                autoComplete="off"
              />
            </div>

            <button
              id="add-task-btn"
              className="add-btn"
              onClick={addTask}
              disabled={!inputValue.trim()}
              aria-label="Add task"
            >
              <span>＋</span> Add Task
            </button>
          </div>

          <nav className="filter-tabs" aria-label="Task filter">
            {["all", "active", "done"].map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f === "all" ? `All (${total})` : ""}
                {f === "active" ? `Pending (${active})` : ""}
                {f === "done" ? `Done (${done})` : ""}
              </button>
            ))}
          </nav>

          <section aria-label="Task list">
            {visibleTasks.length === 0 ? (
              <div className="task-list-empty">
                <div className="empty-icon">{empty.icon}</div>
                <p className="empty-text">{empty.text}</p>
                <p className="empty-subtext">{empty.sub}</p>
              </div>
            ) : (
              <ul className="task-list">
                {visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </ul>
            )}
          </section>

          {hasDone && (
            <div className="clear-completed">
              <button
                id="clear-completed-btn"
                className="clear-btn"
                onClick={clearCompleted}
                aria-label="Clear all completed tasks"
              >
                🗑 Clear {done} completed task
                {done !== 1 ? "s" : ""}
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
