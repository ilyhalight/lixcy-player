<script lang="ts">
  import { Button, Icon, ListItem } from "m3-svelte";

  import { formatSeconds } from "$lib/player/format";
  import type { AudioItem } from "@toil/vk-audio/types/client/section";
  import iconFavoriteOutlineRounded from "@ktibow/iconset-material-symbols/favorite-outline-rounded";
  import iconHeartBrokenRounded from "@ktibow/iconset-material-symbols/heart-broken-rounded";

  export type Props = {
    audio: AudioItem;
    isSelected?: boolean;
    onclick?: (audio: AudioItem) => Promise<void> | void;
    onlikeToggle?: (audio: AudioItem, isLiked: boolean) => Promise<void> | void;
  };

  let {
    audio,
    isSelected = false,
    onclick = () => void 0,
    onlikeToggle = () => void 0,
  }: Props = $props();
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
    <div class="tracklist-item__end">
      <p class="tracklist-item__actions">
        <Button
          variant="text"
          iconType="full"
          size="s"
          onclick={async (event: Event) => {
            event.stopPropagation();
            await onlikeToggle(audio, audio.isLiked);
          }}
        >
          <Icon
            icon={audio.isLiked
              ? iconHeartBrokenRounded
              : iconFavoriteOutlineRounded}
          />
        </Button>
      </p>
      <p class="tracklist-item__duration">
        {formatSeconds(audio.duration)}
      </p>
    </div>
  </Button>
</li>

<style>
  .tracklist-item > :global([data-id="tracklist-item"]) {
    width: 100%;
    justify-content: start;
    text-align: left;
  }

  .tracklist-item__actions {
    display: none;
  }

  .tracklist-item:hover .tracklist-item__actions {
    display: flex;
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
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--m3c-on-surface-variant);
  }

  .tracklist-item__end {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-left: auto;
  }

  .tracklist-item.selected .tracklist-item__duration {
    color: var(--m3c-primary);
  }
</style>
