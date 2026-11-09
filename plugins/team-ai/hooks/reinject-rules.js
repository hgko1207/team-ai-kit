// SessionStart(compact): 대화 압축 후 plan.md의 남은 작업을 다시 알린다 (stdout이 컨텍스트로 들어간다)
// 루트 CLAUDE.md는 압축 후 자동으로 다시 읽히므로, CLAUDE.md 섹션은 reinjectSections에 적은 것만 넣는다.
const fs = require("fs");
const path = require("path");
const { readInput, loadConfig, projectDir } = require("./lib");

const input = readInput();
const root = projectDir(input);
const config = loadConfig(input);
const MAX = 3000;

function read(file) {
  try { return fs.readFileSync(path.join(root, file), "utf8").replace(/^﻿/, ""); } catch { return ""; }
}

// HTML 주석과 코드 펜스를 지운 줄 목록 (예시 안의 제목·체크박스를 무시하기 위해)
function cleanLines(md) {
  const noComments = md.replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  let fence = false;
  for (const l of noComments.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(l)) { fence = !fence; continue; }
    if (!fence) out.push(l);
  }
  return out;
}

function headingTitle(l, level) {
  const m = l.match(new RegExp(`^#{${level}}\\s+(.*?)\\s*#*\\s*$`));
  return m ? m[1].trim() : null;
}

// "## 제목" 섹션 본문(다음 #, ## 제목 전까지). 원문 줄을 쓰되 경계는 펜스 밖에서만 판단
function section(md, title) {
  const lines = md.split(/\r?\n/);
  let start = -1, fence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) fence = !fence;
    if (!fence && headingTitle(lines[i], 2) === title) { start = i; break; }
  }
  if (start < 0) return "";
  const out = [lines[start]];
  fence = false;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) fence = !fence;
    if (!fence && /^#{1,2}\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n").trim();
}

const parts = [];
const claude = read("CLAUDE.md");
for (const t of config.reinjectSections || []) {
  const s = section(claude, t);
  if (s) parts.push(s);
}

// plan.md "다음 작업" 섹션 안의 미완료 항목만
const planLines = cleanLines(read("plan.md"));
let inNext = false;
const todo = [];
for (const l of planLines) {
  // ## 다음 작업 / ##다음 작업 / ## **다음 작업** / ## Next … 를 섹션 시작으로, 다른 # · ## 제목을 끝으로 본다
  const m = l.match(/^(#{1,2})(?!#)\s*(.*?)\s*#*\s*$/);
  if (m) {
    const title = m[2].replace(/\*\*/g, "").trim();
    inNext = m[1] === "##" && (title.startsWith("다음 작업") || /^next\b/i.test(title));
    continue;
  }
  if (inNext && /^\s*(###\s+|[-*]\s+)\[ \]\s+\S/.test(l)) todo.push(l.trim());
}
if (todo.length) parts.push("## plan.md 다음 작업\n" + todo.slice(0, 5).join("\n"));

if (parts.length) {
  let text = "[team-ai] 대화가 압축되었습니다. 이어서 할 작업과 팀 규칙입니다.\n\n" + parts.join("\n\n");
  if (text.length > MAX) text = text.slice(0, MAX) + "\n…(이하 plan.md·CLAUDE.md 참고)";
  process.stdout.write(text + "\n");
}
process.exit(0);
