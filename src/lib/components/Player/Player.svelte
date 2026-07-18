<script lang="ts">
  import { MediaRemoteControl, type MediaTimeChangeEvent } from "vidstack";
  import type { AudioItem } from "@toil/vk-audio/types/client/section";

  import PlayerLeftPart from "./PlayerLeftPart.svelte";
  import PlayerMiddleActions from "./PlayerMiddleActions.svelte";
  import PlayerProgress from "./PlayerProgress.svelte";
  import PlayerVolume from "./PlayerVolume.svelte";
  import { onMount } from "svelte";
  import type { ScrobbleItem } from "$lib/scrobbles/base";
  import { MalojaScrobbler } from "$lib/scrobbles/maloja";

  type Props = {
    mediaPlayer: HTMLElement | null;
    isPlaying?: boolean;
    isScrobbled?: boolean;
    volume?: number;
    sliderVolume?: number;
    playingTime?: number;
    prevAudio?: AudioItem;
    selectedAudio: AudioItem;
    nextAudio?: AudioItem;
    navTitle?: string;
    changeSource: (audio: AudioItem) => Promise<void>;
  };

  const remote = new MediaRemoteControl();

  let {
    mediaPlayer,
    isPlaying = $bindable(false),
    isScrobbled = $bindable(false),
    volume = $bindable<number>(0),
    sliderVolume = $bindable<number>(0),
    playingTime = $bindable(0),
    selectedAudio,
    prevAudio,
    nextAudio,
    navTitle,
    changeSource,
  }: Props = $props();

  // progress
  let progress = $state(0);
  let totalTime = $state(0);
  let minScrobbleTime = $derived(totalTime / 3);

  // toggles
  let playerFull = $state(false);
  let isMuted = $state(false);
  let canScrobble = $derived(
    minScrobbleTime > 10 && playingTime > minScrobbleTime,
  );

  $effect(() => {
    if (!canScrobble) {
      return;
    }

    (async () => {
      await scrobble();
    })();
  });

  const onPlayPause = () => (isPlaying ? remote.pause() : remote.play());
  function onProgressClick(event: PointerEvent) {
    if (!selectedAudio || !event.target) {
      return;
    }

    const progressSlider = (event.target as HTMLElement).closest(
      '[data-id="player-time-slider"]',
    );
    if (!progressSlider) {
      return;
    }
    const percent = event.offsetX / progressSlider.clientWidth;
    const duration = selectedAudio.duration * percent;
    remote.seek(duration);
  }

  async function scrobble() {
    if (!canScrobble || isScrobbled) {
      return;
    }

    const { title, artist, artists, album } = selectedAudio;
    const data: ScrobbleItem = {
      title,
      artist,
      album: album ? album.title : undefined,
      albumArtists: album ? artists?.map((art) => art.name) : undefined,
      length: selectedAudio.duration,
      duration: playingTime,
    };

    isScrobbled = true;
    await MalojaScrobbler.scrobble(data);
  }

  onMount(async () => {
    const player = remote.getPlayer(mediaPlayer);
    if (!player) {
      console.error("failed to get player");
      return;
    }

    player.addEventListener("time-change", (event) => {
      playingTime = (event as MediaTimeChangeEvent).detail;
      totalTime = player.duration;
      progress = (playingTime / player.duration) * 100;
    });

    player.addEventListener("play", () => {
      isPlaying = true;
    });

    player.addEventListener("pause", () => {
      isPlaying = false;
    });

    player.addEventListener("ended", async () => {
      isPlaying = false;
      if (nextAudio) {
        await changeSource(nextAudio);
      }
    });

    player.addEventListener("loaded-data", () => {
      remote.changeVolume(volume);
    });

    player.addEventListener("volume-change", () => {
      const player = remote.getPlayer();
      if (!player) {
        return;
      }

      isMuted = player.muted;
    });
  });
</script>

<section
  class={{
    player: true,
    "player-full": playerFull,
  }}
>
  <PlayerLeftPart
    bind:playerFull
    {isPlaying}
    {onPlayPause}
    title={selectedAudio.title}
    artist={selectedAudio.artist}
    imageSrc={selectedAudio.thumbnail.photo_600}
    {navTitle}
  />
  <div class="player-middle">
    <PlayerMiddleActions
      {playerFull}
      hasPrevAudio={!!prevAudio}
      hasNextAudio={!!nextAudio}
      {isPlaying}
      {isMuted}
      bind:volume={sliderVolume}
      onClickPrev={async () => prevAudio && (await changeSource(prevAudio))}
      onClickNext={async () => nextAudio && (await changeSource(nextAudio))}
      onClickPlayPause={() => (isPlaying ? remote.pause() : remote.play())}
      onClickVolume={() => remote.toggleMuted()}
    />
    <PlayerProgress
      {playingTime}
      {progress}
      duration={selectedAudio.duration}
      {onProgressClick}
    />
  </div>
  <div class="player-right">
    {#if !playerFull}
      <PlayerVolume
        bind:volume={sliderVolume}
        {isMuted}
        onclick={() => remote.toggleMuted()}
      />
    {/if}
  </div>
</section>

<style>
  .player {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;

    position: fixed;
    z-index: 1111;
    width: 100%;
    background: var(--m3c-primary-container);
    border-radius: var(--m3-shape-large);
    bottom: 0;
  }

  .player-middle {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 300px;
    width: 100%;
    align-items: center;
  }

  .player-right {
    max-width: min(220px, 100%);
    width: 100%;
  }

  :global(body:has(.player-full)) {
    overflow: hidden;
  }

  .player-full {
    flex-direction: column;
    position: absolute;
    justify-content: center;
    z-index: 1111;
    width: 100%;
    background: var(--m3c-primary-container);
    border-radius: var(--m3-shape-large);
    bottom: 0;
    gap: 2rem;
    height: 100%;
  }

  .player-full .player-middle {
    flex-direction: column-reverse;
    min-width: 100%;
  }

  .player-full .player-right {
    display: none;
  }

  @media screen and (max-width: 768px) {
    .player {
      justify-content: start;
      flex-direction: column;
    }

    .player-right {
      display: none;
    }

    .player-middle {
      max-width: 100%;
    }
  }
</style>
