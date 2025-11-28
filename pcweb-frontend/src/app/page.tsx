"use client";

import React, { useEffect, useState } from "react";

type Part = {
  id: number;
  name: string;
  category: string;
  price: number;
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  margin: 0,
  padding: "32px 16px",

  backgroundColor: "#050114",

  backgroundImage:
    "radial-gradient(circle at 10% 0%, rgba(255, 65, 180, 0.55) 0, transparent 60%)," +
    "radial-gradient(circle at 90% 0%, rgba(60, 120, 255, 0.55) 0, transparent 60%)," +
    "radial-gradient(circle at 50% 100%, rgba(155, 70, 255, 0.50) 0, transparent 65%)",

  backgroundAttachment: "fixed",

  color: "#f5f5ff",
  fontFamily:
    "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};



const layoutStyle: React.CSSProperties = {
  maxWidth: "1120px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "16px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "0.04em",
};

const subTitleStyle: React.CSSProperties = {
  fontSize: "13px",
  opacity: 0.7,
  marginTop: "4px",
};

const glowAccent: React.CSSProperties = {
  color: "#8a7bff",
  textShadow: "0 0 8px rgba(140, 120, 255, 0.9)",
};

const controlBarStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "18px",
};

const inputBase: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(8, 8, 24, 0.85)",
  color: "#f5f5ff",
  outline: "none",
  fontSize: "14px",
  boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
};

const searchInputStyle: React.CSSProperties = {
  ...inputBase,
  minWidth: "260px",
  flex: "1 1 260px",
};

const selectStyle: React.CSSProperties = {
  ...inputBase,
  minWidth: "160px",
};

const cardsRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 2.1fr) minmax(0, 1.4fr)",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(13, 13, 40, 0.92), rgba(9, 9, 28, 0.96))",
  borderRadius: "18px",
  border: "1px solid rgba(159, 140, 255, 0.35)",
  boxShadow:
    "0 18px 45px rgba(2, 0, 40, 0.95), 0 0 18px rgba(120, 90, 255, 0.45)",
  padding: "16px 18px",
  backdropFilter: "blur(12px)",
};

const cardTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  marginBottom: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const badgeStyle: React.CSSProperties = {
  fontSize: "12px",
  padding: "2px 8px",
  borderRadius: "999px",
  background: "rgba(120, 90, 255, 0.22)",
  border: "1px solid rgba(173, 152, 255, 0.7)",
};

const partListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  maxHeight: "380px",
  overflowY: "auto",
};

const partItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 10px",
  borderRadius: "10px",
  marginBottom: "6px",
  background: "rgba(10, 10, 32, 0.75)",
  border: "1px solid transparent",
};

const partItemSelected: React.CSSProperties = {
  ...partItemStyle,
  border: "1px solid rgba(144, 214, 255, 0.8)",
  boxShadow: "0 0 10px rgba(144, 214, 255, 0.6)",
};

const checkboxStyle: React.CSSProperties = {
  width: "16px",
  height: "16px",
};

const partNameStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
};

const partMetaStyle: React.CSSProperties = {
  fontSize: "12px",
  opacity: 0.72,
};

const priceTextStyle: React.CSSProperties = {
  marginLeft: "auto",
  fontSize: "13px",
  fontWeight: 600,
  color: "#9fe8ff",
};

const selectedListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "6px 0 10px 0",
};

const totalBlockStyle: React.CSSProperties = {
  marginTop: "10px",
  paddingTop: "10px",
  borderTop: "1px dashed rgba(255,255,255,0.18)",
  display: "flex",
  justifyContent: "space-between",
  fontWeight: 700,
  fontSize: "16px",
};

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜尋 + 分類
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  // 已選組件
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 取得組件資料
  useEffect(() => {
    async function loadParts() {
      try {
        const res = await fetch("http://localhost:5261/api/store/parts");
        if (!res.ok) {
          throw new Error("無法取得組件資料");
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

  // 依照搜尋 + 分類做過濾
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

  // 勾選 / 取消勾選
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 已選的組件 + 總價
  const selectedParts = parts.filter((p) => selectedIds.includes(p.id));
  const totalPrice = selectedParts.reduce((sum, p) => sum + p.price, 0);

  if (loading) return <div style={pageStyle}>載入中...</div>;
  if (error) return <div style={{ ...pageStyle, color: "salmon" }}>{error}</div>;

  return (
    <div style={pageStyle}>
      <div style={layoutStyle}>
        {/* 標題區 */}
        <header style={headerStyle}>
          <div style={titleStyle}>
            PC Builder 
          </div>
          <div style={subTitleStyle}>
            勾選你需要的組件，右側會即時幫你算總價。
          </div>
        </header>

        {/* 搜尋 + 分類 */}
        <div style={controlBarStyle}>
          <input
            type="text"
            placeholder="搜尋零件名稱或分類..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={selectStyle}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 兩欄 */}
        <div style={cardsRowStyle}>
          {/* 左：零件列表 */}
          <section style={cardStyle}>
            <div style={cardTitle}>
              <span>零件列表</span>
              <span style={badgeStyle}>
                共 {filteredParts.length} 項
              </span>
            </div>

            <ul style={partListStyle}>
              {filteredParts.length === 0 && (
                <li style={{ fontSize: "14px", opacity: 0.7 }}>
                  目前沒有符合條件的零件
                </li>
              )}

              {filteredParts.map((p) => {
                const isChecked = selectedIds.includes(p.id);
                return (
                  <li
                    key={p.id}
                    style={isChecked ? partItemSelected : partItemStyle}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(p.id)}
                      style={checkboxStyle}
                    />
                    <div>
                      <div style={partNameStyle}>{p.name}</div>
                      <div style={partMetaStyle}>{p.category}</div>
                    </div>
                    <div style={priceTextStyle}>${p.price}</div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* 右：已選擇零件 */}
          <section style={cardStyle}>
            <div style={cardTitle}>
              <span>已選擇的零件</span>
              <span style={badgeStyle}>
                {selectedParts.length} 件
              </span>
            </div>

            {selectedParts.length === 0 ? (
              <p style={{ fontSize: "14px", opacity: 0.7 }}>
                尚未選擇任何零件，從左側清單開始勾選
              </p>
            ) : (
              <>
                <ul style={selectedListStyle}>
                  {selectedParts.map((p) => (
                    <li
                      key={p.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      <span>
                        {p.name}{" "}
                        <span style={{ opacity: 0.6 }}>({p.category})</span>
                      </span>
                      <span style={{ color: "#9fe8ff" }}>${p.price}</span>
                    </li>
                  ))}
                </ul>

                <div style={totalBlockStyle}>
                  <span>總價</span>
                  <span style={{ color: "#ffde7a" }}>${totalPrice}</span>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
