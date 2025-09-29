import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { router } from "./routes";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Rotas
app.use("/", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Integration server running at http://localhost:${PORT}`);
});

