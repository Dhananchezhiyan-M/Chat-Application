import React from "react";
import "../pages.css";

function ChatSelectionPage({ goToPublic, goToPrivate, logout }) {
    return (
        <div className="bg-home">
            <div className="card">
                <h2 className="title">Choose Chat Mode</h2>

                <div className="btn-group">
                    <button onClick={goToPublic}>
                        Public Chat
                    </button>

                    <button onClick={goToPrivate}>
                        Private Chat
                    </button>
                </div>

                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
        </div>
    );
}

export default ChatSelectionPage;