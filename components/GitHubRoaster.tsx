"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Flame, Globe, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function GitHubRoaster() {
  const [username, setUsername] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<"english" | "hindi">("english");

  useEffect(() => {
    const userPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(userPrefersDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoast("");
    try {
      // First, fetch the GitHub profile data
      const profileResponse = await axios.post("/api/github-profile", {
        username,
      });
      const profileData = profileResponse.data;

      // Then, send the profile data along with the language to generate the roast
      const roastResponse = await axios.post("/api/generate-roast", {
        profileData,
        language,
      });

      setRoast(roastResponse.data.roast);
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please check the username and try again.");
    }
    setLoading(false);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "english" ? "hindi" : "english"));
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900"
          : "bg-gradient-to-br from-white to-pink-100"
      } transition-colors duration-300`}
    >
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          onClick={toggleLanguage}
          className={`p-2 rounded-full ${
            darkMode ? "bg-blue-500 text-white" : "bg-blue-200 text-blue-800"
          }`}
        >
          <Globe size={24} />
        </Button>
        <Button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${
            darkMode ? "bg-yellow-400 text-gray-900" : "bg-gray-800 text-white"
          }`}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </Button>
      </div>
      <div className="flex flex-col justify-center items-center flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1
            className="text-8xl font-bold mb-8"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            <span className={`${darkMode ? "text-red-400" : "text-red-500"}`}>
              Roast My
            </span>
            <br />
            <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              GitHub
            </span>
          </h1>
          <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Current language: {language === "english" ? "English" : "Hindi"}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className={`w-full border-2 ${
                darkMode
                  ? "border-gray-700 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              } rounded-md p-3 text-lg shadow-lg transition duration-200`}
            />
            <Button
              type="submit"
              className={`w-full ${
                darkMode
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-500 hover:bg-red-600"
              } text-white font-bold py-4 px-4 rounded-md text-lg transition duration-300 ease-in-out transform hover:scale-105`}
              disabled={loading}
            >
              {loading ? (
                "Roasting..."
              ) : (
                <span className="flex items-center justify-center">
                  Get Roasted <Flame className="ml-2" />
                </span>
              )}
            </Button>
          </form>
          {error && (
            <div
              className={`mt-6 p-4 ${
                darkMode
                  ? "bg-red-900 border-red-700"
                  : "bg-red-100 border-red-300"
              } rounded-md border`}
            >
              <p className={`${darkMode ? "text-red-200" : "text-red-800"}`}>
                {error}
              </p>
            </div>
          )}
          {roast && (
            <div
              className={`mt-6 p-4 ${
                darkMode
                  ? "bg-yellow-900 border-yellow-700"
                  : "bg-yellow-100 border-yellow-300"
              } rounded-md border shadow-lg`}
            >
              <p
                className={`${
                  darkMode ? "text-yellow-200" : "text-gray-800"
                } italic text-lg`}
              >
                {roast}
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={`w-full text-center py-4 text-sm ${
          darkMode ? "text-gray-400" : "text-gray-500"
        } mt-auto`}
      >
        A GitHub roasting app made with love ❤️
      </div>
    </div>
  );
}
