import { Elysia } from "elysia";
import openapi from "@elysia/openapi";

import vk from "./modules/vk";
import scrobble from "./modules/scrobble";

const app = new Elysia({
  prefix: "/api",
})
  .use(
    openapi({
      path: "/docs",
    }),
  )
  .use(vk)
  .use(scrobble);

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const fallback: RequestHandler = ({ request }) => app.handle(request);

export type App = typeof app;
