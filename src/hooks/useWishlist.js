// hooks/useWishlist.js
import { useState } from "react";

export default function useWishlist(backend_url, user) {
  const [wishlist, setWishlist] = useState({}); // productId -> uid

  // Add product to wishlist
  const addToWishlist = async (product) => {
    const body = {
      user_id: user.id,
      product_id: product.id,
      variant_id: product.variants?.[0]?.id || null,
    };

    const res = await fetch(`${backend_url}/wishlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to add to wishlist");
    const data = await res.json();

    setWishlist((prev) => ({ ...prev, [product.id]: data.uid }));
    return data;
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!wishlist[productId]) return;

    const res = await fetch(`${backend_url}/wishlist/${wishlist[productId]}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to remove from wishlist");

    setWishlist((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // Toggle product in wishlist
  const toggleWishlist = async (product) => {
    if (wishlist[product.id]) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };
}
