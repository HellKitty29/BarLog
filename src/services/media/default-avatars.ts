type IconPreset = {
  bg: string;
  fg: string;
  path: string;
};

const iconPresets: IconPreset[] = [
  { bg: "#2B0E0D", fg: "#DE913E", path: `<path d="M23 47h34l-4 9H27Z"/><path d="M30 45V34c0-6 5-10 10-10s10 4 10 10v11"/><path d="M26 37c8 4 20 4 28 0"/>` },
  { bg: "#12312A", fg: "#9FBF8F", path: `<path d="M16 47c7-9 14-9 21 0s14 9 21 0"/><path d="M16 57c7-9 14-9 21 0s14 9 21 0"/>` },
  { bg: "#3A1E1C", fg: "#F0A43D", path: `<path d="M40 57S22 47 22 34c0-7 9-11 18-1 9-10 18-6 18 1 0 13-18 23-18 23Z"/>` },
  { bg: "#21100E", fg: "#FAF6EE", path: `<path d="M40 16l5 16 16 5-16 5-5 16-5-16-16-5 16-5Z"/>` },
  { bg: "#4A1715", fg: "#C68334", path: `<path d="M26 55l14-38 14 38"/><path d="M31 42h18"/>` },
  { bg: "#10231F", fg: "#F8D77A", path: `<circle cx="40" cy="40" r="18"/><path d="M40 17v7M40 56v7M17 40h7M56 40h7M24 24l5 5M51 51l5 5M56 24l-5 5M29 51l-5 5"/>` },
  { bg: "#28100F", fg: "#D8CFC6", path: `<path d="M24 49c8-19 24-19 32 0"/><path d="M28 49h24M33 55h14"/>` },
  { bg: "#1E1824", fg: "#C8A9FF", path: `<path d="M22 40c12-18 24-18 36 0-12 18-24 18-36 0Z"/><circle cx="40" cy="40" r="7"/>` },
  { bg: "#1D2330", fg: "#9DDCFF", path: `<path d="M24 55V25l16-8 16 8v30"/><path d="M31 55V35h18v20"/>` },
  { bg: "#261A0E", fg: "#E8B35B", path: `<path d="M26 22h28l-4 34H30Z"/><path d="M30 32h20M34 42h12"/>` },
  { bg: "#0D2330", fg: "#8FD6E8", path: `<path d="M40 17l16 18-16 18-16-18Z"/><path d="M40 17v36M24 35h32"/>` },
  { bg: "#301414", fg: "#F06C5F", path: `<circle cx="40" cy="40" r="19"/><path d="M24 40h32M40 24v32"/>` },
  { bg: "#161F12", fg: "#B8E27B", path: `<path d="M40 58V28"/><path d="M40 38c-12 0-16-9-16-16 12 0 16 9 16 16Z"/><path d="M40 44c12 0 16-9 16-16-12 0-16 9-16 16Z"/>` },
  { bg: "#24131D", fg: "#F5A3C7", path: `<path d="M22 47c8 0 8-20 18-20s10 20 18 20"/><path d="M26 55h28"/>` },
  { bg: "#2A1C0D", fg: "#FFCF6B", path: `<path d="M40 18l21 40H19Z"/><path d="M40 31v14M40 52h.1"/>` },
  { bg: "#121C2A", fg: "#A4B9FF", path: `<path d="M21 40h38"/><path d="M40 21v38"/><path d="M27 27l26 26M53 27 27 53"/>` },
  { bg: "#2B111E", fg: "#FF8AB3", path: `<path d="M40 17v46"/><path d="M25 30c10 0 15 8 15 15 0-7 5-15 15-15"/>` },
  { bg: "#16211F", fg: "#6FE6C2", path: `<path d="M22 38c10-14 26-14 36 0"/><path d="M26 48c8-9 20-9 28 0"/><path d="M34 58c4-4 8-4 12 0"/>` },
  { bg: "#2A1510", fg: "#EF9A52", path: `<path d="M28 22h24v28a12 12 0 0 1-24 0Z"/><path d="M28 32h24"/>` },
  { bg: "#101928", fg: "#8CCBFF", path: `<path d="M21 48c6-16 13-24 19-24s13 8 19 24"/><path d="M26 48h28M32 56h16"/>` },
  { bg: "#2C2410", fg: "#D7C46A", path: `<path d="M40 17l8 22 22 8-22 8-8 22-8-22-22-8 22-8Z" transform="scale(.7) translate(17 17)"/>` },
  { bg: "#14202B", fg: "#A8E4FF", path: `<path d="M23 54c3-20 14-33 31-38-5 16-16 27-31 38Z"/><path d="M34 43l15-15"/>` },
  { bg: "#2B1715", fg: "#C68334", path: `<path d="M23 50h34"/><path d="M29 50V31h22v19"/><path d="M34 31V21h12v10"/>` },
  { bg: "#1B1328", fg: "#C7A7FF", path: `<circle cx="40" cy="40" r="18"/><path d="M40 22a18 18 0 0 0 0 36M40 22a18 18 0 0 1 0 36M22 40h36"/>` },
  { bg: "#1D2214", fg: "#BEE58A", path: `<path d="M40 18l18 12v22L40 62 22 52V30Z"/><path d="M40 18v44M22 30l18 11 18-11"/>` },
  { bg: "#2D1111", fg: "#FF7A67", path: `<path d="M22 57h36"/><path d="M29 57c0-15 5-25 11-25s11 10 11 25"/><path d="M31 28c5-7 13-7 18 0"/>` },
  { bg: "#102923", fg: "#6EE7B7", path: `<path d="M40 18c14 10 20 20 20 30a20 20 0 0 1-40 0c0-10 6-20 20-30Z"/><path d="M30 48c6 5 14 5 20 0"/>` },
  { bg: "#26131A", fg: "#FFB0C8", path: `<path d="M26 26h28v28H26Z"/><path d="M32 32h16v16H32Z"/><path d="M20 20l12 12M68 20 52 32M20 68l12-20M68 68 52 48"/>` },
  { bg: "#222018", fg: "#F8D77A", path: `<path d="M22 44c10-18 26-18 36 0"/><path d="M26 44c7 10 21 10 28 0"/><circle cx="40" cy="44" r="5"/>` },
  { bg: "#171717", fg: "#FAF6EE", path: `<path d="M23 55h34L47 22H33Z"/><path d="M31 35h18M29 45h22"/>` }
];

function hashSeed(seed: string) {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function svgForPreset(preset: IconPreset) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="40" fill="${preset.bg}"/>
      <circle cx="40" cy="40" r="30" fill="${preset.fg}" opacity=".08"/>
      <g fill="none" stroke="${preset.fg}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        ${preset.path}
      </g>
    </svg>
  `;
}

export function getDefaultAvatarDataUri(seed: string) {
  const preset = iconPresets[hashSeed(seed || "barlog-user") % iconPresets.length];
  return `data:image/svg+xml,${encodeURIComponent(svgForPreset(preset))}`;
}

