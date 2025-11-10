"use client";
import { useSession } from "next-auth/react";
import Layout from "../../components/Layout";

export default function UserContactPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null; // Middleware handles redirect

  return (
    <Layout>
      <h1>User Contact Page</h1>
      <p>Hello, {session?.user?.name}</p>
    </Layout>
  );
}
