import React, {useState} from "react"
import axios from "axios"

function LoginPage({goToChat, goToHome, setLoggedInUser}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async() => {
        try {
            const response = await axios.post("http://localhost:3000/api/auth/login", 
                {
                    username,
                    password
                }
            );
            setMessage(response.data.message);
            setLoggedInUser(response.data.username);
            setUsername("");
            setPassword("");

            setTimeout(()=> {
                goToChat();
            }, 1000)
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Enter proper username and password..");
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

                <p className="message">{message}</p>
            </div>
        </div>
    );
}

export default LoginPage;