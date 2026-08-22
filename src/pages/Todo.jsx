import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

import supabase from "../supabase-client";

function Todo({ session }) {
  const navigate = useNavigate();

  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("TodoList")
      .select("*")
      .eq("user_id", session.user.id)
      .order("id", { ascending: true });

    if (error) {
      console.log("Error fetching:", error);
    } else {
      setTodoList(data);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const newTodoData = {
      name: newTodo,
      isCompleted: false,
      user_id: session.user.id,
    };

    const { data, error } = await supabase
      .from("TodoList")
      .insert([newTodoData])
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      alert(error.message);
      return;
    }

    setTodoList((prev) => [...prev, data]);
    setNewTodo("");
  };

  const completeTask = async (id, isCompleted) => {
    const { error } = await supabase
      .from("TodoList")
      .update({
        isCompleted: !isCompleted,
      })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.log("Error toggling task:", error);
      return;
    }

    setTodoList((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              isCompleted: !isCompleted,
            }
          : todo,
      ),
    );
  };

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from("TodoList")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.log("Error deleting task:", error);
      return;
    }

    setTodoList((prev) => prev.filter((todo) => todo.id !== id));
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Error logout:", error);
      return;
    }

    navigate("/login");
  };

  return (
    <div className="todo-container">
      <div className="todo-card">
        <div className="todo-header">
          <div>
            <p className="todo-label">MY TASKS</p>

            <h1>Todo List</h1>

            <p className="todo-subtitle">Manage your daily tasks easily.</p>

            <button onClick={logout}>Logout</button>
          </div>

          <div className="todo-count">
            {todoList.length}

            <span>Tasks</span>
          </div>
        </div>

        <div className="todo-input-wrapper">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTodo();
              }
            }}
          />

          <button onClick={addTodo}>
            <span>+</span>
            Add Task
          </button>
        </div>

        <div className="todo-list">
          {todoList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>

              <h3>No tasks yet</h3>

              <p>Add a task above to get started.</p>
            </div>
          ) : (
            todoList.map((todo) => (
              <div
                className={`todo-item ${todo.isCompleted ? "completed" : ""}`}
                key={todo.id}
              >
                <button
                  className="check-button"
                  onClick={() => completeTask(todo.id, todo.isCompleted)}
                >
                  {todo.isCompleted && "✓"}
                </button>

                <div className="todo-content">
                  <p>{todo.name}</p>

                  <span>{todo.isCompleted ? "Completed" : "In progress"}</span>
                </div>

                <button
                  className="delete-button"
                  onClick={() => deleteTask(todo.id)}
                  title="Delete task"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff0000"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Todo;
