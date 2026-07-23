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

export default new Elysia().group("/vk", (app) =>
  app
    .get(
      "/section",
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
      "/section/:sectionId",
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
    )
    .get(
      "/audio/search",
      async ({ query: { query, startOffset } }) => {
        return await client.searchAudio(query, startOffset);
      },
      {
        query: t.Object({
          query: t.String(),
          startOffset: t.Optional(t.Number()),
        }),
      },
    )
    .post(
      "/audio/:ownerId/:audioId",
      async ({ params: { ownerId, audioId } }) => {
        return await client.add(ownerId, audioId);
      },
      {
        params: t.Object({
          audioId: t.Number(),
          ownerId: t.Number(),
        }),
      },
    )
    .delete(
      "/audio/:ownerId/:audioId",
      async ({ params: { ownerId, audioId } }) => {
        return await client.delete(ownerId, audioId);
      },
      {
        params: t.Object({
          audioId: t.Number(),
          ownerId: t.Number(),
        }),
      },
    ),
);
