<script lang="ts">
  import {
    Tabs,
    Button,
    Icon,
    LinearProgress,
    LoadingIndicator,
    ListItem,
    Card,
    Slider,
  } from "m3-svelte";
  import iconPlayCircleRounded from "@ktibow/iconset-material-symbols/play-circle-outline-rounded";
  import iconPauseCircleRounded from "@ktibow/iconset-material-symbols/pause-circle-outline-rounded";
  import iconVolumeUpOutlineRounded from "@ktibow/iconset-material-symbols/volume-up-outline-rounded";
  import iconVolumeOffOutlineRounded from "@ktibow/iconset-material-symbols/volume-off-outline-rounded";
  import iconSkipNextRounded from "@ktibow/iconset-material-symbols/skip-next-rounded";
  import iconSkipPreviousRounded from "@ktibow/iconset-material-symbols/skip-previous-rounded";
  import iconKeyboardArrowDownRounded from "@ktibow/iconset-material-symbols/keyboard-arrow-down-rounded";
  import { MediaRemoteControl, type MediaTimeChangeEvent } from "vidstack";

  import "vidstack/player";

  import { onMount } from "svelte";

  import { LixcyRelay } from "$lib/sources/relay";
  import { MalojaScrobbler } from "$lib/scrobbles/maloja";
  import type { ScrobbleItem } from "$lib/scrobbles/base";
  import type { AudioItem } from "@toil/vk-audio/types/client/section";
  import { formatSeconds } from "$lib/player/format";
  import TracklistItem from "$lib/components/Tracklist/TracklistItem.svelte";

  let tabs: {
    name: string;
    value: string;
  }[] = $state([]);
  let tab: string = $state("");
  let currentTab = $derived(tabs.find((t) => t.value === tab));

  const UNAVAILABLE_TABS = [
    "PUldVA8FR0RzSVNUUEwbCikZDFQZFlJEfFpFVA0WUVRyXVFEDAZSUzs",
    "PUldVA8FR0RzSVNUR1UPDykYHRdBXQQINUlFVAwWUVdqSVFUDwZfUH5ZUEQMARY",
    "PUldVA8FR0RzSVNUU1sHCikcABhSax4WIgodE0YWR0R_SVNHGRZTRHxZXUANBlJUf14U",
  ];

  // oxlint-disable-next-line no-unassigned-vars
  let mediaPlayer: HTMLElement;

  let selectedAudio: AudioItem | undefined = $state();
  const remote = new MediaRemoteControl();

  let isPlaying = $state(false);
  let isMuted = $state(false);
  let isScrobbled = $state(false);
  let progress = $state(0);
  let playingTime = $state(0);
  let totalTime = $state(0);
  let sliderVolume = $state(5);
  let volume = $derived(sliderVolume / 100);

  let audioList: undefined | AudioItem[] = $state();
  let currentAudioIdx = $derived(
    audioList?.findIndex((audioItem) => audioItem.id === selectedAudio?.id) ??
      0,
  );
  let prevAudio = $derived(audioList?.at(currentAudioIdx - 1));
  let nextAudio = $derived(audioList?.at(currentAudioIdx + 1));
  let playerFull = $state(false);
  let prevScroll = $state([0, 0]);
  let pageTitle = $derived(
    selectedAudio
      ? `${selectedAudio.artist} - ${selectedAudio.title}`
      : `Lixcy Player`,
  );
  let minScrobbleTime = $derived(totalTime / 3);
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

  async function getPageData(sectionId?: string) {
    const sections = await LixcyRelay.getSections();
    if (!sections) {
      throw new Error("Failed to load sections data");
    }

    const musicSection = sections.sections.find((sec) =>
      sec.title.toLowerCase().includes("music"),
    );

    const usedSectionId =
      sectionId || musicSection?.id || sections.defaultSection;
    const section = await LixcyRelay.getSection(usedSectionId);
    tab = usedSectionId;
    if (!section) {
      throw new Error("Failed to load section data");
    }

    // tabs = sections.sections.map((sec) => ({
    //   name: sec.title,
    //   value: sec.id,
    // }));

    const musicTab = sections.sections.find((sec) => sec.id === usedSectionId);

    tabs = musicTab
      ? [
          {
            name: musicTab.title,
            value: musicTab.id,
          },
        ]
      : [];

    audioList = section.audios;

    const data = {
      sections,
      section,
      tabs,
    };

    return data;
  }

  async function scrobble() {
    if (!selectedAudio || !canScrobble || isScrobbled) {
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
    console.log("i scrobbled it!");
    await MalojaScrobbler.scrobble(data);
  }

  async function changeSource(audio: AudioItem) {
    const player = remote.getPlayer(mediaPlayer);
    if (!player) {
      console.error("failed to get player");
      return;
    }

    const provider = player.provider;
    if (!provider) {
      console.error("failed to get player provider");
      return;
    }

    player.pause();
    await provider.pause();

    await provider.loadSource({
      src: audio.fileUrl,
      type: "application/x-mpegurl",
    });

    selectedAudio = audio;
    remote.changeVolume(volume);
    remote.changeDuration(0);
    playingTime = 0;
    isScrobbled = false;
    remote.play();
    await provider.play();
    isPlaying = true;
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

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

{#if !!selectedAudio}
  <section
    class={{
      player: true,
      "player-full": playerFull,
    }}
  >
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

        prevScroll = [window.scrollX, window.screenY];
        window.scroll({
          left: 0,
          top: 0,
        });

        playerFull = true;
      }}
    >
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
          <p class="player-nav__desc">Сейчас играет</p>
          <h4 class="player-nav__title">{currentTab?.name}</h4>
        </div>
      </div>
      <div class="player-image__wrapper">
        <img
          class="player-image"
          src={selectedAudio.thumbnail.photo_600}
          alt="track poster"
        />
      </div>
      <div class="player-info">
        <h3 class="player-title">{selectedAudio.title}</h3>
        <p class="player-artist">{selectedAudio.artist}</p>
      </div>
      <div class="player-left__toggle">
        <Button
          variant="tonal"
          iconType="full"
          size="s"
          data-id="player-toggle"
          onclick={(event: Event) => {
            event.preventDefault();
            if (isPlaying) {
              remote.pause();
            } else {
              remote.play();
            }
          }}
        >
          <Icon
            icon={isPlaying ? iconPauseCircleRounded : iconPlayCircleRounded}
          />
        </Button>
      </div>
    </div>
    <div class="player-middle">
      <div class="player-middle__actions">
        <div class="player-middle__actions-left"></div>
        <div class="player-middle__actions-middle">
          <Button
            variant="text"
            iconType="full"
            size={playerFull ? "m" : "s"}
            disabled={!prevAudio}
            onclick={async () => {
              if (!prevAudio) {
                return;
              }

              await changeSource(prevAudio);
            }}
          >
            <Icon icon={iconSkipPreviousRounded} />
          </Button>
          <Button
            variant="tonal"
            iconType="full"
            size={playerFull ? "m" : "s"}
            onclick={() => {
              if (isPlaying) {
                remote.pause();
              } else {
                remote.play();
              }
            }}
          >
            <Icon
              icon={isPlaying ? iconPauseCircleRounded : iconPlayCircleRounded}
            />
          </Button>
          <Button
            variant="text"
            iconType="full"
            size={playerFull ? "m" : "s"}
            disabled={!nextAudio}
            onclick={async () => {
              if (!nextAudio) {
                return;
              }

              await changeSource(nextAudio);
            }}
          >
            <Icon icon={iconSkipNextRounded} />
          </Button>
        </div>
        <div class="player-middle__actions-right">
          {#if playerFull}
            <div class="player-volume">
              <Button
                variant="text"
                iconType="full"
                onclick={() => {
                  remote.toggleMuted();
                }}
              >
                <Icon
                  icon={isMuted
                    ? iconVolumeOffOutlineRounded
                    : iconVolumeUpOutlineRounded}
                />
              </Button>
              <Slider
                bind:value={sliderVolume}
                min={0}
                max={100}
                step={1}
                data-id=""
              />
            </div>
          {/if}
        </div>
      </div>
      <div class="player-progress">
        <p class="player-timing">
          {formatSeconds(playingTime)}
        </p>
        <LinearProgress
          percent={progress}
          height={8}
          title="Playing progress"
          // @ts-ignore: sad
          onclick={(event: PointerEvent) => {
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
          }}
          data-id="player-time-slider"
        />
        <p class="player-timing">
          {formatSeconds(selectedAudio.duration)}
        </p>
      </div>
    </div>
    <div class="player-right">
      {#if !playerFull}
        <div class="player-volume">
          <Button
            variant="text"
            iconType="full"
            onclick={() => {
              remote.toggleMuted();
            }}
          >
            <Icon
              icon={isMuted
                ? iconVolumeOffOutlineRounded
                : iconVolumeUpOutlineRounded}
            />
          </Button>
          <Slider
            bind:value={sliderVolume}
            min={0}
            max={100}
            step={1}
            data-id=""
          />
        </div>
      {/if}
    </div>
  </section>
{/if}

<section class="player-page">
  {#await getPageData(tab)}
    <LoadingIndicator title="loading page data..." />
  {:then data}
    <div class="player-tabs">
      <Tabs items={data.tabs} bind:tab />
    </div>

    <Card variant="elevated">
      <!-- <h1>{data.section.title}</h1> -->
      <h1>
        {currentTab?.name}
      </h1>
    </Card>
    {#if UNAVAILABLE_TABS.includes(currentTab?.value!)}
      <p>This tab isn't supported yet :c</p>
    {:else}
      <ul class="tracklist">
        {#each data.section.audios as audio}
          {@const isSelected = audio.id === selectedAudio?.id}
          <TracklistItem {audio} {isSelected} onclick={changeSource} />
        {/each}
      </ul>
    {/if}
  {/await}
</section>

<media-player
  bind:this={mediaPlayer}
  {volume}
  viewType="audio"
  streamType="on-demand"
  logLevel="warn"
  // load="custom"
  crossOrigin
  playsInline
>
  <media-provider><source src="stub.m3u8" /></media-provider>

  <!-- <media-audio-layout></media-audio-layout> -->
</media-player>

<style>
  .player-page {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .player-tabs {
    overflow-x: auto;
  }

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

  .player-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .player-nav {
    display: none;
  }

  .player-info {
    word-break: break-word;
  }

  .player-artist {
    font-weight: 500;
    color: var(--m3c-on-surface-variant);
  }

  .player-left__toggle {
    display: none;
  }

  .player-middle {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 300px;
    width: 100%;
    align-items: center;
  }

  .player-progress {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .player-timing {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--m3c-on-surface-variant);
  }

  .player-progress > :global([data-id="player-time-slider"]) {
    width: 100%;
    cursor: pointer;
  }

  .player-progress > :global([data-id="player-time-slider"] > .percent),
  .player-progress > :global([data-id="player-time-slider"] > .track) {
    pointer-events: none;
  }

  .player-right {
    max-width: min(220px, 100%);
    width: 100%;
  }

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

  .player-full .player-left {
    flex-direction: column;
    position: relative;
    gap: 2rem;
    height: 100%;
    width: 100%;
  }

  .player-full .player-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .player-full .player-nav__content {
    font-weight: 500;
    font-size: 0.85rem;
    color: var(--m3c-on-surface-variant);
  }

  .player-full .player-nav__title {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--m3c-on-surface);
  }

  .player-full .player-image__wrapper {
    width: min(55vh, 100%) !important;
    height: min(55vh, 100%) !important;
    margin: auto 0;
  }

  .player-full .player-info {
    width: 100%;
  }

  .player-full .player-title {
    font-size: 2rem;
  }

  .player-full .player-artist {
    font-size: 1.5rem;
  }

  .player-full .player-middle {
    flex-direction: column-reverse;
    min-width: 100%;
  }

  .player-full .player-right {
    display: none;
  }

  .player-middle__actions {
    display: flex;
    align-items: center;
  }

  .player-full .player-middle__actions .player-middle__actions-right {
    position: absolute;
    right: 1rem;
  }

  @media screen and (min-width: 769px) {
    .player:not(.player-full) .player-left {
      max-width: min(100%, 300px);
      width: 100%;
    }
  }

  @media screen and (max-width: 768px) {
    .player {
      justify-content: start;
      flex-direction: column;
    }

    .player:not(.player-full) .player-left {
      cursor: pointer;
      border-radius: var(--m3-shape-medium);
      padding-right: var(--m3-shape-small);
      transition: background var(--m3-easing);
    }

    .player:not(.player-full) .player-left:hover {
      background: var(--m3c-inverse-primary);
    }

    .player-left {
      width: 100%;
    }

    .player:not(.player-full) .player-left__toggle {
      display: flex;
      margin-left: auto;
    }

    .player-right {
      display: none;
    }

    .player-middle {
      max-width: 100%;
    }

    .player:not(.player-full) .player-middle__actions {
      display: none;
    }

    .player-full .player-volume {
      display: none;
    }
  }

  @media screen and (min-height: 626px) and (max-width: 768px) {
    .player-full .player-image__wrapper {
      width: min(300px, 100%) !important;
      height: min(300px, 100%) !important;
    }
  }

  @media screen and (max-height: 625px) {
    .player-full .player-image__wrapper {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
    }

    .player-info {
      max-width: min(55vh, 100%);
      align-self: start;
    }
  }

  .tracklist {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
  }

  .player-image__wrapper {
    width: 48px;
    min-width: 48px;
    height: 48px;
  }

  .player-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--m3-shape-medium);
  }
</style>
