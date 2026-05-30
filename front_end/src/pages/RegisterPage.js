import React, {useState} from "react"
import axios from "axios"

function RegisterPage({goToLogin, goToHome}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async()=> {
        try {
            const response = await axios.post("http://localhost:3000/api/auth/register", {//here response is the message received from backend
                                                                                        //axios is for sending from frontend to the backend.
                username, 
                password
            });
            setMessage(response.data.message);
            setUsername("");
            setPassword("");

            setTimeout (()=> {
                goToLogin();
            }, 1000);

        } catch(error) {
            if(error.response) {
                setMessage(error.response.data.message)
            } else {
                setMessage("Username and Password Required..");
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

                <div className="btn-group">
                    <button onClick={handleRegister}>Register</button>
                    <button onClick={goToHome}>Home</button>
                </div>

                <p className="message">{message}</p>
            </div>
        </div>
    );
}

export default RegisterPage;