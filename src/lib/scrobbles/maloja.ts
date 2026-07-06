import { app } from "$lib/api";
import type { ScrobbleItem } from "./base";

export abstract class MalojaScrobbler {
  static async scrobble(item: ScrobbleItem) {
    const { data, error } = await app.api.scrobble.post(item);
    if (error) {
      console.error(error);
      return false;
    }

    return data;
  }
}
