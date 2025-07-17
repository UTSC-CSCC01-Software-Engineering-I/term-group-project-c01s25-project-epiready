import React, { useState, useEffect } from "react";
import CreateOrganizationPopup from "../components/organization/CreateOrganization";
import JoinOrganizationPopup from "../components/organization/JoinOrganization";
import { useGlobal } from "../LoggedIn";

export default function Organization() {
    const [userOrganization, setUserOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const { loggedIn } = useGlobal();

    useEffect(() => {
        if (loggedIn) {
            fetchUserOrganization();
        }
    }, [loggedIn]);

    const fetchUserOrganization = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch("http://127.0.0.1:5000/api/users", {
                method: "POST",
                headers: {
                    "Authorization": token
                }
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.organization_id) {
                    // Fetch the organization details from the backend
                    const orgResp = await fetch(`http://127.0.0.1:5000/api/users/organization?id=${userData.organization_id}`, {
                        method: "GET",
                        headers: {
                            "Authorization": token
                        }
                    });
                    if (orgResp.ok) {
                        const orgData = await orgResp.json();
                        setUserOrganization(orgData);
                    } else {
                        setUserOrganization(null);
                    }
                } else {
                    setUserOrganization(null);
                }
            }
        } catch (error) {
            console.error("Error fetching user organization:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrganizationCreated = (organization) => {
        setUserOrganization(organization);
    };

    const handleOrganizationJoined = (organization) => {
        setUserOrganization(organization);
    };

    if (!loggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access organization features</h1>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Organization Management</h1>
                
                {userOrganization ? (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Organization</h2>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-gray-700">Name:</span>
                                <span className="ml-2 text-gray-900">{userOrganization.name}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Join Code:</span>
                                <span className="ml-2 text-gray-900 font-mono">{userOrganization.join_code}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                            <p className="text-blue-800 text-sm">
                                Share this join code with others to invite them to your organization.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">No Organization</h2>
                        <p className="text-gray-600 mb-6">
                            You are not currently part of any organization. Create a new one or join an existing organization using a join code.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <CreateOrganizationPopup
                                trigger={
                                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                                        Create Organization
                                    </button>
                                }
                                onOrganizationCreated={handleOrganizationCreated}
                            />
                            
                            <JoinOrganizationPopup
                                trigger={
                                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                                        Join Organization
                                    </button>
                                }
                                onOrganizationJoined={handleOrganizationJoined}
                            />
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Organization Features</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Create Organization</h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Start a new organization and invite team members using a custom join code.
                            </p>
                            <CreateOrganizationPopup
                                trigger={
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">
                                        Create New
                                    </button>
                                }
                                onOrganizationCreated={handleOrganizationCreated}
                            />
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Join Organization</h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Join an existing organization using a join code provided by the organization creator.
                            </p>
                            <JoinOrganizationPopup
                                trigger={
                                    <button className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition">
                                        Join Existing
                                    </button>
                                }
                                onOrganizationJoined={handleOrganizationJoined}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 