import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // required to send and receive HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});
