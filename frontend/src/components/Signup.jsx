import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSigninWithGoogle = async (response) => {
    const payload = response.credential;
    try {
      const serverRes = await axios.post("http://localhost:8000/api/v1/auth/google/", { 'access_token': payload });
      if (serverRes.status === 200) {
        navigate("/otp/verify");
        toast.success("Google login successful!");
      } else {
        toast.error("Google login failed.");
      }
    } catch (error) {
      toast.error("Google login failed.");
    }
  };

  const handleSigninWithGithub = async () => {
    // Redirect to GitHub's OAuth authorization URL
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&scope=user:email`);
  };

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleSigninWithGoogle
    });
    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large", text: "continue_with", shape: "circle", width: "280" }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/register/', formData);
      if (response.status === 201) {
        navigate("/otp/verify");
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred during signup');
    }
  };

  const { email, first_name, last_name, password, password2 } = formData;

  return (
    <div className="form-container">
      <div className="wrapper">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input type="email" id="email" className="email-form" name="email" value={email} onChange={handleOnChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="first_name">First Name:</label>
            <input type="text" id="first_name" className="email-form" name="first_name" value={first_name} onChange={handleOnChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name:</label>
            <input type="text" id="last_name" className="email-form" name="last_name" value={last_name} onChange={handleOnChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" className="email-form" name="password" value={password} onChange={handleOnChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password:</label>
            <input type="password" id="password2" className="email-form" name="password2" value={password2} onChange={handleOnChange} required />
          </div>
          <button type="submit" className="submitButton">Submit</button>
        </form>
        <h3 className="text-option">Or</h3>
        <div className="googleContainer">
          <div id="signInDiv" className="gsignIn"></div>
        </div>

        <div className="githubContainer">
          <button onClick={handleSigninWithGithub} className="githubButton">Sign in with GitHub</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
