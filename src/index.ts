import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(router);

console.log("🧩 Router registrado:", typeof router);

const PORT = process.env.PORT || 4100;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
