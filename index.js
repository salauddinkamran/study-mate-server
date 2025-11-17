const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceKey.json");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// user-name:password/// study-mate:2Rm29h1Xx7k97Wq2

// const uri =
//   "mongodb+srv://study-mate:2Rm29h1Xx7k97Wq2@cluster0.fvvkm3z.mongodb.net/?appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fvvkm3z.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({
      message: "Unauthorized access. Token not found!",
    });
  }
  const token = authorization.split(" ")[1];
  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(401).send({
      message: "Unauthorized access.",
    });
  }
};

async function run() {
  try {
    await client.connect();

    const db = client.db("studymate-db");
    const partnerCollection = db.collection("partner");
    const myConnectionsCollection = db.collection("myConnections");
    const userCollection = db.collection("users");

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        res.send({
          message: "user already exits. do not need to insert again",
        });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.get("/partner", async (req, res) => {
      // console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = partnerCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/top-student", async (req, res) => {
      const cursor = partnerCollection.find().sort({ rating: -1 }).limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/partner/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const result = await partnerCollection.findOne({ _id: new ObjectId(id) });
      res.send({ result });
    });

    // post method
    app.post("/partner", async (req, res) => {
      const data = req.body;
      const result = await partnerCollection.insertOne(data);
      console.log(data);
      res.send({
        success: true,
        result,
      });
    });

    // update method api
    // app.patch("/my-connection/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updatePartner = req.body;
    //   const query = { _id: new ObjectId(id) };
    //   const update = {
    //     $set: updatePartner,
    //   };
    //   const result = await myConnectionsCollection.updateOne(query, update);
    //   res.send(result);
    // });

    app.patch("/my-connection/:id", async (req, res) => {
      const id = req.params.id;
      const updatePartner = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatePartner,
      };
      const result = await myConnectionsCollection.updateOne(query, update);
      res.send(result);
    });
    // app.patch("/partner/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updatePartner = req.body;
    //   const query = { _id: new ObjectId(id) };
    //   const update = {
    //     $set: updatePartner,
    //   };
    //   const result = await partnerCollection.updateOne(query, update);
    //   res.send(result);
    // });

    // delete method
    // app.delete("/partner/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await partnerCollection.deleteOne(query);
    //   res.send(result);
    // });

    // myConnections related apis
    app.get("/my-connection", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = myConnectionsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);

    });

    app.post("/my-connection", async (req, res) => {
      const newConnection = req.body;
      const result = await myConnectionsCollection.insertOne(newConnection);
      res.send(result);
    });

    app.get("/my-connection/:id", async (req, res) => {
      // const id = req.params.id;
      // const query = { partnerId: id };
      // const cursor = myConnectionsCollection.find(query);
      // const result = await cursor.toArray();
      // res.send(result);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myConnectionsCollection.findOne(query);
      res.send(result);
    });

    // app.get("/my-connection/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await myConnectionsCollection.findOne(query);
    //   res.send(result);
    // });


    app.delete("/my-connection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myConnectionsCollection.deleteOne(query);
      res.send(result);
    });


    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const result = await partnerCollection.find({
        $or:[
          {subject: {$regex: search_text, $options: "i"}},
          {name: {$regex: search_text, $options: "i"}}
        ]
      }).toArray()
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Study-Mate-server running successfully!");
});

app.listen(port, () => {
  console.log(`Study-Mate-server running on port ${port}`);
});
