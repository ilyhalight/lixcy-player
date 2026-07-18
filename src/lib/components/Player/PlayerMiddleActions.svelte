<script lang="ts">
  import { Button, Icon } from "m3-svelte";
  import iconSkipNextRounded from "@ktibow/iconset-material-symbols/skip-next-rounded";
  import iconSkipPreviousRounded from "@ktibow/iconset-material-symbols/skip-previous-rounded";
  import type { MouseEventHandler } from "svelte/elements";

  import PlayerVolume, {
    type Props as PlayerVolumeProps,
  } from "./PlayerVolume.svelte";
  import PlayerPlayPause, {
    type Props as PlayerPlayPauseProps,
  } from "./PlayerPlayPause.svelte";

  type Props = {
    playerFull?: boolean;
    hasPrevAudio?: boolean;
    hasNextAudio?: boolean;
    isPlaying?: boolean;
    isMuted?: boolean;
    volume?: number;
    onClickPrev?: MouseEventHandler<HTMLButtonElement>;
    onClickNext?: MouseEventHandler<HTMLButtonElement>;
    onClickPlayPause?: PlayerPlayPauseProps["onclick"];
    onClickVolume?: PlayerVolumeProps["onclick"];
  };

  let {
    playerFull = false,
    hasPrevAudio = false,
    hasNextAudio = false,
    isPlaying = false,
    isMuted = false,
    volume = $bindable<number>(0),
    onClickPrev,
    onClickNext,
    onClickPlayPause,
    onClickVolume,
  }: Props = $props();
  let buttonSize = $derived<"m" | "s">(playerFull ? "m" : "s");
</script>

<div class="player-middle__actions">
  <div class="player-middle__actions-left"></div>
  <div class="player-middle__actions-middle">
    <Button
      variant="text"
      iconType="full"
      size={buttonSize}
      disabled={!hasPrevAudio}
      onclick={onClickPrev}
    >
      <Icon icon={iconSkipPreviousRounded} />
    </Button>
    <PlayerPlayPause {isPlaying} {buttonSize} onclick={onClickPlayPause} />
    <Button
      variant="text"
      iconType="full"
      size={buttonSize}
      disabled={!hasNextAudio}
      onclick={onClickNext}
    >
      <Icon icon={iconSkipNextRounded} />
    </Button>
  </div>
  <div class="player-middle__actions-right">
    {#if playerFull}
      <PlayerVolume bind:volume {isMuted} onclick={onClickVolume} />
    {/if}
  </div>
</div>

<style>
  .player-middle__actions {
    display: flex;
    align-items: center;
  }

  .player-middle__actions-middle > :global(.m3-container[disabled]) {
    background-color: transparent !important;
  }

  :global(.player-full) .player-middle__actions .player-middle__actions-right {
    position: absolute;
    right: 1rem;
  }

  @media screen and (max-width: 768px) {
    :global(.player:not(.player-full)) .player-middle__actions {
      display: none;
    }
  }
</style>
