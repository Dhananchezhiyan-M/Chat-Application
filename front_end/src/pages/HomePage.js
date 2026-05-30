import React from "react";

function HomePage({ goToLogin, goToRegister }) {
    return (
        <div className="bg-home">
            <div className="card">
                <h1 className="title">Secure Chat</h1>
                <p className="subtitle">Please choose an option</p>

                <div className="btn-group">
                    <button onClick={goToLogin}>Login</button>
                    <button onClick={goToRegister}>Register</button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;

// Initially page = "home" ✅
// So HomePage opens ✅
// Then if you click Login, it calls goToLogin ✅
// goToLogin runs setPage("login") ✅
// After that the page becomes login.
//page="login", so again the App() runs with the page value page="login"(running login page).