export type ScrobbleItem = {
  title: string;
  artist: string;
  album?: string;
  albumArtists?: string[];
  duration: number;
  length: number;
};
