import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="bg-[#222a2d] rounded-xl p-6 shadow-lg">
      <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-4" />
      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
      <div className="text-gray-400 mb-2">{product.description}</div>
      <div className="font-bold text-[#38b6ff] mb-2">${product.price.toFixed(2)}</div>
      <div className="text-xs text-gray-500">Tags: {product.tags}</div>
    </div>
  );
}