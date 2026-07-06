import { treaty } from "@elysia/eden";
import type { App } from "../routes/[...slugs]/+server";

export const USER_AGENT = "lixcy-player/1.0.0";
export const API_HOST = "localhost:1420";

export const app = treaty<App>(API_HOST, {
  headers: {
    "user-agent": USER_AGENT,
  },
});
