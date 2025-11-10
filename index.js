require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

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
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single food
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // Post user
    app.post("/user", async (req, res) => {
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
      const id = req.query.id;
      let query = {};

      if (id) {
        query = { user_id: id };
      }

      const result = await foodsCollection.find(query).toArray();
      res.send(result);
    });

    // app.patch("/users-img-change", async (req, res) => {
    //   try {
    //     const result = await userCollection.updateMany(
    //       {}, // empty filter → updates all documents
    //       {
    //         $set: {
    //           image: "https://i.ibb.co.com/pvWPkg07/man-illustration.webp",
    //         },
    //       }
    //     );

    //     res.send({
    //       message: `${result.modifiedCount} food items updated successfully`,
    //     });
    //   } catch (err) {
    //     console.error(err);
    //     res.status(500).send({ error: "Failed to update food images" });
    //   }
    // });

    // Get featured 6 foods by quantity
    app.get("/featured-foods", async (req, res) => {
      console.log("I'm from features-foods");
      const cursor = foodsCollection
        .find({ food_status: "Available" })
        .sort({ food_quantity: -1 })
        .limit(6);

      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single food
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });

    // Post food
    app.post("/food", async (req, res) => {
      try {
        const newfood = req.body;
        const result = await foodsCollection.insertOne(newfood);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update food
    app.patch("/food/:id", async (req, res) => {
      const id = req.params.id;
      const updateFood = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updateFood.name,
          price: updateFood.price,
        },
      };
      const result = await foodsCollection.updateOne(query, update);
      res.send(result);
    });

    // Delete food
    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });

    // Get all requested food
    app.get("/requested-foods", async (req, res) => {
      const { email, food_id } = req.query;
      const query = {};

      if (email) query.user_email = email;
      if (food_id) query.food_id = food_id;

      const result = await requestedFoodCollection.find(query).toArray();
      res.send(result);
    });

    // Post Requested Food
    app.post("/requested-food", async (req, res) => {
      try {
        const newRequestedFood = req.body;
        const result = await requestedFoodCollection.insertOne(
          newRequestedFood
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
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
