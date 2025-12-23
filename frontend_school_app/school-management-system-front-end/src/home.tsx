import { useEffect } from "react";
//import { Link } from "react-router";

export default function Home() {
  useEffect(() => {
    fetch("http://localhost:3400/health")
      .then((res) => res.json())
      .then((data) => console.log("BACKEND SAYS:", data));
  }, []);

  return <h1>Check console</h1>;
  
}
