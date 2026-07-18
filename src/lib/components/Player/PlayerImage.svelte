<script lang="ts">
  let { src } = $props();
</script>

<div class="player-image__wrapper">
  <img class="player-image" {src} alt="track poster" />
</div>

<style>
  .player-image__wrapper {
    width: 48px;
    min-width: 48px;
    height: 48px;
  }

  :global(.player-full) .player-image__wrapper {
    width: min(55vh, 100%) !important;
    height: min(55vh, 100%) !important;
    margin: auto 0;
  }

  @media screen and (min-height: 626px) and (max-width: 768px) {
    :global(.player-full) .player-image__wrapper {
      width: min(300px, 100%) !important;
      height: min(300px, 100%) !important;
    }
  }

  @media screen and (max-height: 625px) {
    :global(.player-full) .player-image__wrapper {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
    }
  }

  .player-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--m3-shape-medium);
  }
</style>
