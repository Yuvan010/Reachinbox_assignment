import React from "react";

const categories = ["All", "Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office"];

function CategoryFilter({ onFilter, active }) {
  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilter(cat)}
          className={active === cat ? "active" : ""}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
