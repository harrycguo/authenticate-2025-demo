"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Homepage = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/api/auth/status");
        const data = response.data;

        if (data.user) {
          router.push("/home");
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      }
    };

    checkAuthStatus();
  }, [router]);

  return null; // or a loading spinner
};

export default Homepage;
