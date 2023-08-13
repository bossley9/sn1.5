export function PrintUsage() {
  console.log(
    `Usage:

  sn <command>

Commands:

  [no arg]    Download and sync, open notes with $EDITOR, then upload notes
  c           Clear all notes and log out
  d           Download and sync notes from server
  h           Print this help message
  r           Reset and refetch all notes from server
  u           Upload note changes to server
`,
  );
}
