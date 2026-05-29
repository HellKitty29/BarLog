import { spawn } from "node:child_process";
import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const projectRoot = process.cwd();
let cwd = projectRoot;

if (process.platform === "win32" && projectRoot.includes("%")) {
  const linkParent = join(tmpdir(), "barlog-vite");
  const linkPath = join(linkParent, "project");

  mkdirSync(linkParent, { recursive: true });
  if (!existsSync(linkPath)) {
    symlinkSync(projectRoot, linkPath, "junction");
  }
  cwd = linkPath;
}

const viteBin = process.platform === "win32"
  ? join(cwd, "node_modules", ".bin", "vite.cmd")
  : join(cwd, "node_modules", ".bin", "vite");

const child = spawn(viteBin, ["--host", "0.0.0.0"], {
  cwd,
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }

  process.exit(code ?? 0);
});
