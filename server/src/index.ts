import { createServer } from "http";
import process from "node:process";

import { appEnv } from "./config/env.js";
import { createApp } from "./app.js";
import { loadSnapshot } from "./storage.js";

const bootstrap = async () => {
  await loadSnapshot();

  const app = createApp();
  const server = createServer(app);

  server.listen(appEnv.port, () => {
    console.log(`PermitPass API listening on http://localhost:${appEnv.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start PermitPass API", error);
  process.exit(1);
});
