import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function EmailCard({ email }) {
  const [showReply, setShowReply] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuggestReply = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/rag/suggest-reply", {
        subject: email.subject,
        body: email.body,
      });
      setSuggestedReply(res.data.reply || "No suggestion available.");
      setShowReply(true);
    } catch (err) {
      console.error("Error generating reply:", err);
      setSuggestedReply("Failed to generate reply. Try again later.");
      setShowReply(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="email-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="email-header">
        <h3>{email.subject || "No Subject"}</h3>
        <span className={`tag ${email.category.toLowerCase().replace(" ", "-")}`}>
          {email.category}
        </span>
      </div>

      <p className="email-from">📧 {email.from}</p>
      <p className="email-body">
        {email.body?.slice(0, 200)}{email.body?.length > 200 ? "..." : ""}
      </p>

      <div className="email-actions">
        <button
          className="reply-btn"
          onClick={handleSuggestReply}
          disabled={loading}
        >
          {loading ? "⏳ Generating..." : " Suggest AI Reply"}
        </button>
      </div>

      {showReply && (
        <motion.div
          className="ai-reply-box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4> Suggested Reply</h4>
          <p>{suggestedReply}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default EmailCard;
