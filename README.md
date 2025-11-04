# 📧 AI-Powered Email Categorization System

This project is a full-stack application that automatically **fetches, classifies, and displays incoming emails** using a **locally running AI model**.  
It also integrates **Slack notifications**, **Docker services**, and a clean frontend dashboard for viewing categorized emails.

---

## 🧠 Overview

The goal of this project was to build an end-to-end email management system that can automatically sort emails into meaningful categories like:

- Interested  
- Meeting Booked  
- Not Interested  
- Spam  
- Out of Office  

The AI runs locally via **Ollama**, so it doesn’t depend on any external APIs.  
The backend handles email fetching, categorization, and saving to MySQL, while the frontend shows all categorized emails neatly with filters and suggested replies.

---

## ⚙️ Tech Stack

| Layer | Tools / Libraries |
|-------|-------------------|
| **Frontend** | React + TypeScript + Axios |
| **Backend** | Node.js + Express + TypeScript |
| **AI Service** | Ollama (TinyLlama / Llama3 model) |
| **Database** | MySQL |
| **Search** | Elasticsearch |
| **Notifications** | Slack Webhooks |
| **Containerization** | Docker + Docker Compose |

---

## 🏗️ Project Structure

📦 email-onebox
┣ 📂 backend/
┃ ┣ 📜 src/
┃ ┣ 📜 aiservice.ts ← Handles AI categorization via Ollama
┃ ┣ 📜 index.ts ← Entry point for backend server
┃ ┗ 📜 db.ts ← MySQL connection setup
┣ 📂 frontend/
┃ ┣ 📜 src/
┃ ┣ 📜 components/
┃ ┣ 📜 App.tsx
┃ ┗ 📜 app.css
┣ 📜 docker-compose.yml
┣ 📜 .env
┗ 📜 README.md


---

## 🚀 How It Works

1. **Email Fetching**  
   The backend connects to Gmail using IMAP credentials and retrieves new emails’ subject and body text.

2. **AI Categorization**  
   Each email is sent to **Ollama’s local model (TinyLlama)** with a clear classification prompt.  
   The model decides one of five categories and returns the label.

3. **Storage in MySQL**  
   All emails and their categories are stored for quick access and search.

4. **Frontend Display**  
   The React frontend displays emails in a grid format, with a centralized **category filter bar**, colored tags, and suggested AI replies.

5. **Slack Notifications**  
   The backend sends a message to a Slack channel when a new email arrives or gets categorized — keeping the team updated in real time.

---

## 🧩 Frontend Features

- Responsive and minimal UI  
- Centralized category filter bar  
- Colored gradient tags for categories  
- AI-suggested replies for quick response  
- Smooth animations and hover effects  

---

## 🧠 AI Categorization Logic

The categorization is handled in **`aiservice.ts`** using the Ollama local API:

- Model used: `tinyllama` (can be swapped with `llama3` for better accuracy)
- Temperature: `0.1` (for consistent results)
- Predict length: `10`
- If the AI can’t match any keyword → defaults to “Uncategorized”

You can tweak the prompt or use a more detailed model to improve accuracy, especially for **Spam**, **Not Interested**, and **Out of Office** detection.

---

## 🐳 Docker Setup

This project is containerized using **Docker Compose** for easy deployment.

To start all services:
```bash
docker-compose up --build

This will launch:

backend (Node + Express API)

mysql (Database)

es-onebox (Elasticsearch)

ollama (Local AI model)

To stop containers:

docker-compose down


To check running containers:

docker ps

💬 Slack Integration

Slack is integrated using the Slack SDK with a bot token and channel ID.
Whenever a new categorized email is detected, a short message like the one below is posted:

📩 New Email categorized as Meeting Booked from john.doe@example.com

This helps maintain visibility without needing to open the dashboard.

🔐 Environment Variables

The app uses a .env file for sensitive configurations:

PORT=5000

# Gmail IMAP credentials
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# API Keys & Tokens
GROQ_API_KEY=your_groq_key
SLACK_TOKEN=your_slack_token
SLACK_CHANNEL=your_channel_id

# Elasticsearch
ELASTIC_URL=http://localhost:9200

📊 Elasticsearch

Elasticsearch is used for storing and searching emails efficiently.
The backend connects automatically via the ELASTIC_URL defined in the .env file.

If Elasticsearch fails to start (e.g., port 9200 already in use), you can stop existing containers using:

docker stop $(docker ps -q)


and then rerun the stack.

🧠 Key Learnings

Through this project I learned how to:

Integrate local AI inference (Ollama) with a live application

Handle IMAP email fetching in Node.js

Use Slack APIs for real-time notifications

Run multiple services using Docker Compose

Design a simple and responsive React UI

Work with MySQL + Elasticsearch in a microservice-style setup

👨‍💻 Author

Developed by Yuvan Gowtham
