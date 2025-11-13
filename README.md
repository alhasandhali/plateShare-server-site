# PlateShare Server — Backend API for the Community Food Donation Platform

The **PlateShare Server** is the backend system powering the **[PlateShare Web App](https://plateshare-ahd.netlify.app/)** — a community platform that connects food donors with those in need. It provides a secure RESTful API for managing users, foods, and food requests using **Node.js**, **Express**, **MongoDB**, and **Firebase Authentication**.

---

## Key Features

- **Firebase Authentication Integration**  
  Uses Firebase Admin SDK to verify ID tokens and protect private routes (Add, Update, Delete, and Request operations).

- **Food Management (CRUD Operations)**  
  Full Create, Read, Update, Delete functionality for foods — including dynamic filtering by donor email, food status, or quantity.

- **Food Request System**  
  Handles food requests between users, allowing donors to approve or reject requests securely with status updates.

- **User Management**  
  Supports user registration, retrieval by ID or email, and stores additional metadata in a dedicated MongoDB collection.

- **Secure API Architecture**  
  Implements middleware for token verification, environment variables for credentials, and follows RESTful API best practices.

- **Modular & Scalable Design**  
  Built with the MERN stack approach — this backend can easily integrate with any modern frontend (React, Angular, Vue, etc.).

---

## Technologies Used

| Category            | Technologies       |
| ------------------- | ------------------ |
| Runtime Environment | Node.js            |
| Framework           | Express.js         |
| Database            | MongoDB (Atlas)    |
| Authentication      | Firebase Admin SDK |
| Environment Config  | dotenv             |
| API Middleware      | CORS, JSON parsing |

---

## Folder Structure

```
plateshare-server-site/
├── .env # Environment variables (DB, Firebase keys)
├── index.js # Main server entry point
├── package.json # Dependencies and scripts
├── README.md # Project documentation
├── encode.js # Key converter
├── firebase-admin-sdk.json
└── node_modules/ # Installed packages
```

---

## Environment Variables

Your `.env` file should include the following:

```
PORT=3000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
FIREBASE_SERVICE_KEY=your_encoded_firebase_admin_key_base64
```

> The `FIREBASE_SERVICE_KEY` is stored in base64 format for secure decoding within the app.

---

## API Endpoints Overview

### User Routes

| Method | Endpoint             | Description       | Protected |
| ------ | -------------------- | ----------------- | --------- |
| GET    | `/users`             | Get all users     | ✅ Yes    |
| GET    | `/user/:id`          | Get user by ID    | ❌ No     |
| GET    | `/user/email/:email` | Get user by email | ❌ No     |
| POST   | `/user`              | Create new user   | ❌ No     |

---

### Food Routes

| Method | Endpoint          | Description                                    | Protected |
| ------ | ----------------- | ---------------------------------------------- | --------- |
| GET    | `/foods`          | Get all foods (with query filters)             | ❌ No     |
| GET    | `/featured-foods` | Get top 6 available foods (sorted by quantity) | ❌ No     |
| GET    | `/food/:id`       | Get single food details                        | ✅ Yes    |
| POST   | `/food`           | Add a new food item                            | ✅ Yes    |
| PATCH  | `/food/:id`       | Update or change food status                   | ✅ Yes    |
| DELETE | `/food/:id`       | Delete a food item                             | ✅ Yes    |

---

### Food Request Routes

| Method | Endpoint              | Description                                | Protected |
| ------ | --------------------- | ------------------------------------------ | --------- |
| GET    | `/requested-foods`    | Get all food requests (by user or food ID) | ✅ Yes    |
| POST   | `/requested-food`     | Submit a new food request                  | ✅ Yes    |
| PATCH  | `/requested-food/:id` | Update request status (Accepted/Rejected)  | ✅ Yes    |

---

## Middleware Used

- **CORS** – Enables cross-origin requests for frontend communication.
- **express.json()** – Parses incoming JSON requests.
- **verifyFirebaseToken** – Custom middleware to authenticate users using Firebase ID Tokens.

---

## How to Run Locally

1. **Clone this repository**

   ```bash
   git clone https://github.com/yourusername/plateshare-server.git
   cd plateshare-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file (see section above).

4. **Run the server**

   ```bash
   nodemon index.js
   ```

5. **Server will start at:**

   ```bash
   http://localhost:3000
   ```

---

## Future Improvements

- Add role-based access (admin/moderator/user).

- Integrate real-time notifications for food requests.

- Implement pagination and sorting for foods.

- Add automated API documentation using Swagger.

---

## Author

**Developed by**: Al Hasan Dhali

- Email: alhasandhali@gmail.com
- GitHub: [https://github.com/alhasandhali](https://github.com/alhasandhali)

---

> _“Don’t waste food — share it. Every plate shared brings hope to another.”_
