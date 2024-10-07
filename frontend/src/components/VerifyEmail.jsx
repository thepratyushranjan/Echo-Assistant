// import axios from 'axios'
// import React, {useState} from 'react'
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const VerifyEmail = () => {
//     const [otp, setOtp]=useState("")
//     const navigate=useNavigate()

//     const handleOtpSubmit = async(e)=>{
//             e.preventDefault()
//             if (otp) {
//                 const res = await axios.post('http://localhost:8000/api/v1/auth/verify-email/', {'otp':otp})
//                 const resp = res.data
//                 if (res.status === 200) {
//                     navigate('/login')
//                     toast.success(resp.message)
//                 }
                
//             }
            
//     }
//   return (
//     <div>
//         <div className='form-container'>
//             <form action="" style={{width:"30%"}} onSubmit={handleOtpSubmit}>
//                <div className='form-group'>
//                  <label htmlFor="">Enter your Otp code:</label>
//                  <input type="text"
//                   className='email-form'  
//                   name="otp"
//                   value={otp}
//                   onChange={(e)=>setOtp(e.target.value)} 
//                    />
//                </div>
//                <button type='submit' className='vbtn'>Send</button>
//             </form>
//         </div>
//     </div>
//   )
// }

// export default VerifyEmail



import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './VerifyEmail.css';

const VerifyEmail = () => {
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (otp) {
            try {
                const res = await axios.post('http://localhost:8000/api/v1/auth/verify-email/', { 'otp': otp });
                const resp = res.data;
                if (res.status === 200) {
                    navigate('/login');
                    toast.success(resp.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Failed to verify OTP. Please try again.');
            }
        } else {
            toast.error('Please enter your OTP code.');
        }
    };

    return (
        <div className="verify-email-container">
            <div className="form-wrapper">
                <h2>Verify Your Email</h2>
                <form onSubmit={handleOtpSubmit}>
                    <div className='form-group'>
                        <label htmlFor="otp">Enter Your OTP Code:</label>
                        <input
                            type="text"
                            id="otp"
                            className='otp-input'
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <button type='submit' className='submit-button'>Verify</button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
