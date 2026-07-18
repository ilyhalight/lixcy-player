<script lang="ts">
  import { LinearProgress } from "m3-svelte";
  import PlayerProgressTiming from "./PlayerProgressTiming.svelte";

  type Props = {
    playingTime: number;
    progress: number;
    duration: number;
    onProgressClick?: (event: PointerEvent) => void;
  };

  let { playingTime, progress, duration, onProgressClick }: Props = $props();
</script>

<div class="player-progress">
  <PlayerProgressTiming seconds={playingTime} />
  <LinearProgress
    percent={progress}
    height={8}
    title="Playing progress"
    // @ts-ignore: sad, also we can't use onclick var to shortcut, because it will show error even if line has ts-ignore
    onclick={onProgressClick}
    data-id="player-time-slider"
  />
  <PlayerProgressTiming seconds={duration} />
</div>

<style>
  .player-progress {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .player-progress > :global([data-id="player-time-slider"]) {
    width: 100%;
    cursor: pointer;
  }

  .player-progress > :global([data-id="player-time-slider"] > .percent),
  .player-progress > :global([data-id="player-time-slider"] > .track) {
    pointer-events: none;
  }
</style>
