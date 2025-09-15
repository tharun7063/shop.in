import React, { useState, useEffect } from "react";
import useStore from "../store/useStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import useWishlist from "../hooks/useWishlist";

export default function ProductsPage() {
  const backend_url = useStore((state) => state.backend_url);
  const user = useStore((state) => state.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // use reusable wishlist hook
  const { wishlist, toggleWishlist } = useWishlist(backend_url, user);

  // Fetch products
  useEffect(() => {
    fetch(`${backend_url}/product`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [backend_url]);

  if (loading) return <p className="p-6">Loading products...</p>;
  if (error) return <p className="p-6">Error: {error}</p>;

  // Group products by subcategory
  const subcategories = {};
  products.forEach((product) => {
    const subCatName = product.category.name;
    if (!subcategories[subCatName]) subcategories[subCatName] = [];
    subcategories[subCatName].push(product);
  });

  return (
    <div className="p-6">
      {Object.keys(subcategories).map((subCatName) => (
        <div key={subCatName} className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{subCatName}</h2>
            <button className="bg-blue-500 text-white px-4 py-1 rounded">
              VIEW ALL
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {subcategories[subCatName].slice(0, 1).map((product) => (
              <div
                key={product.id}
                className="relative min-w-[200px] border rounded-lg p-3 shadow hover:shadow-lg transition"
              >
                {/* Wishlist Heart */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-2 right-2"
                >
                  <FontAwesomeIcon
                    icon={wishlist[product.id] ? faHeartSolid : faHeartRegular}
                    size="lg"
                    className={
                      wishlist[product.id]
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-400"
                    }
                  />
                </button>

                <img
                  src={
                    product.images?.find((img) => img.type === "image")?.url ||
                    "https://via.placeholder.com/150"
                  }
                  alt={product.name}
                  className="w-full h-40 object-cover mb-2 rounded"
                />
                <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                <p className="text-gray-600 text-xs mb-1">
                  Brand: {product.brand.name}
                </p>
                <p className="text-gray-800 font-semibold text-sm">
                  ₹{product.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
