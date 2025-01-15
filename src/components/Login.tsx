import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { creds } from "../data/creds.ts";
import { useAuth } from "../context/AuthContext"; // Import the custom hook
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import logo1 from "../assets/AWES_Logo.jpg";
import logo3 from "../assets/Ait.png";
import logo4 from "../assets/Ait.svg";

interface FormState {
  username: string;
  password: string;
  showPassword: boolean;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    username: "",
    password: "",
    showPassword: false,
  });

  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from the context

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePassword = () => {
    setFormData((prevState) => ({
      ...prevState,
      showPassword: !prevState.showPassword,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = creds.find(
      (cred) =>
        cred.username === formData.username && cred.password === formData.password
    );

    if (user) {
      // Save user credentials to localStorage
      localStorage.setItem("username", formData.username);
      localStorage.setItem("password", formData.password);

      // Use the login function from the context
      login(formData.username, formData.password);

      // Navigate to the dashboard
      navigate("/dashboard");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
            <img src={logo4} alt="AWES Logo" className="h-12" />
          </div>
        </div>
      </nav>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_8px_rgba(0,0,0,0.25)] w-[90%] md:w-[40%] lg:w-[27%]">
          <img src={logo} alt="Logo" className="w-4/12 mb-6" />
          <h1 className="text-2xl font-bold text-black mb-2 text-center">
            Navyug Result Portal
          </h1>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Fill Up Your Details to View Qualified Teams For 
            <br />Navyug AI Hackathon 2024-25 (Round 1)
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                type="text"
                required
                className="mt-1 bg-white block w-full px-[20px] py-3 border border-gray-300 text-sm rounded-md text-gray-700 focus:bg-white"
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={formData.showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="mt-1 bg-white mb-6 block w-full px-[20px] py-3 border text-black border-gray-300 text-sm rounded-md"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute  bottom-[0.8rem] text-gray-700 right-[1rem]"
              >
                {formData.showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-[#2F84C3] text-white font-semibold py-3 rounded-md hover:bg-[rgba(47,131,195,0.869)]"
            >
              Login
            </button>
            <p className="text-gray-400 text-xs mt-6 text-center">
              In case of any technical difficulty mail us.
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
