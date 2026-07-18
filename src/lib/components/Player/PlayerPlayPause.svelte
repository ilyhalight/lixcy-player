<script lang="ts">
  import { Button, Icon } from "m3-svelte";

  import iconPlayCircleRounded from "@ktibow/iconset-material-symbols/play-circle-outline-rounded";
  import iconPauseCircleRounded from "@ktibow/iconset-material-symbols/pause-circle-outline-rounded";
  import type { MouseEventHandler } from "svelte/elements";

  export type Props = {
    isPlaying?: boolean;
    onclick?: MouseEventHandler<HTMLButtonElement>;
    buttonSize?: "m" | "s";
    dataId?: string;
  };

  let {
    isPlaying = false,
    onclick,
    buttonSize = "s",
    dataId,
  }: Props = $props();
</script>

<Button
  variant="tonal"
  iconType="full"
  size={buttonSize}
  {onclick}
  data-id={dataId}
>
  <Icon icon={isPlaying ? iconPauseCircleRounded : iconPlayCircleRounded} />
</Button>
