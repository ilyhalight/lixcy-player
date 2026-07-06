import { Elysia, t } from "elysia";
import { env } from "$env/dynamic/private";

import { VKAudio } from "@toil/vk-audio";
import { VKWebClient } from "@toil/vk-audio/client";
import type { VKAudioOpts } from "@toil/vk-audio/types/audio";

const webClient = new VKWebClient({
  cookies: {
    p: env.VK_COOKIE_P,
    remixsid: env.VK_COOKIE_REMIX_SID,
  },
});

const clientOpts: VKAudioOpts = {
  client: webClient,
  token: {
    value: "",
    expiresIn: -1,
  },
};
const client = new VKAudio(clientOpts);

export default new Elysia().group("/vk/section", (app) =>
  app
    .get(
      "/",
      async ({ query: { ownerId } }) => {
        return await client.getSections(ownerId ? String(ownerId) : undefined);
      },
      {
        query: t.Object({
          ownerId: t.Optional(t.Number()),
        }),
      },
    )
    .get(
      "/:sectionId",
      async ({ params: { sectionId }, query: { startOffset } }) => {
        return await client.getSection(sectionId, startOffset);
      },
      {
        params: t.Object({
          sectionId: t.String(),
        }),
        query: t.Object({
          startOffset: t.Optional(t.String()),
        }),
      },
    ),
);
