import { createServer } from "http";
import { appEnv } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();
const server = createServer(app);

server.listen(appEnv.port, () => {
  console.log(`PermitPass API listening on http://localhost:${appEnv.port}`);
});
