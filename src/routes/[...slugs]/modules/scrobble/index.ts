import type { ScrobbleItem } from "$lib/scrobbles/base";
import { env } from "$env/dynamic/private";
import { Elysia, t } from "elysia";

const API_HOST = env.MALOJA_API_HOST;
const API_KEY_SECRET = env.MALOJA_API_KEY;

const ScrobbleItem = t.Object({
  title: t.String(),
  artist: t.String(),
  album: t.Optional(t.String()),
  albumArtists: t.Optional(t.Array(t.String())),
  duration: t.Number(),
  length: t.Number(),
});

type ScrobbleSuccessResponse = {
  status: "success" | "ok";
  track: unknown;
};

type ScrobbleErrorResponse = {
  status: "error" | "failure" | "no_operation";
  error: {
    type: string;
    desc: string;
  };
};

type ScrobbleResponse = ScrobbleErrorResponse | ScrobbleSuccessResponse;

export default new Elysia().group("/scrobble", (app) =>
  app.post(
    "/",
    async ({
      body: { title, artist, album, albumArtists, duration, length },
    }) => {
      try {
        const res = await fetch(`${API_HOST}/apis/mlj_1/newscrobble`, {
          method: "POST",
          body: JSON.stringify({
            title,
            artist,
            album,
            albumartist: albumArtists,
            duration,
            length,
            key: API_KEY_SECRET,
          }),
          headers: {
            "content-type": "application/json",
            "user-agent": "lixcy-backend/1.0.0",
          },
        });
        const result = (await res.json()) as ScrobbleResponse;
        if (result.status !== "ok" && result.status !== "success") {
          console.warn(`Maloja returned ${result.status} status. Failing...`);
          throw new Error((result as ScrobbleErrorResponse).error.desc);
        }

        console.log(`Scrobbled new track: ${artist} - ${title}`);
        return true;
      } catch (err) {
        console.error(`Failed to scrobble to Maloja, because`, err);
        return false;
      }
    },
    {
      body: ScrobbleItem,
    },
  ),
);
