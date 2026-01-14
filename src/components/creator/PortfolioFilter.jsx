import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

export default function PortfolioFilter({ courses, onFilterChange }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const categories = ["all", ...new Set(courses.map(c => c.category))];

  const handleFilter = () => {
    const filtered = courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                           c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "enrollments") return (b.total_enrollments || 0) - (a.total_enrollments || 0);
      if (sortBy === "reviews") return (b.reviews_count || 0) - (a.reviews_count || 0);
      return 0;
    });

    onFilterChange(sorted);
  };

  React.useEffect(() => {
    handleFilter();
  }, [search, selectedCategory, sortBy]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-slate-200">
      <div>
        <label className="text-sm font-semibold text-slate-900 block mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900 block mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900 block mb-2">Sort By</label>
        <div className="space-y-2">
          {[
            { value: "rating", label: "Highest Rating" },
            { value: "enrollments", label: "Most Enrollments" },
            { value: "reviews", label: "Most Reviews" }
          ].map(option => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={sortBy === option.value}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}