
import { useState } from "react";
import {
  Target,
  Plus,
  Trash2,
  Check,
  CalendarDays,
  ListTodo,
  X,
} from "lucide-react";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";


function GoalsPage({ goals = [], setGoals, isPersian = true }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("personal");
  const [newTasks, setNewTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");

  const text = (fa, en) => (isPersian ? fa : en);

  function addTaskToForm() {
    const value = taskInput.trim();
    if (!value) return;

    setNewTasks([
      ...newTasks,
      { id: crypto.randomUUID(), title: value, completed: false },
    ]);
    setTaskInput("");
  }
 function handleDueDateChange(selectedDate) {
  if (!selectedDate) {
    setDueDate("");
    return;
  }

  const date = selectedDate.toDate();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  setDueDate(`${year}-${month}-${day}`);
}
  function createGoal(event) {
    event.preventDefault();

    if (!title.trim()) return;

    const newGoal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      dueDate,
      createdAt: new Date().toISOString(),
      completed: false,
      tasks: newTasks,
    };

    setGoals((previous) => [newGoal, ...previous]);

    setTitle("");
    setDescription("");
    setDueDate("");
    setCategory("personal");
    setNewTasks([]);
    setTaskInput("");
    setShowForm(false);
  }

  function toggleTask(goalId, taskId) {
    setGoals((previous) =>
      previous.map((goal) => {
        if (goal.id !== goalId) return goal;

        const tasks = goal.tasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        );

        return {
          ...goal,
          tasks,
          completed:
            tasks.length > 0 && tasks.every((task) => task.completed),
        };
      })
    );
  }

  function deleteGoal(goalId) {
    setGoals((previous) =>
      previous.filter((goal) => goal.id !== goalId)
    );
  }

  function deleteTaskFromForm(taskId) {
    setNewTasks((previous) =>
      previous.filter((task) => task.id !== taskId)
    );
  }

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <div className="goals-title">
            <Target size={26} />
            <h1>{text("اهداف و پیشرفت", "Goals & Progress")}</h1>
          </div>
          <p>
            {text(
              "هدف‌هایت را مشخص کن و قدم‌به‌قدم به آن‌ها برس.",
              "Set your goals and make progress step by step."
            )}
          </p>
        </div>

        <button
          className="goal-add-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          {text("هدف جدید", "New Goal")}
        </button>
      </div>

      {showForm && (
        <form className="goal-form" onSubmit={createGoal}>
          <div className="goal-form-heading">
            <h2>{text("ساخت هدف جدید", "Create a New Goal")}</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <label>{text("عنوان هدف", "Goal title")}</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={text("مثلاً یادگیری React", "e.g. Learn React")}
            required
          />

          <label>{text("توضیحات", "Description")}</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={text("توضیح کوتاهی درباره هدفت...", "Describe your goal...")}
            rows={3}
          />

          <div className="goal-form-row">
            <div>
              <label>{text("دسته‌بندی", "Category")}</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="personal">{text("شخصی", "Personal")}</option>
                <option value="education">{text("تحصیلی", "Education")}</option>
                <option value="career">{text("شغلی", "Career")}</option>
                <option value="health">{text("سلامتی", "Health")}</option>
              </select>
            </div>

            <div>
              <label>{text("تاریخ هدف", "Target date")}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <label>{text("مراحل انجام هدف", "Goal steps")}</label>
          <div className="goal-task-input">
            <input
              value={taskInput}
              onChange={(event) => setTaskInput(event.target.value)}
              placeholder={text("یک مرحله اضافه کن...", "Add a step...")}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTaskToForm();
                }
              }}
            />
            <button type="button" onClick={addTaskToForm}>
              <Plus size={17} />
            </button>
          </div>

          {newTasks.map((task) => (
            <div className="goal-form-task" key={task.id}>
              <span>{task.title}</span>
              <button
                type="button"
                onClick={() => deleteTaskFromForm(task.id)}
              >
                <X size={15} />
              </button>
            </div>
          ))}

          <button className="goal-submit-button" type="submit">
            {text("ذخیره هدف", "Save Goal")}
          </button>
        </form>
      )}

      <div className="goals-summary">
        <div>
          <Target size={21} />
          <span>{text("کل اهداف", "Total Goals")}</span>
          <strong>{goals.length}</strong>
        </div>
        <div>
          <Check size={21} />
          <span>{text("تکمیل‌شده", "Completed")}</span>
          <strong>{goals.filter((goal) => goal.completed).length}</strong>
        </div>
        <div>
          <ListTodo size={21} />
          <span>{text("در حال انجام", "In Progress")}</span>
          <strong>{goals.filter((goal) => !goal.completed).length}</strong>
        </div>
      </div>

      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="goals-empty">
            <Target size={42} />
            <h3>{text("هنوز هدفی ثبت نکرده‌ای", "No goals yet")}</h3>
            <p>
              {text(
                "اولین هدفت را بساز و مسیر پیشرفتت را شروع کن.",
                "Create your first goal and start making progress."
              )}
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const tasks = goal.tasks || [];
            const completedTasks = tasks.filter(
              (task) => task.completed
            ).length;

            const progress = tasks.length
              ? Math.round((completedTasks / tasks.length) * 100)
              : 0;

            return (
              <article className="goal-card" key={goal.id}>
                <div className="goal-card-header">
                  <div>
                    <span className="goal-category">
                      {text(
                        {
                          personal: "شخصی",
                          education: "تحصیلی",
                          career: "شغلی",
                          health: "سلامتی",
                        }[goal.category] || "شخصی",
                        goal.category || "Personal"
                      )}
                    </span>
                    <h3>{goal.title}</h3>
                  </div>

                  <button
                    className="goal-delete-button"
                    onClick={() => deleteGoal(goal.id)}
                    title={text("حذف هدف", "Delete goal")}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}

                <div className="goal-progress-info">
                  <span>{text("میزان پیشرفت", "Progress")}</span>
                  <strong>{progress}%</strong>
                </div>

                <div className="goal-progress-track">
                  <div
                    className="goal-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="goal-card-footer">
                  <span>
                    <ListTodo size={15} />
                    {completedTasks} / {tasks.length}
                  </span>

                  {goal.dueDate && (
                    <span>
                      <CalendarDays size={15} />
                      {goal.dueDate}
                    </span>
                  )}
                </div>

                {tasks.length > 0 && (
                  <div className="goal-tasks-list">
                    {tasks.map((task) => (
                      <label className="goal-task-item" key={task.id}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(goal.id, task.id)}
                        />
                        <span
                          className={task.completed ? "completed" : ""}
                        >
                          {task.title}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GoalsPage;
