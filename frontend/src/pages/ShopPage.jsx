// src/pages/ShopPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/axios";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Search & Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);

  // Smart Search States
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [didYouMean, setDidYouMean] = useState(null);
  const [isGibberish, setIsGibberish] = useState(false);

  const [pagination, setPagination] = useState({});
  const categories = [
    "all",
    "Mobiles",
    "Electronics",
    "Men",
    "Women",
    "Beauty",
    "Appliances",
  ];

  const searchRef = useRef(null);

  // 1. Sync URL to State (Triggers when Navbar search submits)
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null) {
      setSearch(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  // 2. Fetch Suggestions as user types in the sidebar
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await API.get(`/products/suggestions?q=${search}`);
        setSuggestions(res.data.data || []);
      } catch (err) {
        console.error("Suggestion error:", err.message);
      }
    };
    const timer = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // 3. Fetch Main Products Grid
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category !== "all") params.append("category", category);
        if (priceRange.min) params.append("minPrice", priceRange.min);
        if (priceRange.max) params.append("maxPrice", priceRange.max);
        if (sort) params.append("sort", sort);
        params.append("page", page);
        params.append("limit", 12);

        const res = await API.get(`/products?${params.toString()}`);
        const data = res.data.data;

        setProducts(data.products || []);
        setPagination(data.pagination || {});
        setDidYouMean(data.didYouMean || null);
        setIsGibberish(data.isGibberishFallback || false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [search, category, priceRange, sort, page]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      setPage(1);
      setCategory(category); // dummy trigger
    }
  };

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (updater) => {
    setPage(1);
    updater();
  };

  const handleSuggestionClick = (title) => {
    setSearch(title);
    setShowSuggestions(false);
    setPage(1);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.layout}>
        {/* LEFT SIDEBAR: FILTERS */}
        <div style={styles.sidebar}>
          <h3 style={styles.filterHeading}>Filters</h3>

          {/* SEARCH BOX WITH SUGGESTIONS */}
          <div style={styles.filterSection} ref={searchRef}>
            <label style={styles.label}>Search</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search products... (Press Enter)"
                value={search}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
                style={styles.input}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={styles.suggestionsDropdown}>
                  {suggestions.map((sug) => (
                    <div
                      key={sug._id}
                      onClick={() => handleSuggestionClick(sug.title)}
                      style={styles.suggestionItem}
                    >
                      🔍 {sug.title.substring(0, 35)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.filterSection}>
            <label style={styles.label}>Category</label>
            <div style={styles.categoryList}>
              {categories.map((cat) => (
                <label key={cat} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="category"
                    checked={category.toLowerCase() === cat.toLowerCase()}
                    onChange={() => handleFilterChange(() => setCategory(cat))}
                    style={{ accentColor: "#fb641b" }}
                  />
                  <span style={{ textTransform: "capitalize" }}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={styles.filterSection}>
            <label style={styles.label}>Price Range</label>
            <div style={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  handleFilterChange(() =>
                    setPriceRange({ ...priceRange, min: e.target.value }),
                  )
                }
                style={styles.priceInput}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  handleFilterChange(() =>
                    setPriceRange({ ...priceRange, max: e.target.value }),
                  )
                }
                style={styles.priceInput}
              />
            </div>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setCategory("all");
              setPriceRange({ min: "", max: "" });
              setSort("createdAt");
              setPage(1);
            }}
            style={styles.clearBtn}
          >
            Clear All Filters
          </button>
        </div>

        {/* RIGHT SIDE: PRODUCT GRID */}
        <div style={styles.mainContent}>
          {/* SMART SEARCH BANNERS */}
          {didYouMean && (
            <div style={styles.didYouMeanBanner}>
              Did you mean to search for:{" "}
              <strong
                style={{
                  cursor: "pointer",
                  color: "#2563eb",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setSearch(didYouMean);
                  setPage(1);
                }}
              >
                {didYouMean}
              </strong>
              ?
            </div>
          )}

          {isGibberish && (
            <div style={styles.gibberishBanner}>
              🤷 We couldn't find anything matching "<strong>{search}</strong>".
              But hey, here are some snacks to cheer you up! 🍫
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={styles.noResults}>
              <h3>No products matched your filters.</h3>
              <p>Try adjusting your search, price range, or category.</p>
            </div>
          ) : (
            <div style={styles.productGrid}>
              {products.map((product) => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  style={styles.productCard}
                >
                  <div style={styles.imageContainer}>
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.imageFallback}>
                        {product.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={styles.productInfo}>
                    <h4 style={styles.productTitle}>{product.title}</h4>
                    <div style={styles.productMeta}>
                      <span style={styles.productPrice}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: "#f1f3f6",
    minHeight: "calc(100vh - 70px)",
    padding: "20px",
    fontFamily: "'Inter', sans-serif",
  },
  layout: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "24px",
    alignItems: "start",
  },
  sidebar: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    position: "sticky",
    top: "20px",
  },
  filterHeading: {
    fontSize: "1.2rem",
    fontWeight: "700",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid #eaeaec",
    color: "#0f172a",
  },
  filterSection: { marginBottom: "24px" },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    outline: "none",
  },
  suggestionsDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "0 0 6px 6px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    zIndex: 999,
    maxHeight: "250px",
    overflowY: "auto",
  },
  suggestionItem: {
    padding: "12px",
    fontSize: "0.9rem",
    color: "#334155",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  categoryList: { display: "flex", flexDirection: "column", gap: "12px" },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    color: "#475569",
    cursor: "pointer",
  },
  priceInputs: { display: "flex", alignItems: "center", gap: "8px" },
  priceInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "0.95rem",
    outline: "none",
  },
  clearBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },
  mainContent: { width: "100%" },
  didYouMeanBanner: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "1.05rem",
  },
  gibberishBanner: {
    backgroundColor: "#fdf4ff",
    border: "1px solid #f5d0fe",
    color: "#701a75",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "1.05rem",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  imageContainer: {
    height: "220px",
    backgroundColor: "#f8fafc",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    mixBlendMode: "multiply",
  },
  imageFallback: { fontSize: "3rem", color: "#cbd5e1", fontWeight: "bold" },
  productInfo: {
    padding: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  productTitle: {
    margin: "0 0 12px 0",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: "1.4",
  },
  productMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: { fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" },
  noResults: {
    backgroundColor: "#fff",
    padding: "60px",
    textAlign: "center",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};
