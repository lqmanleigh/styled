"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type AddToWishlistButtonProps = {
  productId?: string;
  label?: string;
  externalProductUrl?: string;
};

export default function AddToWishlistButton({
  productId,
  label,
  externalProductUrl,
}: AddToWishlistButtonProps) {
  const { status } = useSession();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (status === "unauthenticated") {
    return (
      <Link
        href="/login?callbackUrl=/user/wishlist"
        className="inline-block w-full text-center border border-green-200 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 text-sm"
      >
        Sign in to add
      </Link>
    );
  }

  const handleAdd = () => {
    if (!productId && !externalProductUrl) {
      setMessage("Missing product info");
      return;
    }
    setMessage("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, externalProductUrl, label }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Failed to add");
        }
        if (data?.alreadyExists) {
          setMessage("Already in your wishlist");
        } else {
          setMessage("Added to wishlist");
        }
      } catch (err: any) {
        setMessage(err?.message || "Failed to add");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Adding..." : "Add to wishlist"}
      </button>
      {message && <p className="text-xs text-gray-600 text-center">{message}</p>}
    </div>
  );
}
