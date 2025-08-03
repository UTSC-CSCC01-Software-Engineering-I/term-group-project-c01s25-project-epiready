import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

export default function CreateOrganizationPopup({ trigger, onOrganizationCreated }) {
    const [error, setError] = useState(false);
    const [message, setMessage] = useState(null);

    const handleCreateOrganization = (e, close) => {
        e.preventDefault();

        const form = e.target;
        const name = form.name.value;
        const joinCode = form.joinCode.value;

        const token = sessionStorage.getItem("token");


        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/create-organization`, {

            method: "POST",
            body: JSON.stringify({
                name: name,
                join_code: joinCode
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        })
        .then(async (res) => {
            console.log("Create organization response status: " + res.status);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || "Something unexpected happened. Please try again later");
            }
            return data;
        })
        .then((res) => {
            setMessage("Organization created successfully!");
            if (onOrganizationCreated) {
                onOrganizationCreated(res);
            }
            close();
        })
        .catch((error) => {
            setError(true);
            let errorMsg = error.message || "An error occurred while creating the organization. Please try again.";
            if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
                errorMsg = "Network error. Please check your internet connection and try again.";
            }
            setMessage(errorMsg);
        });
    };

    return (
        <Popup
            trigger={trigger}
            modal
            closeOnDocumentClick
            contentStyle={{
                background: "transparent",
                boxShadow: "none",
                padding: 0,
                border: "none",
                width: "95vw",
                maxWidth: "400px",
                minWidth: "0"
            }}
            overlayStyle={{ background: "rgba(0,0,0,0.5)" }}
        >
            {close => (
                <div className="relative bg-black max-w-[90vw] sm:w-[500px] w-full rounded-lg p-8 mx-auto flex flex-col items-center shadow-lg">
                    <button
                        className="absolute top-0 right-1 text-gray-600 text-4xl font-bold hover:text-blue-900 transition"
                        onClick={close}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Create Organization</h2>
                    <form onSubmit={e => handleCreateOrganization(e, close)} className="w-full flex flex-col gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Organization Name"
                            required
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            name="joinCode"
                            placeholder="Join Code"
                            required
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition"
                        >
                            Create Organization
                        </button>
                    </form>
                    {error && <div className="text-red-500 mt-2">{message}</div>}
                    {!error && message && <div className="text-green-500 mt-2">{message}</div>}
                </div>
            )}
        </Popup>
    );
} 