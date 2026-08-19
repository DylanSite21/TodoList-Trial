import { useEffect, useState } from "react";
import "./App.css";
import supabase from "./supabase-client";

function App() {
  const [session, setSession] = useState(null);
  const [isRegister, setIsRegister] = useState(false);

  // Auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Todo
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchTodos();
    } else {
      setTodoList([]);
    }
  }, [session]);

  // =========================
  // AUTH
  // =========================

  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (isRegister) {
      // Register
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      // Buat profile
      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          name: name,
        });

        if (profileError) {
          console.log("Error creating profile:", profileError);
          return;
        }
      }

      alert("Register berhasil!");

      setEmail("");
      setPassword("");
      setName("");
      setIsRegister(false);
    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setEmail("");
      setPassword("");
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Error logout:", error);
    }
  };

  // =========================
  // TODO
  // =========================

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("TodoList")
      .select("*")
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
    } else {
      setTodoList((prev) => [...prev, data]);
      setNewTodo("");
    }
  };

  const completeTask = async (id, isCompleted) => {
    const { error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.log("Error toggling task:", error);
    } else {
      setTodoList((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo,
        ),
      );
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("TodoList").delete().eq("id", id);

    if (error) {
      console.log("Error deleting task:", error);
    } else {
      setTodoList((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  // =========================
  // LOGIN / REGISTER PAGE
  // =========================

  if (!session) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>{isRegister ? "Create Account" : "Welcome Back"}</h1>

          <p className="auth-subtitle">
            {isRegister
              ? "Create your account to manage your tasks."
              : "Login to manage your daily tasks."}
          </p>

          <form onSubmit={handleAuth}>
            {isRegister && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button className="auth-button" type="submit">
              {isRegister ? "Register" : "Login"}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setIsRegister(false)}>Login</button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button onClick={() => setIsRegister(true)}>Register</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // TODO PAGE
  // =========================

  return (
    <div className="todo-container">
      <div className="todo-card">
        <div className="todo-header">
          <div>
            <p className="todo-label">MY TASKS</p>
            <h1>Todo List</h1>
            <p className="todo-subtitle">Manage your daily tasks easily.</p>
            <div>
              <button onClick={logout}>Logout</button>
            </div>
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

export default App;
