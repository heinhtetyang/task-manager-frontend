import React, { useEffect, useState } from "react";


const API = "https://task-manager-frontend-np88.onrender.com";
 // ← 換成真正的 Render URL

function App() {
  // 任務列表
  const [tasks, setTasks] = useState([]);

  // 新增任務用
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "environment",
    locationName: "",
    points: 10,
  });

  // 被選到的任務（給使用者 claim / submit）
  const [selectedTask, setSelectedTask] = useState(null);

  // 使用者完成任務用
  const [userName, setUserName] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [message, setMessage] = useState("");

  // 讀取任務
  const fetchTasks = async () => {
    const res = await fetch(`${API}/tasks`);
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 新增任務（社區端 / 任何人都可發）
  const handleCreateTask = async (e) => {
    e.preventDefault()
    console.log("🔔 handleCreateTask fired, newTask =", newTask);
    if (!newTask.title.trim()) return;

    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    if (!res.ok) {
      alert("新增任務失敗");
      return;
    }

    setNewTask({
      title: "",
      description: "",
      type: "environment",
      locationName: "",
      points: 10,
    });
    await fetchTasks();
  };

  // 使用者：「我要完成」
  const handleClaim = async () => {
    if (!selectedTask) return;
    if (!userName.trim()) {
      setMessage("請先輸入你的名字（暱稱）");
      return;
    }

    const res = await fetch(`${API}/tasks/${selectedTask._id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`已加入「我要完成」，狀態：${data.status}`);
    } else {
      setMessage(`發生錯誤：${data.error || "unknown"}`);
    }
  };

  // 使用者：送出完成證明
  const handleSubmitProof = async () => {
    if (!selectedTask) return;
    if (!userName.trim()) {
      setMessage("請先輸入你的名字（暱稱）");
      return;
    }
    if (!proofNote.trim()) {
      setMessage("請簡單描述你做了什麼");
      return;
    }

    const res = await fetch(`${API}/tasks/${selectedTask._id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, proofNote }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`已送出完成證明，目前狀態：${data.status}`);
      setProofNote("");
    } else {
      setMessage(`發生錯誤：${data.error || "unknown"}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "40px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000 }}>
        <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 24 }}>
          城事 GO｜在地任務平台
        </h1>

        {/* 新增任務（社區端） */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            發布任務（社區端／任何人都可以先用）
          </h2>
          <form
            onSubmit={handleCreateTask}
            style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 8 }}
          >
            <input
              type="text"
              placeholder="任務標題，如：南澳公園撿垃圾 5 件"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <input
              type="text"
              placeholder="任務說明"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <input
              type="text"
              placeholder="地點名稱，如：南澳公園"
              value={newTask.locationName}
              onChange={(e) => setNewTask({ ...newTask, locationName: e.target.value })}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
            />

            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="environment">環境清潔</option>
              <option value="facility">設施回報</option>
              <option value="donation">捐贈 / 募集</option>
              <option value="sharing">資源分享</option>
              <option value="other">其他</option>
            </select>

            <input
              type="number"
              min={1}
              value={newTask.points}
              onChange={(e) => setNewTask({ ...newTask, points: Number(e.target.value) })}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
              placeholder="積分"
            />

            <button
              type="submit"
              style={{
                gridColumn: "span 3",
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                background: "#111827",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              新增任務
            </button>
          </form>
        </section>

        {/* 主內容：左邊任務列表，右邊任務詳情 + 完成流程 */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          {/* 任務列表 */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>附近任務列表</h2>
            {tasks.length === 0 ? (
              <p style={{ color: "#6b7280" }}>目前還沒有任務，先在上面新增一個吧！</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTask(t)}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      background:
                        selectedTask && selectedTask._id === t._id ? "#e5f2ff" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                      {t.locationName || "地點未填"} · 積分 {t.points} 點 · 類型 {t.type}
                    </div>
                    {t.description && (
                      <div style={{ fontSize: 12, color: "#4b5563" }}>{t.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 任務詳情 + 我要完成 + 完成證明 */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>任務詳情 / 完成回報</h2>

            {!selectedTask ? (
              <p style={{ color: "#6b7280" }}>請先在左邊點一個任務。</p>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                    {selectedTask.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                    地點：{selectedTask.locationName || "未填"}
                    {" · "}
                    積分：{selectedTask.points} 點
                  </div>
                  {selectedTask.description && (
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      說明：{selectedTask.description}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: 12,
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <input
                    type="text"
                    placeholder="你的名字（暱稱）"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  />

                  <button
                    onClick={handleClaim}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    我要完成
                  </button>

                  <textarea
                    placeholder="完成後簡單描述你做了什麼，例如：已撿起 5 件垃圾並丟進公園垃圾桶。"
                    rows={3}
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      resize: "vertical",
                    }}
                  />

                  <button
                    onClick={handleSubmitProof}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "none",
                      background: "#16a34a",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    送出完成證明
                  </button>

                  {message && (
                    <div style={{ fontSize: 13, color: "#111827", marginTop: 4 }}>{message}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;


