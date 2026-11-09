// PreToolUse(Edit|Write|NotebookEdit): 보호 경로 수정 차단
const fs = require("fs");
const { readInput, loadConfig, globToRegExp, matchPaths, CONFIG_FILE, DEFAULT_PROTECTED, DEFAULT_ALLOWED, CONFIG_FILES } = require("./lib");

const input = readInput();
const ti = input.tool_input || {};
const target = typeof ti.file_path === "string" ? ti.file_path : typeof ti.notebook_path === "string" ? ti.notebook_path : "";
if (!target) process.exit(0);

function block(msg) {
  process.stderr.write(msg + "\n");
  process.exit(2);
}

const configPath = CONFIG_FILE.split("\\").join("/");
const config = loadConfig(input);

// 설정 파일이 깨졌으면 모든 수정을 막는다. 설정 파일은 사람이 직접 고친다.
if (config.error) {
  block(`팀 설정을 읽을 수 없어 안전을 위해 파일 수정을 막았습니다: ${config.error}. 사용자에게 ${configPath}를 직접 고쳐 달라고 요청하세요.`);
}

const test = (globs, p) => globs.find((g) => globToRegExp(g).test(p));

for (const m of matchPaths(input, target)) {
  // 프로젝트 밖 경로는 "**/"로 시작하는 규칙(어디서나 적용)만 본다
  const anywhere = (globs) => globs.filter((g) => m.inside || g.startsWith("**/"));

  // 1) 기본 보호 목록: 내장 예외만 적용 (팀 설정으로 풀 수 없음)
  const hitDefault = !test(DEFAULT_ALLOWED, m.path) && test(anywhere(DEFAULT_PROTECTED), m.path);
  // 2) 팀이 추가한 보호 목록: 팀 예외 적용
  const hitTeam = !test(config.allowPaths, m.path) && test(anywhere(config.protectedPaths), m.path);
  const hit = hitDefault || hitTeam;
  if (hit) {
    block(
      `보호 경로라서 수정할 수 없습니다: ${m.path} (규칙: ${hit}). ` +
        `꼭 필요하면 사용자에게 직접 수정을 요청하세요. 팀 규칙은 ${configPath}에서 관리합니다.`
    );
  }

  // 3) 팀 설정 파일: 새로 만드는 것은 허용, 이미 있으면 수정 금지
  const cfg = test(CONFIG_FILES, m.path);
  if (cfg && fs.existsSync(m.abs)) {
    block(
      `팀 설정 파일은 Claude가 직접 수정할 수 없습니다: ${m.path}. ` +
        `바꿀 내용을 사용자에게 보여 주고 직접 적용해 달라고 요청하세요.`
    );
  }
}
process.exit(0);
