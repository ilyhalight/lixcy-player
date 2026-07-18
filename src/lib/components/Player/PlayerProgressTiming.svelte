<script lang="ts">
  import { formatSeconds } from "$lib/player/format";

  type Props = {
    seconds: number;
  };

  let { seconds }: Props = $props();
</script>

<p class="player-timing">
  {formatSeconds(seconds)}
</p>

<style>
  .player-timing {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--m3c-on-surface-variant);
  }
</style>
