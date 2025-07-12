// import React, { useState } from 'react';
// import { useNavigate } from "react-router-dom";
// import axios from 'axios';

// function Signup() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: ''
//   });

//   const [message, setMessage] = useState('');
//   const [successMsg, setSuccessMsg] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post('http://localhost:8000/auth/signup', formData);
//       setSuccessMsg("Signup successful! Redirecting to login...");
//       setErrorMsg("");

//       // Wait 2 seconds, then navigate
//       setTimeout(() => {
//         navigate("/login");
//       }, 2000);
//     } catch (err) {
//       setErrorMsg("Signup failed. Please try again.");
//       setSuccessMsg("");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-96">
//         {/* App Name + Tagline */}
//         <div className="text-center mb-6">
//           <h1 className="text-2xl font-bold text-green-700">Smart Health Monitor</h1>
//           <p className="text-sm text-gray-500">Sign up to begin tracking your health</p>
//         </div>

//         <form onSubmit={handleSignup}>
//           <input
//             type="text"
//             name="name"
//             placeholder="Full Name"
//             onChange={handleChange}
//             className="w-full mb-3 p-2 border border-gray-300 rounded"
//             required
//           />
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={handleChange}
//             className="w-full mb-3 p-2 border border-gray-300 rounded"
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//             className="w-full mb-4 p-2 border border-gray-300 rounded"
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
//           >
//             Register
//           </button>
//           {message && (
//             <p className="mt-3 text-center text-sm text-gray-700">{message}</p>
//           )}
//         </form>
//         {successMsg && (
//           <p className="text-green-600 text-center mt-4">{successMsg}</p>
//         )}
//         {errorMsg && (
//           <p className="text-red-600 text-center mt-4">{errorMsg}</p>
//         )}
//       </div>
//     </div>
//   );

// };

// export default Signup;


import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    phone: '',
    country: '',
    role: '',
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/auth/signup', formData);
      setSuccessMsg("Signup successful! Redirecting to login...");
      setErrorMsg("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMsg("Signup failed. Please try again.");
      setSuccessMsg("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Smart Health Monitor</h1>
          <p className="text-sm text-gray-500">Sign up to begin tracking your health</p>
        </div>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Role</option>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-3 p-2 border border-gray-300 rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        {successMsg && (
          <p className="text-green-600 text-center mt-4">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="text-red-600 text-center mt-4">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}

export default Signup;


