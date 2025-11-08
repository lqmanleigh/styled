"use client";
import Layout from "../components/Layout";

export default function BlogPage() {
  const posts = [
    {
      title: "Top 10 Streetwear Trends 2025",
      excerpt: "Discover the hottest looks dominating this season.",
    },
    {
      title: "How to Style Oversized Outfits",
      excerpt: "Learn how to make comfort look effortlessly cool.",
    },
    {
      title: "Sustainable Fashion Movement",
      excerpt: "Go green with style — eco-conscious picks to try.",
    },
  ];

  return (
    <Layout>
      <h1 className="text-4xl font-bold text-green-700 mb-8">Style’d Blog</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <button className="text-green-600 font-medium hover:underline">
              Read More →
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
