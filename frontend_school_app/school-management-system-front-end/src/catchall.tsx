import { Link } from "react-router";

export default function NotFound() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1 style={{ color: "red" }}>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
        Go back Home
      </Link>
    </div>
  );
}