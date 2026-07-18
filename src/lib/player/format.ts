// i guess DurationFormat have bad compatibility
export function formatSeconds(secs: number) {
  const rounded = Math.round(secs);

  return (
    `${Math.floor(rounded / 60)}`.padStart(2, "0") +
    ":" +
    `${rounded % 60}`.padStart(2, "0")
  );
}
