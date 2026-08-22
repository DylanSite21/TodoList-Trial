import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import supabase from "../supabase-client";
import "../css/Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    setName("");
    setEmail("");
    setPassword("");

    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>

          <p>Create your account to manage your tasks.</p>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-form-group">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button className="register-button" type="submit">
            Register
          </button>
        </form>

        <div className="register-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
