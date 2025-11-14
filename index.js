const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// user-name:password/// study-mate:2Rm29h1Xx7k97Wq2

const uri =
  "mongodb+srv://study-mate:2Rm29h1Xx7k97Wq2@cluster0.fvvkm3z.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("studymate-db");
    const partnerCollection = db.collection("partner");
    const myConnectionsCollection = db.collection("myConnections");

    app.get("/partner", async (req, res) => {
      console.log(req.query);
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

    app.get("/partner/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const result = await partnerCollection.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        result,
      });
    });

    // post method
    app.post("/partner", async (req, res) => {
      const data = req.body;
      const result = await partnerCollection.insertOne(data);
      // console.log(data)
      res.send({
        success: true,
        result,
      });
    });

    // update method api
    app.patch("/partner/:id", async (req, res) => {
      const id = req.params.id;
      const updatePartner = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatePartner,
      };
      const result = await partnerCollection.updateOne(query, update);
      res.send(result);
    });

    // delete method
    app.delete("/partner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partnerCollection.deleteOne(query);
      res.send(result);
    });

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
