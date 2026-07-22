import React, { useState } from "react";
import axios from "axios";
import "../pages.css";
import { API_URL } from "../config";

function RegisterPage({ goToLogin, goToHome }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
        setMessage({ text: "Please complete all fields.", type: "error" });
        return;
    }

    if (password !== confirmPassword) {
        setMessage({ text: "Passwords do not match.", type: "error" });
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/register`,
        {
          //here response is the message received from backend
          //axios is for sending from frontend to the backend.
            username,
            password,
        },
        );
      setMessage({ text: response.data.message, type: "success" }); // ✅
        setUsername("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
        goToLogin();
        }, 1000);
    } catch (error) {
        if (error.response) {
        setMessage({ text: error.response.data.message, type: "error" });
        } else {
        setMessage({
            text: "Enter proper username and password..",
            type: "error",
        });
        }
    }
    };
    return (
    <div className="bg-register">
        <div className="card">
        <h2 className="title">Register</h2>

        <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />

        <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <input
            type="password"
            placeholder="Retype password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="btn-group">
            <button onClick={handleRegister}>Register</button>
            <button onClick={goToHome}>Home</button>
        </div>

        <p
            className={`message${message.type ? ` message--${message.type}` : ""}`}
        >
            {message.text}
        </p>
        </div>
    </div>
    );
}

export default RegisterPage;
