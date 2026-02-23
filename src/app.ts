import express from "express";
import cors from "cors";
import { router } from "./routes/router.js";
import { adminRoutes } from "./routes/admin.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(router);
app.use("/api/admin", adminRoutes);

export { app };
