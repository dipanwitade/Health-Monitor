import React, { useEffect, useState } from "react";
import axios from "axios";
console.log("ENV API URL =", process.env.REACT_APP_API_URL);

const ProfilePage = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    age: "",
    gender: "",
    phone: "",
    country: "",
    role: "",
  });

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [originalUser, setOriginalUser] = useState({});
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = localStorage.getItem("user_email");
        const name = localStorage.getItem("user_name");
        const avatar = localStorage.getItem("user_avatar");

        if (!email) return;

        const res = await axios.get(`${apiUrl}/users/profile?email=${email}`);

        const mergedUser = {
          ...res.data,
          email: res.data.email || email,
          name: res.data.name || name || "User",
          avatar: res.data.avatar || avatar,
        };

        setUser(mergedUser);
        setOriginalUser(mergedUser);

        const deviceRes = await axios.get(
          `${apiUrl}/google/devices?user_email=${email}`
        );
        setDevices(deviceRes.data.devices || []);
      } catch (err) {
        console.error("Profile load failed:", err);
      }
    };

    fetchProfile();
  }, [apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Age: numeric only, max 150
    if (name === "age") {
      if (!/^\d*$/.test(value)) return; // numbers only
      if (Number(value) > 150) return; // max 150
    }

    // Phone: digits only, max 10
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    // Country: letters & spaces only
    if (name === "country") {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    // Update state without disappearing values
    setUser({ ...user, [name]: value === "" ? "" : value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        email: user.email,
        age: user.age || null,
        gender: user.gender || null,
        phone: user.phone || null,
        country: user.country || null,
        role: user.role || null,
      };

      await axios.put(`${apiUrl}/users/update`, payload);

      setOriginalUser(user);
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Update failed.");
    }
  };

  const handleCancel = () => {
    setUser(originalUser);
    setEditing(false);
    setMessage("Changes discarded.");
  };

  const display = (value) =>
    value || <span className="text-gray-400">Not set</span>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      {/* BASIC INFO */}
      
      <div className="bg-white p-6 rounded-xl shadow mb-6 flex items-center gap-4 sm:gap-6">

        <div className="w-20 h-20 shrink-0 rounded-full bg-gray-500 flex items-center justify-center text-white text-2xl font-bold border">
          {(user.name?.trim()?.[0] || "U").toUpperCase()}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-semibold truncate">
            {user.name || "User"}
          </h2>
          
          <p className="text-gray-500 break-all">
            {user.email || "No email"}
          </p>
        </div>

      </div>

      {/* PERSONAL DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Personal Details</h3>

        {!editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Age:</strong> {display(user.age)}
            </p>
            <p>
              <strong>Gender:</strong> {display(user.gender)}
            </p>
            <p>
              <strong>Phone:</strong> {display(user.phone)}
            </p>
            <p>
              <strong>Country:</strong> {display(user.country)}
            </p>
            <p>
              <strong>Role:</strong> {display(user.role)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="age"
              placeholder="Age"
              type="number"
              value={user.age || ""}
              onChange={handleChange}
            />
            <select
              name="gender"
              value={user.gender || ""}
              onChange={handleChange}
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <input
              name="phone"
              placeholder="Phone (10 digits)"
              value={user.phone || ""}
              onChange={handleChange}
            />
            <input
              name="country"
              placeholder="Country"
              value={user.country || ""}
              onChange={handleChange}
            />
            <select
              name="role"
              value={user.role || ""}
              onChange={handleChange}
            >
              <option value="">Role</option>
              <option>Patient</option>
              <option>Doctor</option>
              <option>Admin</option>
            </select>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="btn-success">
                Save
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </>
          )}
        </div>

        {message && <p className="text-sm mt-2">{message}</p>}
      </div>

      {/* DEVICES */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Connected Devices</h3>
        {devices.length === 0 ? (
          <p className="text-gray-500">No devices found.</p>
        ) : (
          devices.map((d, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded mb-2">
              <p className="font-medium">
                {d.manufacturer} {d.model}
              </p>
              <p className="text-sm text-gray-500">
                {d.type} • {d.version}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
