import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://task-manager-backend-ogmi.onrender.com";


function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const fetchTasks = async () => {
    const res = await axios.get(API + "/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title) return;
    await axios.post(API + "/tasks", { title });
    setTitle("");
    fetchTasks();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/tasks/${id}`, { status });
    fetchTasks();
  };

  const removeTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`);
    fetchTasks();
  };

  const columns = ["todo", "doing", "done"];

  return (
    <div className="p-6 grid grid-cols-3 gap-4 min-h-screen bg-gray-100">
      <div className="col-span-3 flex gap-2 mb-4">
        <input
          className="border p-2 flex-grow"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新增任務..."
        />
        <button className="bg-blue-500 text-white px-4" onClick={addTask}>
          新增
        </button>
      </div>

      {columns.map((col) => (
        <div key={col} className="bg-white shadow p-4 rounded">
          <h2 className="font-bold mb-2 capitalize">{col}</h2>

          {tasks
            .filter((t) => t.status === col)
            .map((t) => (
              <div
                key={t._id}
                className="border p-2 flex justify-between mb-2"
              >
                <span>{t.title}</span>
                <div className="flex gap-1">
                  {col !== "todo" && (
                    <button onClick={() => updateStatus(t._id, "todo")}>⬅</button>
                  )}
                  {col !== "doing" && (
                    <button onClick={() => updateStatus(t._id, "doing")}>🔁</button>
                  )}
                  {col !== "done" && (
                    <button onClick={() => updateStatus(t._id, "done")}>➡</button>
                  )}
                  <button onClick={() => removeTask(t._id)}>❌</button>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default App;

