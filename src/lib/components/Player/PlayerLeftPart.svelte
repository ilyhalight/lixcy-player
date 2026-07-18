<script lang="ts">
  import PlayerImage from "./PlayerImage.svelte";
  import PlayerInfo from "./PlayerInfo.svelte";
  import PlayerNav from "./PlayerNav.svelte";
  import PlayerPlayPause from "./PlayerPlayPause.svelte";

  type Props = {
    playerFull?: boolean;
    isPlaying?: boolean;
    onPlayPause?: () => void;
    title?: string;
    artist?: string;
    imageSrc?: string;
    navTitle?: string;
  };

  let {
    playerFull = $bindable(false),
    isPlaying = false,
    onPlayPause,
    title,
    artist,
    imageSrc,
    navTitle,
  }: Props = $props();
  let prevScroll = $state<[number, number]>([0, 0]);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="player-left"
  onclick={(event: Event) => {
    if (playerFull) {
      return;
    }

    if (
      (event.target as HTMLElement)?.closest('[data-id="player-toggle"]') ||
      (event.target as HTMLElement)?.closest('[data-id="player-hide"]')
    ) {
      return;
    }

    prevScroll = [window.scrollX, window.scrollY];
    window.scroll({
      left: 0,
      top: 0,
    });

    playerFull = true;
  }}
>
  <PlayerNav title={navTitle} {prevScroll} bind:playerFull />
  <PlayerImage src={imageSrc} />
  <PlayerInfo {title} {artist} />
  <div class="player-left__toggle">
    <PlayerPlayPause
      dataId="player-toggle"
      {isPlaying}
      buttonSize="s"
      onclick={onPlayPause}
    />
  </div>
</div>

<style>
  .player-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .player-left__toggle {
    display: none;
  }

  :global(.player-full) .player-left {
    flex-direction: column;
    position: relative;
    gap: 2rem;
    height: 100%;
    width: 100%;
  }

  @media screen and (min-width: 769px) {
    :global(.player:not(.player-full)) .player-left {
      max-width: min(100%, 300px);
      width: 100%;
    }
  }

  @media screen and (max-width: 768px) {
    :global(.player:not(.player-full) .player-left) {
      cursor: pointer;
      border-radius: var(--m3-shape-medium);
      padding-right: var(--m3-shape-small);
      transition: background var(--m3-easing);
    }

    :global(.player:not(.player-full)) .player-left:hover {
      background: var(--m3c-inverse-primary);
    }

    .player-left {
      width: 100%;
    }

    :global(.player:not(.player-full)) .player-left__toggle {
      display: flex;
      margin-left: auto;
    }
  }
</style>
