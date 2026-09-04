import axios from "axios";
import { toast } from "react-hot-toast";



const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Assume expired if there's an error
  }
};

const jwtRequired = axios.create({
  baseURL: "https://api.tathva.org",
});

jwtRequired.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("jwt");
      toast.error("Session expired. Please login again.");

      // 2. USE window.location to redirect.
      // This forces a full page reload to the homepage.
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }

      return Promise.reject(new Error("Session expired"));
    }

    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default jwtRequired;