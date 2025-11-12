const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

// user-name:password/// study-mate:2Rm29h1Xx7k97Wq2

const uri = "mongodb+srv://study-mate:2Rm29h1Xx7k97Wq2@cluster0.fvvkm3z.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("studymate-db")
    const partnerCollection = db.collection("partner") 


    app.get('/partner', async (req, res) => {
      const result = await partnerCollection.find().toArray();
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("Study-Mate-server running successfully!")
})

app.listen(port, () => {
  console.log(`Study-Mate-server running on port ${port}`)
})
