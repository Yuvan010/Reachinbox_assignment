import React, { useEffect, useState } from "react";
import EmailCard from "../components/EmailCard";

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/emails");
      const data = await res.json();
      setEmails(data);
      setFilteredEmails(data);
    } catch (err) {
      console.error("❌ Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredEmails(emails);
    } else {
      const filtered = emails.filter(
        (e) => e.category && e.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredEmails(filtered);
    }
  };

  // Call backend RAG route to get suggested reply
  const handleSuggestReply = async (email) => {
    if (!email) return;
    setLoadingReply(true);
    setSuggestedReply("");
    try {
      const res = await fetch("http://localhost:5000/rag/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject, body: email.body }),
      });
      const data = await res.json();
      if (data.reply) setSuggestedReply(data.reply);
      else setSuggestedReply("No suitable reply found.");
    } catch (err) {
      console.error("❌ RAG suggestReply error:", err);
      setSuggestedReply("Error generating reply. Try again later.");
    } finally {
      setLoadingReply(false);
    }
  };

  const categories = [
    "All",
    "Interested",
    "Meeting Booked",
    "Not Interested",
    "Spam",
    "Out of Office",
    "Uncategorized",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
         Smart Email Onebox
      </h1>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => filterByCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Email Cards */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">Loading emails...</p>
      ) : filteredEmails.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmails.map((email) => (
            <EmailCard
              key={email.id || email._id}
              email={email}
              onReplyClick={handleSuggestReply}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          No emails in this category.
        </p>
      )}

      {/* AI Suggested Reply Box */}
      {suggestedReply && (
        <div className="fixed bottom-5 right-5 bg-white shadow-lg border rounded-xl p-4 w-96">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
             AI Suggested Reply
          </h3>
          <p className="text-gray-700 whitespace-pre-line">
            {loadingReply ? "Generating..." : suggestedReply}
          </p>
          <button
            onClick={() => setSuggestedReply("")}
            className="mt-3 text-sm text-indigo-600 hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
