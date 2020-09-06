const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;

//middleware

app.use(express.json());
app.use(cors());

//routes
app.use("/auth", require("./routes/jwtAuth"));
app.use("/", require("./routes/endpoints"));

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
