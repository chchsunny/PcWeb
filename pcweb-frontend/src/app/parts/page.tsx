"use client";

import React, { useEffect, useState } from "react";

type Part = {
  id: number;
  name: string;
  category: string;
  price: number;
};

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜尋和分類
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  // 已選零件
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 取得零件資料
  useEffect(() => {
    async function loadParts() {
      try {
        const res = await fetch("http://localhost:5261/api/store/parts");
        if (!res.ok) {
          throw new Error("無法取得零件資料");
        }
        const data = await res.json();
        setParts(data);
      } catch (err: any) {
        setError(err.message ?? "發生錯誤");
      } finally {
        setLoading(false);
      }
    }

    loadParts();
  }, []);

  // 從所有零件算出分類列表
  const categories = ["全部", ...Array.from(new Set(parts.map((p) => p.category)))];

  // 依照搜尋和分類做過濾
  const filteredParts = parts.filter((p) => {
    const matchCategory =
      selectedCategory === "全部" || p.category === selectedCategory;

    const keyword = searchTerm.trim().toLowerCase();
    const matchSearch =
      keyword === "" ||
      p.name.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword);

    return matchCategory && matchSearch;
  });

  // 勾選
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 已選的零件總價
  const selectedParts = parts.filter((p) => selectedIds.includes(p.id));
  const totalPrice = selectedParts.reduce((sum, p) => sum + p.price, 0);

  if (loading) return <div style={{ padding: 20 }}>載入中...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>零件列表</h1>

      {/* 搜尋和分類 */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
        <input
          type="text"
          placeholder="搜尋零件名稱或分類..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "4px 8px", minWidth: "240px" }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: "4px 8px" }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 零件勾選列表 */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filteredParts.length === 0 && <li>目前沒有符合條件的零件</li>}

        {filteredParts.map((p) => (
          <li key={p.id} style={{ marginBottom: "8px" }}>
            <label>
              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => toggleSelect(p.id)}
                style={{ marginRight: "8px" }}
              />
              {p.name} ({p.category}) - ${p.price}
            </label>
          </li>
        ))}
      </ul>

      <hr style={{ margin: "24px 0" }} />

      {/* 已選擇零件總價 */}
      <h2>已選擇的零件</h2>
      {selectedParts.length === 0 ? (
        <p>尚未選擇任何零件</p>
      ) : (
        <>
          <ul>
            {selectedParts.map((p) => (
              <li key={p.id}>
                {p.name} ({p.category}) - ${p.price}
              </li>
            ))}
          </ul>
          <h3>總價：${totalPrice}</h3>
        </>
      )}
    </div>
  );
}
