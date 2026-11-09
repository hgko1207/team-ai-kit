// PostToolUse(Edit|Write): 수정한 파일에 팀 포맷 명령 실행 (설정했을 때만)
// 파일 이름이 명령으로 해석되지 않도록 셸을 거치지 않고 실행한다.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { readInput, loadConfig, projectDir } = require("./lib");

const input = readInput();
const file = input.tool_input && typeof input.tool_input.file_path === "string" ? input.tool_input.file_path : "";
if (!file) process.exit(0);

const config = loadConfig(input);
if (config.error) process.exit(0); // 설정 오류는 보호 경로 훅이 알린다
const fc = config.formatCommand;
if (!fc || fc.length === 0) process.exit(0);

const ext = path.extname(file).toLowerCase();
if (config.formatExtensions.length && !config.formatExtensions.includes(ext)) process.exit(0);

const root = projectDir(input);
let argv = Array.isArray(fc) ? fc.slice() : String(fc).trim().split(/\s+/);
if (argv.some((a) => a.includes("{file}"))) argv = argv.map((a) => a.split("{file}").join(file));
else argv.push(file);
let [cmd, ...args] = argv;

// npx [옵션] <bin> ... → 로컬 bin으로 바꾼다 (-p/--package 값은 함께 건너뜀)
if (base(cmd) === "npx") {
  while (args[0] && args[0].startsWith("-")) {
    const o = args.shift();
    if ((o === "-p" || o === "--package") && args.length) args.shift();
  }
  cmd = args.shift();
}

function base(c) {
  return path.basename(c || "").toLowerCase().replace(/\.(exe|cmd)$/, "");
}

// Windows의 .cmd 실행 파일은 셸 없이 실행할 수 없다. JS 진입점을 찾아 node로 실행한다.
function resolveWindows(name) {
  const binDir = path.join(root, "node_modules", ".bin");
  // 1) npm cmd-shim: "%dp0%\..\pkg\bin\x.js" 형태에서 JS 경로를 읽는다
  try {
    const shim = fs.readFileSync(path.join(binDir, name + ".cmd"), "utf8");
    const m = shim.match(/"%(?:~)?dp0%\\([^"]+?\.(?:c|m)?js)"/i);
    if (m) return { cmd: process.execPath, pre: [path.join(binDir, m[1])] };
  } catch { /* 다음 방법 */ }
  // 2) node_modules의 package.json bin 표 (scoped 포함)
  const nm = path.join(root, "node_modules");
  let dirs = [];
  try {
    for (const d of fs.readdirSync(nm)) {
      if (d.startsWith(".")) continue;
      if (d.startsWith("@")) {
        try { for (const s of fs.readdirSync(path.join(nm, d))) dirs.push(path.join(nm, d, s)); } catch { /* 무시 */ }
      } else dirs.push(path.join(nm, d));
    }
  } catch { /* node_modules 없음 */ }
  for (const dir of dirs) {
    try {
      const pj = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
      const pkgName = (pj.name || "").split("/").pop();
      const rel = typeof pj.bin === "string" ? (pkgName === name ? pj.bin : null) : pj.bin && pj.bin[name];
      if (rel) return { cmd: process.execPath, pre: [path.join(dir, rel)] };
    } catch { /* 다음 패키지 */ }
  }
  // 3) .exe 가 있으면 그대로
  if (fs.existsSync(path.join(binDir, name + ".exe"))) return { cmd: path.join(binDir, name + ".exe"), pre: [] };
  return null;
}

if (process.platform === "win32" && !/\.(exe|js|cjs|mjs)$/i.test(cmd) && !path.isAbsolute(cmd)) {
  const r = resolveWindows(cmd);
  if (r) { args = [...r.pre, ...args]; cmd = r.cmd; }
}

const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", timeout: 55000, shell: false });
if (r.error || r.status !== 0) {
  // exit 2: PostToolUse에서는 작업을 되돌리지 않고 stderr를 Claude에게 보여 준다
  let detail = r.error ? r.error.message : (r.stderr || r.stdout || "").slice(0, 500);
  if (r.error && r.error.code === "ENOENT" && process.platform === "win32") {
    detail += " (Windows에서는 .cmd 실행 파일을 셸 없이 실행할 수 없습니다. formatCommand를 node_modules의 JS 진입점이나 .exe로 지정하세요)";
  }
  process.stderr.write(`포맷 명령이 실패했습니다 (${[cmd, ...args].join(" ")}): ${detail}\n`);
  process.exit(2);
}
process.exit(0);
