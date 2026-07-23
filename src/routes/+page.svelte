<script lang="ts">
  import { Tabs, LoadingIndicator, Card, TextFieldOutlined } from "m3-svelte";
  import "vidstack/player";

  import { LixcyRelay } from "$lib/sources/relay";
  import type { AudioItem } from "@toil/vk-audio/types/client/section";
  import Tracklist from "$lib/components/Tracklist/Tracklist.svelte";
  import Player from "$lib/components/Player/Player.svelte";
  import iconSearch from "@ktibow/iconset-material-symbols/search";

  import { MediaRemoteControl } from "vidstack";
  import { debounce } from "$lib/utils";

  const remote = new MediaRemoteControl();

  let tabs: {
    name: string;
    value: string;
  }[] = $state([]);
  let tab: string = $state("");
  let prevTab = $state("");
  let currentTab = $derived(tabs.find((t) => t.value === tab));
  // svelte-ignore state_referenced_locally
  let prevCurrentTab = $state(currentTab);

  const UNAVAILABLE_TABS = [
    "PUldVA8FR0RzSVNUUEwbCikZDFQZFlJEfFpFVA0WUVRyXVFEDAZSUzs",
    "PUldVA8FR0RzSVNUR1UPDykYHRdBXQQINUlFVAwWUVdqSVFUDwZfUH5ZUEQMARY",
    "PUldVA8FR0RzSVNUU1sHCikcABhSax4WIgodE0YWR0R_SVNHGRZTRHxZXUANBlJUf14U",
  ];

  let mediaPlayer: HTMLElement | null = $state(null);
  let selectedAudio: AudioItem | undefined = $state();

  let isPlaying = $state(false);
  let isScrobbled = $state(false);

  // volume
  let sliderVolume = $state(5);
  let volume = $derived(sliderVolume / 100);

  let playingTime = $state(0);
  let search = $state("");
  let isSearchResult = $state(false);

  let audioList: undefined | AudioItem[] = $state();
  let prevAudioList: undefined | AudioItem[] = $state();
  let currentAudioIdx = $derived(
    audioList?.findIndex((audioItem) => audioItem.id === selectedAudio?.id) ??
      0,
  );
  let prevAudio = $derived(
    currentAudioIdx > 0 ? audioList?.at(currentAudioIdx - 1) : undefined,
  );
  let nextAudio = $derived(audioList?.at(currentAudioIdx + 1));
  let pageTitle = $derived(
    selectedAudio
      ? `${selectedAudio.artist} - ${selectedAudio.title}`
      : `Lixcy Player`,
  );

  async function searchAudio(query: string) {
    const result = await LixcyRelay.searchAudio(query);
    const isEmptyResult = !result || (result && !result.audios.length);
    if (isEmptyResult) {
      isSearchResult = false;
      tab = prevTab;
      currentTab = prevCurrentTab;
      audioList = prevAudioList;
      return;
    }

    if (!isSearchResult) {
      prevTab = tab;
      prevAudioList = audioList;
      prevCurrentTab = currentTab;
    }

    currentTab = undefined;
    isSearchResult = true;
    audioList = result.audios;
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

  const onSearch = async () => {
    await searchAudio(search);
  };

  const onSearchInputStop = debounce(async () => {
    await onSearch();
  }, 500);
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

{#if !!selectedAudio}
  <Player
    {mediaPlayer}
    bind:isPlaying
    bind:isScrobbled
    bind:volume
    bind:sliderVolume
    bind:playingTime
    {changeSource}
    {selectedAudio}
    {prevAudio}
    {nextAudio}
    navTitle={currentTab?.name}
  />
{/if}

<section class="player-page">
  {#await getPageData(tab)}
    <div class="player-loading">
      <LoadingIndicator title="loading page data..." />
    </div>
  {:then data}
    <div class="player-tabs">
      <Tabs items={data.tabs} bind:tab />
    </div>

    <div class="player-search">
      <TextFieldOutlined
        label="Search..."
        trailing={{
          icon: iconSearch,
          onclick: onSearch,
        }}
        bind:value={search}
        enter={onSearch}
        oninput={onSearchInputStop}
      />
    </div>

    <Card variant="elevated">
      <!-- <h1>{data.section.title}</h1> -->
      <h1>
        {currentTab?.name ?? "All tracks"}
      </h1>
    </Card>
    {#if UNAVAILABLE_TABS.includes(currentTab?.value!)}
      <p>This tab isn't supported yet :c</p>
    {:else}
      <Tracklist
        audios={audioList ?? data.section.audios}
        selectedAudioId={selectedAudio?.id}
        onclick={changeSource}
        onlikeToggle={async (audio: AudioItem, isLiked: boolean) => {
          await LixcyRelay.toggleLike(audio.id, audio.ownerId, isLiked);
          audio.isLiked = !isLiked;
        }}
      />
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
  class="internal-media-player"
>
  <media-provider><source src="stub.m3u8" /></media-provider>

  <!-- <media-audio-layout></media-audio-layout> -->
</media-player>

<style>
  .player-page {
    padding: 1rem;
    padding-bottom: 120px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .player-loading {
    width: 100%;
    height: 75vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .player-search {
    display: flex;
  }

  .player-search > :global(.m3-container) {
    width: 100%;
  }

  .player-tabs {
    display: flex;
    overflow-x: auto;
  }

  /* if we set display none - media player will throw media errors */
  .internal-media-player {
    position: absolute;
    z-index: -1;
    width: 0;
    height: 0;
    visibility: hidden;
    opacity: 0;
  }
</style>
