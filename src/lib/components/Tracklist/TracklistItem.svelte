<script lang="ts">
  import { Button, ListItem } from "m3-svelte";

  import { formatSeconds } from "$lib/player/format";
  import type { AudioItem } from "@toil/vk-audio/types/client/section";

  type Props = {
    audio: AudioItem;
    isSelected?: boolean;
    onclick?: (audio: AudioItem) => Promise<void> | void;
  };

  let { audio, isSelected = false, onclick = () => void 0 }: Props = $props();
</script>

<li class="tracklist-item" class:selected={isSelected}>
  <Button
    data-id="tracklist-item"
    square={true}
    size="m"
    variant={isSelected ? "tonal" : "elevated"}
    onclick={async () => await onclick(audio)}
    ><div class="tracklist-item__image-wrapper">
      <img
        class="tracklist-item__image"
        src={audio.thumbnail.photo_68}
        alt="track thumbnail"
      />
    </div>
    <ListItem headline={audio.title} overline={audio.artist}></ListItem>
    <p class="tracklist-item__duration">
      {formatSeconds(audio.duration)}
    </p>
  </Button>
</li>

<style>
  .tracklist-item > :global([data-id="tracklist-item"]) {
    width: 100%;
    justify-content: start;
    text-align: left;
  }

  .tracklist-item__image-wrapper {
    width: 48px;
    min-width: 48px;
    height: 48px;
  }

  .tracklist-item__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--m3-shape-medium);
  }

  .tracklist-item__duration {
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--m3c-on-surface-variant);
  }

  .tracklist-item.selected .tracklist-item__duration {
    color: var(--m3c-primary);
  }
</style>
