import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import ChatSelectionPage from "./pages/ChatSelectionPage";
import PrivateChatPage from "./pages/PrivateChatPage";
import "./pages.css";

function App() {
    const [page, setPage] = useState("home");
    const [loggedInUser, setLoggedInUser] = useState("");

    return (
        <div>
            {page === "home" && (
                <HomePage
                    goToLogin={() => setPage("login")}
                    goToRegister={() => setPage("register")}
                />
            )}

            {page === "register" && (
                <RegisterPage
                    goToLogin={() => setPage("login")}
                    goToHome={() => setPage("home")}
                />
            )}

            {page === "login" && (
                <LoginPage
                    goToChat={() => setPage("select")}
                    goToHome={() => setPage("home")}
                    setLoggedInUser={setLoggedInUser}
                />
            )}

            {page === "chat" && (
                <ChatPage
                    username={loggedInUser}
                    goBack={() => setPage("select")}
                    logout={() => {
                        setLoggedInUser("");
                        setPage("home");
                    }}
                />
            )}

            {page === "select" && (
                <ChatSelectionPage
                    goToPublic={() => setPage("chat")}
                    goToPrivate={() => setPage("private")}
                    logout={() => {
                        setLoggedInUser("");
                        setPage("home");
                    }}
                />
            )}

            {page === "private" && (
                <PrivateChatPage
                    username={loggedInUser}
                    goBack={() => setPage("select")}
                    logout={() => {
            setLoggedInUser("");
            setPage("home");
        }}
    />
)}
        </div>
    );
}

export default App;