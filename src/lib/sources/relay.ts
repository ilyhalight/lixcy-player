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
}
