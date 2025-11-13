require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
var admin = require("firebase-admin");
const port = process.env.PORT || 3000;

var serviceAccount = require("./plateshare-firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middleware
app.use(cors());
app.use(express.json());

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const userInfo = await admin.auth().verifyIdToken(idToken);
    req.token_email = userInfo.email;
    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return res.status(401).send({ message: "Unauthorized: Invalid token" });
  }
};

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("plateShare_db");
    const foodsCollection = db.collection("foods");
    const userCollection = db.collection("user");
    const requestedFoodCollection = db.collection("food_requests");

    // Get all users
    app.get("/users", verifyFirebaseToken, async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single user
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // Get user by email
    app.get("/user/email/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await userCollection.findOne({ email });
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Post user
    app.post("/user", verifyFirebaseToken, async (req, res) => {
      try {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get all foods
    app.get("/foods", async (req, res) => {
      try {
        const { id, donator_email, status } = req.query;
        let query = {};

        if (id) {
          query.user_id = id;
        }

        if (donator_email) {
          query.donator_email = donator_email;
        }

        if (status) {
          query.food_status = status;
        }

        const result = await foodsCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get featured 6 foods by quantity
    app.get("/featured-foods", async (req, res) => {
      const cursor = foodsCollection
        .find({ food_status: "Available" })
        .sort({ food_quantity: -1 })
        .limit(6);

      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single food
    app.get("/food/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });

    // Post food
    app.post("/food", verifyFirebaseToken, async (req, res) => {
      try {
        const newfood = req.body;
        const result = await foodsCollection.insertOne(newfood);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update Food
    app.patch("/food/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;

        const filter = { _id: new ObjectId(id) };

        const updateDoc =
          Object.keys(updateData).length === 1 && updateData.food_status
            ? { $set: { food_status: updateData.food_status } }
            : { $set: updateData };

        const result = await foodsCollection.updateOne(filter, updateDoc);

        res.send(result);
      } catch (err) {
        console.error("Error updating food:", err);
        res.status(500).send({ error: err.message });
      }
    });

    // Delete food
    app.delete("/food/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });

    // Get all requested food
    app.get("/requested-foods", verifyFirebaseToken, async (req, res) => {
      const { email, food_id } = req.query;
      const query = {};

      if (email) {
        if (email != req.token_email) {
          return res.status(403).send({ message: "forbiddenaccess" });
        }
        query.user_email = email;
      }
      if (food_id) query.food_id = food_id;

      const result = await requestedFoodCollection.find(query).toArray();
      res.send(result);
    });

    // Post Requested Food
    app.post("/requested-food", verifyFirebaseToken, async (req, res) => {
      try {
        const newRequestedFood = req.body;

        if (newRequestedFood.user_email !== req.token_email) {
          return res.status(403).send({ message: "forbiddenaccess" });
        }

        const result = await requestedFoodCollection.insertOne(
          newRequestedFood
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    //Update Requested Food Status
    app.patch("/requested-food/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
          return res.status(400).send({ message: "Status is required" });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: { status },
        };

        const result = await requestedFoodCollection.updateOne(
          filter,
          updateDoc
        );

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .send({ message: "Request not found or not updated" });
        }

        res.send({ message: "Request status updated", result });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // Get method
    app.get("/", (req, res) => res.send("Server is running"));
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
