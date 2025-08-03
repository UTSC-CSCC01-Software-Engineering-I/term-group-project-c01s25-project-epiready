import React, { useState, useEffect } from "react";
import CreateOrganizationPopup from "../components/organization/CreateOrganization";
import JoinOrganizationPopup from "../components/organization/JoinOrganization";
import Navbar from '../components/Navbar';
import { useGlobal } from "../LoggedIn";

export default function Organization() {
    const [userOrganization, setUserOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const { loggedIn } = useGlobal();

    useEffect(() => {
        if (loggedIn) {
            fetchUserOrganization();
        } else {
            setLoading(false);
        }
    }, [loggedIn]);

    const fetchUserOrganization = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
                method: "POST",
                headers: {
                    "Authorization": token
                }
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.organization_id) {
                    // Fetch the organization details from the backend
                    const orgResp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/organization?id=${userData.organization_id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
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
            <div className="bg-[#1D1D1D] min-h-screen flex flex-col items-center">
                <Navbar currentPage="/organization" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center bg-neutral-900 rounded-xl p-8 shadow-lg">
                        <h1 className="text-2xl font-bold text-[#bfc9d1] mb-4">Please log in to access organization features</h1>
                        <p className="text-[#d1d5db]">You need to be logged in to manage organizations and view organization details.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-[#1D1D1D] min-h-screen flex flex-col items-center">
                <Navbar currentPage="/organization" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-[#bfc9d1] mb-4">Loading...</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1D1D1D] min-h-screen flex flex-col items-center">
            <Navbar currentPage="/organization" />
            <div className="flex-1 flex m-8 w-9/10 sm:w-4/5">
                <div className="w-full space-y-6">
                    <h1 className="text-4xl font-bold mb-8 text-center text-[#bfc9d1] tracking-wide underline">
                        Organization Management
                    </h1>
                    
                    {userOrganization ? (
                        <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
                            <h2 className="text-3xl font-semibold text-[#bfc9d1] mb-6">Your Organization</h2>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-y-4 gap-x-10 justify-between">
                                    <div className="basis-[45%] text-[#d1d5db] text-xl">
                                        <span className="font-semibold" style={{ color: "#5e7c4e" }}>Name:</span>
                                        <span className="ml-2">{userOrganization.name}</span>
                                    </div>
                                    <div className="basis-[45%] text-[#d1d5db] text-xl">
                                        <span className="font-semibold" style={{ color: "#5e7c4e" }}>Join Code:</span>
                                        <span className="ml-2 font-mono bg-neutral-800 px-2 py-1 rounded">{userOrganization.join_code}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-neutral-800 rounded-lg border-l-4 border-[#869F77]">
                                <p className="text-[#d1d5db] text-sm">
                                    💡 Share this join code with others to invite them to your organization.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
                            <h2 className="text-3xl font-semibold text-[#bfc9d1] mb-4">No Organization</h2>
                            <p className="text-[#d1d5db] mb-6 text-lg">
                                You are not currently part of any organization. Create a new one or join an existing organization using a join code.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <CreateOrganizationPopup
                                    trigger={
                                        <button className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-103 hover:shadow-lg bg-[#6B805E] hover:bg-[#4e6147] focus:bg-[#4e6147]">
                                            Create Organization
                                        </button>
                                    }
                                    onOrganizationCreated={handleOrganizationCreated}
                                />
                                
                                <JoinOrganizationPopup
                                    trigger={
                                        <button className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-103 hover:shadow-lg bg-[#6B805E] hover:bg-[#4e6147] focus:bg-[#4e6147]">
                                            Join Organization
                                        </button>
                                    }
                                    onOrganizationJoined={handleOrganizationJoined}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
                        <h2 className="text-3xl font-semibold text-[#bfc9d1] mb-6">Organization Features</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-[#869F77] transition-colors">
                                <h3 className="font-semibold text-[#bfc9d1] mb-3 text-xl">Create Organization</h3>
                                <p className="text-[#d1d5db] text-sm mb-4">
                                    Start a new organization and invite team members using a custom join code. Perfect for companies or teams working together.
                                </p>
                                <CreateOrganizationPopup
                                    trigger={
                                        <button className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 bg-[#6B805E] hover:bg-[#4e6147]">
                                            Create New
                                        </button>
                                    }
                                    onOrganizationCreated={handleOrganizationCreated}
                                />
                            </div>
                            
                            <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-[#869F77] transition-colors">
                                <h3 className="font-semibold text-[#bfc9d1] mb-3 text-xl">Join Organization</h3>
                                <p className="text-[#d1d5db] text-sm mb-4">
                                    Join an existing organization using a join code provided by the organization creator. Get access to shared resources and collaboration.
                                </p>
                                <JoinOrganizationPopup
                                    trigger={
                                        <button className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 bg-[#6B805E] hover:bg-[#4e6147]">
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
        </div>
    );
} 