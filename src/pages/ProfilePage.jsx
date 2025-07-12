// import React from "react";
// import MainLayout from "../layouts/MainLayout";
// import ConnectedDeviceCard from "../components/ConnectedDeviceCard";

// const ProfilePage = () => {
//   const user = {
//     name: "Tanmay Gusain",
//     email: "tanmay@example.com",
//     avatar: "https://i.pravatar.cc/150?img=56",
//   };

//   const devices = [
//     {
//       name: "Fitbit Versa 4",
//       type: "Smartwatch",
//       logo: "https://logodownload.org/wp-content/uploads/2020/07/fitbit-logo.png",
//       connected: true,
//     },
//     {
//       name: "Samsung Galaxy Watch",
//       type: "Smartwatch",
//       logo: "https://cdn-icons-png.flaticon.com/512/5968/5968381.png",
//       connected: false,
//     },
//   ];

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>

//       <div className="bg-white rounded-2xl p-6 shadow-md flex items-center space-x-6 mb-6">
//         <img
//           src={user.avatar}
//           alt="avatar"
//           className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
//         />
//         <div>
//           <h2 className="text-xl font-semibold text-gray-700">{user.name}</h2>
//           <p className="text-sm text-gray-500">{user.email}</p>
//         </div>
//       </div>

//       <div>
//         <h3 className="text-lg font-semibold text-gray-700 mb-2">Connected Devices</h3>
//         <div className="space-y-3">
//           {devices.map((device, index) => (
//             <ConnectedDeviceCard key={index} device={device} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;


import React, { useEffect, useState } from "react";

import ConnectedDeviceCard from "../components/ConnectedDeviceCard";
import axios from "axios";

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "https://i.pravatar.cc/150?img=56",
    age: "",
    gender: "",
    phone: "",
    country: "",
    role: "Patient", // default
  });

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem("user_email"); // must be set on login
        const res = await axios.get(`http://localhost:8000/users/profile?email=${email}`);
        const userData = res.data;
        setUser((prev) => ({
          ...prev,
          ...userData,
          role: userData.role || "Patient",
        }));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put("http://localhost:8000/users/update", {
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        country: user.country,
        role: user.role,
      });
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      setMessage("Update failed. Please try again.");
    }
  };

  const devices = [
    {
      name: "Fitbit Versa 4",
      type: "Smartwatch",
      logo: "https://logodownload.org/wp-content/uploads/2020/07/fitbit-logo.png",
      connected: true,
    },
    {
      name: "Samsung Galaxy Watch",
      type: "Smartwatch",
      logo: "https://cdn-icons-png.flaticon.com/512/5968/5968381.png",
      connected: false,
    },
  ];

  return (
    
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>

        <div className="bg-white rounded-2xl p-6 shadow-md flex items-center space-x-6 mb-6">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-700">{user.name || "N/A"}</h2>
            <p className="text-sm text-gray-500">{user.email || "N/A"}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Age</label>
              <input
                type="number"
                name="age"
                value={user.age || ""}
                onChange={handleChange}
                disabled={!editing}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select
                name="gender"
                value={user.gender || ""}
                onChange={handleChange}
                disabled={!editing}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
                disabled={!editing}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Country</label>
              <input
                type="text"
                name="country"
                value={user.country || ""}
                onChange={handleChange}
                disabled={!editing}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                name="role"
                value={user.role || "Patient"}
                onChange={handleChange}
                disabled={!editing}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Profile
              </button>
            )}
            {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Connected Devices</h3>
          <div className="space-y-3">
            {devices.map((device, index) => (
              <ConnectedDeviceCard key={index} device={device} />
            ))}
          </div>
        </div>
      </div>
    
  );
};

export default ProfilePage;
