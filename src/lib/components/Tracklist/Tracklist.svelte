<script lang="ts">
  import type { AudioItem } from "@toil/vk-audio/types/client/section";
  import TracklistItem, {
    type Props as TracklistItemProps,
  } from "./TracklistItem.svelte";

  type Props = {
    audios: AudioItem[];
    selectedAudioId?: number;
    onclick?: TracklistItemProps["onclick"];
  };

  let { audios, selectedAudioId, onclick }: Props = $props();
</script>

<ul class="tracklist">
  {#each audios as audio}
    {@const isSelected = audio.id === selectedAudioId}
    <TracklistItem {audio} {isSelected} {onclick} />
  {/each}
</ul>

<style>
  .tracklist {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
  }
</style>
