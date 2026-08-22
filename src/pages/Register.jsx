import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import supabase from "../supabase-client";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

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

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        name: name,
      });

      if (profileError) {
        console.log("Error creating profile:", profileError);
        alert(profileError.message);
        return;
      }
    }

    alert("Register berhasil!");

    setEmail("");
    setPassword("");
    setName("");

    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Create your account to manage your tasks.
        </p>

        <form onSubmit={handleRegister}>
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
            Register
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
