import { Link } from "react-router";

export default function About() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>About Us</h1>
      <p>This project is a School Management System built with React Router v7 and Vite.</p>
      <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
        Back to Home
      </Link>
    </div>
  );
}
