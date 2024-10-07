import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../utils/AxiosInstance";

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleOnChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLoginWithGoogle = (response) => {
        console.log("id_token", response.credential);
    };

    const handleLoginWithGithub = () => {
        window.location.assign(`https://github.com/login/oauth/authorize/?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`);
    };

    const sendGithubCodeToServer = async () => {
        const code = searchParams.get('code');
        if (code) {
            try {
                const resp = await AxiosInstance.post('auth/github/', { 'code': code });
                const result = resp.data;
                if (resp.status === 200) {
                    const user = {
                        email: result.email,
                        names: result.full_name
                    };
                    localStorage.setItem('token', JSON.stringify(result.access_token));
                    localStorage.setItem('refresh_token', JSON.stringify(result.refresh_token));
                    localStorage.setItem('user', JSON.stringify(user));
                    navigate('/dashboard');
                    toast.success('Login successful');
                }
            } catch (error) {
                toast.error(error.response?.data?.detail || 'An error occurred during GitHub login');
            }
        }
    };

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            sendGithubCodeToServer();
        }
    }, [searchParams]);

    useEffect(() => {
        /* global google */
        google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleLoginWithGoogle
        });
        google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            { theme: "outline", size: "large", text: "continue_with", shape: "circle", width: "280" }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await AxiosInstance.post('auth/login/', loginData);
            const response = res.data;
            const user = {
                full_name: response.full_name,
                email: response.email
            };
            if (res.status === 200) {
                localStorage.setItem('token', JSON.stringify(response.access_token));
                localStorage.setItem('refresh_token', JSON.stringify(response.refresh_token));
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/dashboard');
                toast.success('Login successful');
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'An error occurred during login');
        }
    };

    return (
        <div className="form-container">
            <div className="wrapper">
                <h2>Login into Your Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address:</label>
                        <input type="email" id="email" className="email-form" name="email" value={loginData.email} onChange={handleOnChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" className="email-form" name="password" value={loginData.password} onChange={handleOnChange} required />
                    </div>
                    <button type="submit" className="submitButton">Login</button>
                    <p className='pass-link'><Link to={'/forget-password'}>Forgot Password?</Link></p>
                </form>
                <h3 className="text-option">Or</h3>
                <div className="githubContainer">
                    <button onClick={handleLoginWithGithub}>Sign in with GitHub</button>
                </div>
                <div className="googleContainer">
          <div id="signInDiv" className="gsignIn"></div>
        </div>
            </div>
        </div>
    );
};

export default Login;
