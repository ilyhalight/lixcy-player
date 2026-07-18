<script lang="ts">
  let { title, artist } = $props();
</script>

<div class="player-info">
  <h3 class="player-title">{title}</h3>
  <p class="player-artist">{artist}</p>
</div>

<style>
  .player-info {
    word-break: break-word;
  }

  .player-artist {
    font-weight: 500;
    color: var(--m3c-on-surface-variant);
  }

  :global(.player-full) .player-info {
    width: 100%;
  }

  :global(.player-full) .player-title {
    font-size: 2rem;
  }

  :global(.player-full) .player-artist {
    font-size: 1.5rem;
  }

  @media screen and (max-height: 625px) {
    .player-info {
      max-width: min(55vh, 100%);
      align-self: start;
    }
  }
</style>
