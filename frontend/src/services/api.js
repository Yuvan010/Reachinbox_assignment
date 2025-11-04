import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const fetchEmails = async () => {
  try {
    const res = await API.get("/emails");
    return res.data;
  } catch (err) {
    console.error("Error fetching emails:", err);
    return [];
  }
};
