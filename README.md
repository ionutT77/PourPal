# 🍻 PourPal

**PourPal** is a social web application designed to help adults (18+) make platonic friends through local, casual group events called **Hangouts**.  
Whether you're looking to meet new people at a bar, pub, or coffee shop — PourPal connects users in a fun, friendly, and safe way.

---

## 👥 Team
- **Toma Ionut-Adrian**  
- **Shehab Abedalrahman**

---

## 🧩 General Description
PourPal helps users connect by creating and joining casual group-based social events at local venues.  
Users can easily browse upcoming Hangouts, join events that match their vibe, and chat with participants before meeting up in person.

---

## 🔐 Registration
- New users register for a **single "User" account**.  
- Registration requires:
  - Unique email address  
  - Password  
  - First name  
  - Confirmation that the user is **18 years or older**

---

## 👤 Profile & Hangout Creation
After logging in, users can:
- Manage their **profile** (first name, profile picture, and short bio like “My Vibe”).  
- **Create Hangouts** with:
  - Title  
  - Venue/Location (via a location search API)  
  - Date & Time  
  - Maximum group size (e.g., 2–5 people)  
  - Description  

The creator is automatically added as the first participant.

💡 There may also be a section that lists local bars partnered with PourPal, offering discounts for users who come through the app.

---

## 🎉 Browsing & Joining Hangouts
Logged-in users can:
- View **all upcoming Hangouts**, filterable by:
  - **Soonest**
  - **Nearest**
- View full Hangout details (description + list of participants)
- **Join** or **leave** a Hangout (if not full)
- Access a **temporary group-only chat** for coordination  
  (e.g., “See you at 7!”, “Running 5 mins late”)
- View a list of **My Hangouts** (separated into *Upcoming* and *Past*)
- **Add other users as friends/connections**
- **Comment** on participants’ profiles after events

Additional features:
- **Report button** for suspicious accounts  
- **Privacy Policy** for data safety  
- **Age verification system** (functional prototype planned)

---

## 🛠️ Technical Approach

### Frontend (React.js)
The frontend will be built as a **Single-Page Application (SPA)** using React.js.

**Key Technologies:**
- **React Router** for navigation (`/login`, `/hangouts`, `/hangouts/123`)
- **Axios / Fetch API** for backend communication
- **Reusable React components** for forms, lists, chat, and profiles
- **Node.js** environment for development and dependency management

---

### Backend (Django)
The backend will use the **Django REST Framework (DRF)** to provide robust API endpoints and handle application logic.

**Key Technologies:**
- **Django** for user authentication and registration (using httpOnly cookies)
- **CRUD API endpoints** for Hangouts, Profiles, and Chat
- **Real-time chat** with **Django Channels**
- **Admin panel** for moderation (reports, banning users)
- **PostgreSQL** as the main database

---

## 🚀 Future Improvements
- Implement complete **age verification system**
- Add **venue discovery** and **discount partnership** functionality
- Improve **user reputation and feedback system**

---

## 📄 License
This project is developed for educational purposes at the **Faculty of Automation and Computers**.

---

## 💬 Contact
If you have suggestions or want to contribute, feel free to open an issue or submit a pull request!
