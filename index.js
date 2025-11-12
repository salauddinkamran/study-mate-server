const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
  res.send("Study-Mate-server running successfully!")
})


app.listen(port, () => {
  console.log(`Study-Mate-server running on port ${port}`)
})
