import { app } from "$lib/api";

export abstract class LixcyRelay {
  static async getSections(ownerId?: number) {
    const { data, error } = await app.api.vk.section.get({
      query: {
        ownerId,
      },
    });
    if (error) {
      console.error(error);
      return false;
    }

    return data;
  }

  static async getSection(sectionId: string) {
    const { data, error } = await app.api.vk.section({ sectionId }).get();
    if (error) {
      console.error(error);
      return false;
    }

    return data;
  }

  static async searchAudio(query: string) {
    const { data, error } = await app.api.vk.audio.search.get({
      query: {
        query,
      },
    });
    if (error) {
      console.error(error);
      return false;
    }

    return data;
  }

  static async addAudio(audioId: number, ownerId: number) {
    const route = app.api.vk
      .audio({ ownerId })({
        audioId,
      })
      .post();
    const { data, error } = await route;

    if (error) {
      console.error(error);
      return false;
    }
    return data;
  }

  static async deleteAudio(audioId: number, ownerId: number) {
    const route = app.api.vk
      .audio({ ownerId })({
        audioId,
      })
      .delete();
    const { data, error } = await route;

    if (error) {
      console.error(error);
      return false;
    }
    return data;
  }

  static async toggleLike(audioId: number, ownerId: number, isLiked: boolean) {
    if (isLiked) {
      return await this.deleteAudio(audioId, ownerId);
    }

    return await this.addAudio(audioId, ownerId);
  }
}
