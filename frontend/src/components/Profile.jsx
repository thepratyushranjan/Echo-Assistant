
import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../utils/AxiosInstance";
import ChatThread from './ChatThread';
import './Profile.css';

const Profile = () => {
    const jwt = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        if (jwt === null || !user) {
            navigate('/login');
        } else {
            getSomeData();
        }
    }, [jwt, user, navigate]);

    const getSomeData = async () => {
        try {
            const res = await AxiosInstance.get('auth/get-something/');
            console.log(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error fetching data");
        }
    };

    const refresh = JSON.parse(localStorage.getItem('refresh_token'));

    const handleLogout = async () => {
        try {
            const res = await AxiosInstance.post('auth/logout/', { 'refresh_token': refresh });
            if (res.status === 204) {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                navigate('/login');
                toast.warn("Logout successful");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            toast.error("Logout failed");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>Hi {user && user.full_name}</h2>
                <p className="welcome-text">Welcome to your profile!</p>
            </div>
            <div className="profile-content">
                <p className="profile-info">Here you can manage your account settings and preferences.</p>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
            {/* ChatThread component integrated into the profile page */}
            <div className="chat-thread-section">
                <h3>Chat with Echo Assistant</h3>
                <ChatThread />
            </div>
        </div>
    );
};

export default Profile;
