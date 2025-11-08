"use client";
import Layout from "../components/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <h1 className="text-4xl font-bold text-green-700 mb-6">About Style’d</h1>
      <p className="max-w-3xl text-lg leading-relaxed">
        Style’d is a fashion recommendation platform that brings together data from
        multiple online stores. We help you discover new looks, explore popular
        products, and shop smart using contextual insights.
      </p>

      <p className="mt-6 text-gray-700">
        From trending streetwear to classy formal styles, our goal is to make
        fashion discovery effortless and inspiring.
      </p>
    </Layout>
  );
}
