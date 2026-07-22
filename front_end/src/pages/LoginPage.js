import React, {useState} from "react";
import axios from "axios";
import "../pages.css";
import { API_URL } from "../config";

function LoginPage({goToChat, goToHome, setLoggedInUser}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleLogin = async() => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, 
                {
                    username,
                    password
                }
            );
            setMessage({ text: response.data.message, type: "success" }); // ✅
            setLoggedInUser(response.data.username);
            setUsername("");
            setPassword("");

            setTimeout(()=> {
                goToChat();
            }, 1000)
        } catch (error) {
            if (error.response) {
                setMessage({ text: error.response.data.message, type: "error" }); // ✅
            } else {
                setMessage({ text: "Enter proper username and password..", type: "error" }); // ✅
            }
        }
    };
    return (
        <div className="bg-login">
            <div className="card">
                <h2 className="title">Login</h2>

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

                <div className="btn-group">
                    <button onClick={handleLogin}>Login</button>
                    <button onClick={goToHome}>Home</button>
                </div>

                <p className={`message${message.type ? ` message--${message.type}` : ""}`}>
                    {message.text}
                </p>
            </div>
        </div>
    );
}

export default LoginPage;