<script lang="ts">
  import { Button, Icon } from "m3-svelte";
  import iconKeyboardArrowDownRounded from "@ktibow/iconset-material-symbols/keyboard-arrow-down-rounded";

  type Props = {
    playerFull?: boolean;
    title?: string;
    prevScroll?: [number, number];
  };

  let {
    playerFull = $bindable(false),
    title = "",
    prevScroll = [0, 0],
  }: Props = $props();
</script>

<div class="player-nav">
  <Button
    variant="text"
    iconType="full"
    size="m"
    data-id="player-hide"
    onclick={() => {
      const [left, top] = prevScroll;
      window.scroll({
        left,
        top,
      });
      playerFull = false;
    }}
  >
    <Icon icon={iconKeyboardArrowDownRounded} />
  </Button>
  <div class="player-nav__content">
    <p class="player-nav__desc">Now playing</p>
    <h4 class="player-nav__title">{title}</h4>
  </div>
</div>

<style>
  .player-nav {
    display: none;
  }

  :global(.player-full) .player-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .player-nav__content {
    font-weight: 500;
    font-size: 0.85rem;
    color: var(--m3c-on-surface-variant);
  }

  .player-nav__title {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--m3c-on-surface);
  }
</style>
