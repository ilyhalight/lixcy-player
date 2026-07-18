<script lang="ts">
  import { Button, Icon, Slider } from "m3-svelte";

  import iconVolumeUpOutlineRounded from "@ktibow/iconset-material-symbols/volume-up-outline-rounded";
  import iconVolumeOffOutlineRounded from "@ktibow/iconset-material-symbols/volume-off-outline-rounded";
  import type { MouseEventHandler } from "svelte/elements";

  export type Props = {
    volume?: number;
    isMuted?: boolean;
    onclick?: MouseEventHandler<HTMLButtonElement>;
  };

  let { volume = $bindable(0), isMuted = false, onclick }: Props = $props();
</script>

<div class="player-volume">
  <Button variant="text" iconType="full" {onclick}>
    <Icon
      icon={isMuted ? iconVolumeOffOutlineRounded : iconVolumeUpOutlineRounded}
    />
  </Button>
  <Slider bind:value={volume} min={0} max={100} step={1} data-id="" />
</div>

<style>
  .player-volume {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .player-volume > :global(.m3-container) {
    --handle-height: 1rem !important;
    --track-height: 0.5rem !important;
  }

  .player-volume > :global(.m3-container > .value) {
    padding: 0;
  }

  @media screen and (max-width: 768px) {
    :global(.player-full) .player-volume {
      display: none;
    }
  }
</style>
