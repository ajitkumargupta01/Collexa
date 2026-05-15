# Collexa: The Digital Blueprint for Campus Event Excellence 📟

---

## 📑 Table of Contents
1.  [**Introduction & Vision**](#-introduction--vision)
2.  [**The Problem Statement**](#-the-problem-statement)
3.  [**Core Modules**](#-core-modules)
    *   [QR Validation Engine](#qr-validation-engine)
    *   [College Admin Command Center](#college-admin-command-center)
    *   [Student Ticket Wallet](#student-ticket-wallet)
    *   [Vendor Bidding System](#vendor-bidding-system)
    *   [Sponsorship Ad Hub](#sponsorship-ad-hub)
4.  [**UI/UX Design Philosophy**](#-uiux-design-philosophy)
    *   [Glassmorphism](#glassmorphism)
    *   [Micro-Animations](#micro-animations)
    *   [HSL Design System](#hsl-design-system)
5.  [**Technical Stack Justification**](#-technical-stack-justification)
6.  [**Project File Structure**](#-project-file-structure)
7.  [**Database Schema Documentation**](#-database-schema-documentation)
8.  [**API Documentation (v1.0)**](#-api-documentation-v10)
9.  [**Validation Logic Flow**](#-validation-logic-flow)
10. [**Security & Data Integrity**](#-security--data-integrity)
11. [**Installation & Deployment**](#-installation--deployment)
12. [**Future Roadmap (v2.0)**](#-future-roadmap-v20)
13. [**FAQ & Troubleshooting**](#-faq--troubleshooting)
14. [**Contribution Guidelines**](#-contribution-guidelines)
15. [**License & Credits**](#-license--credits)

---

## 🌟 Introduction & Vision

**Collexa** is more than just a ticketing app; it is a full-scale digital ecosystem designed to transform the chaotic nature of campus events into a streamlined, high-fidelity professional experience. In the traditional college setting, event management is often handled through physical ticket booklets, manual spreadsheets, and scattered communication channels. This leads to fraud, slow entry lines, and lost data.

Collexa was born from the vision of **"Digital-First Campus Life."** We combined industrial-grade backend security with a world-class "Frosted Glass" user interface to ensure that every stakeholder—from the college dean to the first-year student—has a seamless and premium experience. Our goal is to set the standard for how educational institutions manage their internal and external engagements in the 21st century.

---

## 🚩 The Problem Statement

Why does Collexa exist? To solve the "Campus Event Chaos":
*   **Ticket Fraud**: Paper tickets are easy to forge and hard to verify instantly.
*   **Gate Congestion**: Manual logging of attendees causes massive bottlenecks at event entrances.
*   **Sponsorship Disconnect**: Brands struggle to get their logos in front of students effectively.
*   **Vendor Mismanagement**: Organizers waste time comparing scattered emails and WhatsApp messages for vendor quotes.
*   **Data Loss**: Once an event ends, the data is usually lost forever. Collexa preserves these insights for future planning.

---

## 🚀 Core Modules

### 1. QR Validation Engine
The most critical part of the system. It turns any mobile device into a professional-grade ticket validator.
*   **Headless Camera Core**: Built on the core `Html5Qrcode` library for maximum speed and control.
*   **Instant Result Cards**: Validations are displayed as vibrant, animated cards that appear in milliseconds.
*   **Zero-Hang Performance**: Precise lifecycle management ensures the camera hardware is released immediately when not in use.

### 2. College Admin Command Center
A high-complexity hub for event organizers.
*   **Event Orchestration**: Create events with custom pricing tiers, whitelist specific colleges, and set registration deadlines.
*   **Attendance Tracking**: A real-time counter that tells you exactly how many students have entered the gate.
*   **Financial Overview**: Monitor total ticket sales and sponsorship revenue in real-time.

### 3. Student Ticket Wallet
A mobile-first "Digital Pocket" for every student.
*   **Seamless Buying**: Purchase tickets in two clicks with automatic checks for "Free Pass" eligibility.
*   **Offline Access**: Tickets are designed to be easily accessible even in areas with poor campus Wi-Fi.
*   **Rich Event Feed**: Discover upcoming workshops, festivals, and sports meets with beautiful banner previews.

### 4. Vendor Bidding System
Digitizing the logistics of event planning.
*   **Itemized Quotes**: Vendors can submit detailed breakdowns of their services (e.g., Catering: 500 meals, Sound: 4000W system).
*   **Comparison Engine**: Organizers can accept or reject quotes with a single click, keeping all negotiations in one place.

### 5. Sponsorship Ad Hub
Bridging the gap between brands and the student body.
*   **Targeted Visibility**: Sponsorship ads are displayed directly on the student dashboard.
*   **Campaign Management**: Track which brands are sponsoring which events to ensure all contractual obligations are met.

---

## 🎨 UI/UX Design Philosophy

### Glassmorphism (Frosted Glass)
Collexa uses a "Layered Depth" design language. We achieve this through:
*   `backdrop-filter: blur(12px)`
*   Translucent backgrounds (`rgba(19, 19, 26, 0.8)`)
*   Subtle 1px borders to define shapes without using heavy outlines.
This makes the dashboard feel light and modern, even with high data density.

### Micro-Animations
We believe that motion is a form of communication:
*   **The Scanner Sweep**: A purple laser line moves across the camera feed to tell the user the scanner is active.
*   **The Slide-Up Transition**: Sections enter the screen with a gentle vertical motion to guide the user's focus.
*   **Pulse Indicators**: Success and Error messages "pulse" into view to ensure they aren't missed by busy gate staff.

### HSL Design System
Instead of hardcoded HEX values, we use **HSL (Hue, Saturation, Lightness)**. This allows for:
*   **Dynamic Theming**: Easily adjust the entire app's "vibe" by changing a few CSS variables.
*   **Glowing Accents**: By manipulating the "Lightness" value, we create buttons that look like they are glowing from within.

---

## 🛠️ Technical Stack Justification

| Technology | Why We Chose It |
| :--- | :--- |
| **React 18** | Virtual DOM ensures fast UI updates, essential for a real-time scanner. |
| **Node.js** | Non-blocking I/O allows the server to handle hundreds of scan requests simultaneously. |
| **Express** | Minimalist framework that gives us full control over our API architecture. |
| **MongoDB** | NoSQL flexibility allows us to store different data types for festivals vs. workshops. |
| **Mongoose** | Provides strict schema validation to ensure data integrity. |
| **Html5-QRCode** | The most reliable cross-browser library for web-based camera access. |
| **Vanilla CSS** | Maximum performance and pixel-perfect creative control without the overhead of frameworks. |

---

## 📂 Project File Structure

### 🧠 Backend (The Brain)
*   `server.js`: The entry point. Configures CORS, Middleware, and API Routes.
*   `config/db.js`: Handles the asynchronous connection to the MongoDB cluster.
*   `models/`:
    *   `User.js`: Defines roles (`student`, `college`, `vendor`) and auth data.
    *   `Event.js`: Stores the "Source of Truth" for every campus event.
    *   `Ticket.js`: Tracks the UUID, price, and usage status of every purchase.
*   `controllers/`:
    *   `auth.js`: Logic for registration, login, and JWT generation.
    *   `tickets.js`: The complex logic behind **QR Validation** and purchase flows.
*   `routes/`: Clean, semantic endpoints for all frontend requests.

### 🎨 Frontend (The Face)
*   `src/pages/`:
    *   `CollegeDashboard.jsx`: The 1,000+ line management powerhouse.
    *   `Dashboard.jsx`: The student-facing portal.
*   `src/components/`: Reusable "Atom" components (Buttons, Inputs, Cards).
*   `src/index.css`: The central design system and keyframe animations.

---

## 📊 Database Schema Documentation

### Ticket Schema
```JavaScript
{
  eventId: ObjectId,    // Link to the Event
  studentId: ObjectId,  // Link to the Student
  ticketCode: String,   // Unique UUID v4
  status: Enum,         // ['active', 'cancelled', 'used']
  isUsed: Boolean,      // Fast flag for scanner
  scannedAt: Date,      // Timestamp for security audit
  passType: String      // ['general', 'vip', 'earlyBird']
}
```

### Event Schema
```JavaScript
{
  title: String,
  date: Date,
  location: String,
  ticketPrice: Number,
  status: Enum,         // ['upcoming', 'ongoing', 'completed']
  allowedColleges: []    // Whitelist for entry
}
```

---

## 📡 API Documentation (v1.0)

### 🎫 Ticket Validation
*   **Endpoint**: `/api/tickets/validate`
*   **Method**: `POST`
*   **Payload**: `{ ticketCode: "uuid-string" }`
*   **Response (200 OK)**:
    ```json
    {
      "valid": true,
      "message": "Welcome!",
      "ticket": { "studentName": "John Doe", "eventTitle": "TechFest" }
    }
    ```

### 🔐 Authentication
*   **Endpoint**: `/api/auth/login`
*   **Method**: `POST`
*   **Payload**: `{ email, password }`
*   **Response**: JWT Token + User Object.

---

## ⚡ Validation Logic Flow

When a QR code is detected, the following 8-step sequence occurs:
1.  **Detection**: The library captures a QR frame and extracts the UUID string.
2.  **Request**: An async POST request is fired to the backend validator.
3.  **Discovery**: MongoDB searches for the ticket using an indexed `ticketCode` field.
4.  **Event Check**: The system verifies if the event is active or has been cancelled.
5.  **Time Check**: The current time is compared against the event date (allowing a 24h grace period).
6.  **Usage Check**: The `isUsed` flag is checked. If `true`, validation fails with a "Already Scanned" error.
7.  **Commit**: If all checks pass, `isUsed` is set to `true` and `scannedAt` is recorded.
8.  **Feedback**: The frontend receives the success signal and plays a "Success" animation.

---

## 🛡️ Security & Data Integrity

*   **UUID v4**: We use random 128-bit identifiers. It would take billions of years to guess a valid ticket code.
*   **JWT Protection**: All sensitive routes require a valid JSON Web Token.
*   **Index Optimization**: The `ticketCode` field is unique-indexed in MongoDB for O(1) search performance.
*   **Concurrency Control**: Using Mongoose's atomic updates to prevent "Double Scanning" if two people scan the same code simultaneously.

---

## 📦 Installation & Deployment

### Backend Setup
1.  Navigate to the `backend` folder.
2.  Install dependencies: `npm install.`
3.  Configure `.env`:
    *   `MONGO_URI`: Your MongoDB cluster string.
    *   `JWT_SECRET`: A long, random string.
4.  Start the server: `npm start`

### Frontend Setup
1.  Navigate to the `frontend` folder.
2.  Install dependencies: `npm install.`
3.  Start the development server: `npm run dev.`

---

## 🔮 Future Roadmap (v2.0)

1.  **AI Attendance Predictor**: Use machine learning to predict final turnout based on early ticket sales.
2.  **PDF Certificate Generator**: Automatically email "Certificate of Participation" after a successful scan.
3.  **Real-Time Map**: A heat-map showing where students are scanning in across large campus grounds.
4.  **Multi-Language Support**: Localization for international campuses.
5.  **Offline-First Sync**: Allowing the scanner to work without internet and sync once back online.

---

## ❓ FAQ & Troubleshooting

**Q: The camera won't open on my iPhone.**
A: Ensure you are using HTTPS (for production) or localhost (for development), as browsers block camera access on non-secure connections.

**Q: Can I scan a ticket from a screenshot?**
A: Yes! As long as the QR code is clear and the brightness is high, the engine will detect it.

**Q: What happens if I delete an event?**
A: All associated tickets will be marked as invalid during the "Event Check" phase of validation.

---

## 🤝 Contribution Guidelines

We welcome contributions from the community!
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License & Credits

*   **License**: MIT License - Free to use for personal and commercial projects.
*   **Authors**: Built with passion by the Collexa Development Team.
*   **Special Thanks**: To the `html5-qrcode` contributors for their amazing scanning library.

---
*Built to power the next generation of campus events.*
*Documentation Version: 1.5.0*
*Last Updated: 2026-05-15*

---

### Appendix A: Color Tokens (HSL)
- Primary: `262 78% 58%`
- Secondary: `190 80% 50%`
- Background: `240 10% 4%`
- Success: `142 70% 45%`
- Error: `0 84% 60%.`

### Appendix B: Scan Logic Tree
1. Start -> Scan QR -> Extract Code
2. Is Code a Valid UUID? (No -> Error "Format Invalid")
3. Does Code Exist in DB? (No -> Error "Not Found")
4. Is Event Active? (No -> Error "Cancelled")
5. Is the ticket already used? (Yes -> Error "Already Scanned")
6. Is Event Today/Future? (No -> Error "Expired")
7. Update DB (Set isUsed: true)
8. Return Success -> Show Student Name -> End.

---
*Thank you for exploring Collexa!*
*Total Lines of Project Documentation: ~500*
