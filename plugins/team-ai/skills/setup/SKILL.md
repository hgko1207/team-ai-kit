---
name: setup
description: 이 저장소에 팀 표준 Claude Code 세팅을 적용한다. 스택과 명령을 감지해 CLAUDE.md(Codex 등과 같이 쓰면 AGENTS.md도)·plan.md·권한·훅 설정·VS Code 설정을 만들거나 기존 파일에 병합한다. 저장소에 처음 도입할 때 한 번 실행한다.
disable-model-invocation: true
argument-hint: "[--dry-run]"
---

# 팀 세팅 적용

`${CLAUDE_SKILL_DIR}/templates/`를 기준으로 현재 저장소에 팀 세팅을 적용한다. (치환되지 않았다면 이 SKILL.md가 있는 폴더의 `templates/`다.)

**원칙**
- 기존 파일은 덮어쓰지 않는다. 항상 병합한다.
- 코드에서 확인한 것만 쓴다. 확인 못 한 것은 사용자에게 묻거나 `{{...}}`로 남기고 보고한다.
- 명령은 실제로 실행해 확인한 것만 "검증 명령"에 쓴다.
- 인자에 `--dry-run`이 있으면 파일을 쓰지 않고 무엇을 바꿀지만 보고한다.

## 1. 사전 확인

1. git 저장소인지, 작업 트리가 깨끗한지 확인한다. 변경이 있으면 알리고 계속할지 묻는다.
2. 기본 브랜치(main/master)에 있으면 `chore/claude-setup` 브랜치를 만들자고 제안한다.
3. 이미 있는 파일을 확인한다: `CLAUDE.md`, `AGENTS.md`, `plan.md`, `.claude/settings.json`, `.claude/team-ai.json`, `.claude/rules/`, `.vscode/settings.json`, `.gitignore`.
4. `node --version`을 확인한다. Node가 없으면 훅이 실행되지 않아 **차단이 모두 꺼진다.** 보고서 맨 위에 경고로 적고, 팀원 PC에도 Node가 필요하다고 안내한다.
5. 지침 파일 방식을 정한다 (아래 표). **AGENTS 방식**은 Claude Code와 Codex 같은 다른 AI 도구가 같은 규칙을 읽게 하는 방식이다. 공통 규칙은 `AGENTS.md`에 두고, `CLAUDE.md`는 첫 줄 `@AGENTS.md`로 그 내용을 가져온 뒤 Claude 전용 섹션만 둔다. Claude Code는 CLAUDE.md가 있으면 AGENTS.md를 따로 읽지 않으므로 이 import가 꼭 있어야 한다. CLAUDE.md에 "AGENTS.md를 보라"는 글만 쓰면 내용이 들어오지 않는다.

| 지금 있는 파일 | 할 일 |
|---|---|
| 둘 다 없음 | "Codex 같은 다른 AI 도구도 이 저장소에서 쓰나요?" 한 번만 묻는다. 예 → AGENTS 방식, 아니오·답 없음 → 기본 방식(CLAUDE.md 하나) |
| `CLAUDE.md`만 | 기본 방식. 묻지 않는다 |
| `AGENTS.md`만 | AGENTS 방식을 기본으로 제안한다 (다른 도구를 이미 쓰고 있다는 신호) |
| 둘 다 | CLAUDE.md에 `@AGENTS.md` import가 이미 있으면 AGENTS 방식. 없으면 CLAUDE.md 맨 위에 `@AGENTS.md`를 넣을지 묻는다. 넣어도 기존 내용은 옮기지 않는다. 거절하면 기본 방식 |

## 2. 스택과 명령 감지

1. 매니페스트로 스택을 판별한다: package.json, tsconfig.json, pyproject.toml, requirements*.txt, build.gradle(.kts), pom.xml, *.csproj/*.sln, go.mod, Cargo.toml, pubspec.yaml 등. 주요 소스 확장자 분포도 본다. 여러 스택(모노레포)이면 모두 나열하고 확인받는다.
2. 명령 후보를 찾는다: package.json scripts, Makefile, gradle tasks, pyproject 설정, README의 실행 방법.
3. 타입체크·린트·테스트·빌드 명령은 **실제로 실행**해 동작을 확인한다. 실행 여부는 스크립트 **이름이 아니라 본문**을 읽고 판단한다(예: `build`가 `next build && node x.mjs`면 안전하므로 실행하고, `deploy`처럼 본문에 `wrangler deploy`·`kubectl`·DB 마이그레이션이 있으면 실행하지 않는다). 오래 걸리면(5분 이상 예상) 사용자에게 먼저 묻는다. DB 마이그레이션, 배포, 외부 장비·서비스에 영향을 주는 명령은 실행하지 않고 그 사실을 기록한다.
4. 포매터가 로컬에 설치돼 있는지 확인한다(예: node_modules/.bin/prettier, black, ktlint, dotnet format).

## 3. 파일 적용

| 파일 | 없을 때 | 있을 때 |
|---|---|---|
| `CLAUDE.md` (기본 방식) | `templates/CLAUDE.md`를 채워서 생성 | 기존 내용을 보존하고, 빠진 섹션(검증 명령, 원칙, 작업 방식, 작업 진행 방식, 하지 말 것)만 추가 |
| `AGENTS.md` (AGENTS 방식) | `templates/agents-mode/AGENTS.md`를 채워서 생성 | 기존 내용을 보존하고, 빠진 공통 섹션(검증 명령, 원칙, 하지 말 것)만 추가 |
| `CLAUDE.md` (AGENTS 방식) | `templates/agents-mode/CLAUDE.md`로 생성 | 첫 줄에 `@AGENTS.md`가 없으면 넣고, 빠진 Claude 전용 섹션(작업 방식, 작업 진행 방식)만 추가. 공통 섹션은 추가하지 않는다 (AGENTS.md와 중복) |
| `plan.md` | `templates/plan.md`로 생성, "현재 상태" 채움 | 기존 내용은 그대로 둔다. `## 다음 작업 (구현 예정)`과 `## 완료` 섹션이 없으면 **반드시** 파일 끝에 추가한다 (plan-feature·verify·재주입 훅이 이 제목을 찾는다) |
| `.claude/settings.json` | 템플릿으로 생성 | 훅이 기존 설정 파일 수정을 막는다. 병합한 전체 내용(키별 병합, `allow`·`ask`·`deny` 합집합, **기존 deny는 그대로**)을 보여 주고 사용자에게 직접 적용해 달라고 요청한다 |
| `.claude/team-ai.json` | 템플릿으로 생성 | 위와 같이 병합 내용을 보여 주고 사용자에게 적용을 요청한다 (배열은 합집합, 값은 기존 우선) |
| `.claude/rules/<스택>.md` | 아래 4번 | 그대로 둔다 |
| `.vscode/settings.json`, `extensions.json` | 템플릿으로 생성 | `claudeCode.*` 키와 recommendations만 병합. 주석·끝 쉼표가 있는 JSONC이므로 `JSON.parse`로 다시 쓰지 말고 Edit로 키만 추가해 기존 주석을 보존한다 |
| `.gitignore` | `templates/gitignore.snippet`로 생성 | 없는 줄만 끝에 추가. `.vscode/`(폴더 통째) 규칙이 있으면 `.vscode/*`로 바꾸고 `!.vscode/settings.json`, `!.vscode/extensions.json`을 추가한다 (폴더째 무시하면 `!` 예외가 동작하지 않는다) |
| `docs/ai-workflow.md`, `docs/ai-cost-guide.md` | 템플릿 복사 후 빈칸 채우기 (아래) | 그대로 둔다 |

**ai-workflow.md 채우기** (팀원이 그대로 읽는 문서라 `{{`가 남으면 안 된다)
- `{{org}}`는 settings.json과 같은 값으로 바꾼다.
- `{{보호 경로}}`는 team-ai.json에 추가한 `protectedPaths`를 쉬운 말로 적는다(예: "DB 마이그레이션 폴더"). 추가한 것이 없으면 `, {{보호 경로}}` 부분을 지운다.
- 계정 담당자, 문의 채널처럼 코드에서 알 수 없는 값은 사용자에게 묻는다. 답이 없으면 남기고 "팀이 정할 것"에 적는다.

**CLAUDE.md 채우기**
- 기존 CLAUDE.md에 섹션을 추가할 때는 항목을 알맞은 제목 아래에 넣는다. 예: 금지 규칙은 `## 하지 말 것` 아래 (없으면 제목부터 만든다). 제목 없이 다른 섹션 끝에 붙이지 않는다.
- 구조는 실제 폴더 기준으로 쓴다. 새 기능을 둘 자리는 가장 비슷한 기존 기능의 경로를 예로 든다.
- "코딩 규칙"과 "하지 말 것"은 코드에서 관찰한 것만 쓴다. 예: 마이그레이션 폴더, 자동 생성 코드, 공통 에러 처리 방식.
- 100줄 안쪽으로 유지한다. 긴 설명은 docs/로 뺀다.
- "생각을 깊게 하라" 같은 문장은 넣지 않는다.

**AGENTS 방식일 때 추가 규칙** (위 규칙은 AGENTS.md에도 똑같이 적용)
- 공통 규칙(구조, 명령, 검증 명령, 원칙, 코딩·커밋 규칙, 하지 말 것, 용어)은 AGENTS.md에만 쓴다. CLAUDE.md에 같은 내용을 또 쓰지 않는다.
- AGENTS.md에는 `/team-ai:*`, 훅, Claude 권한 모드처럼 Claude Code에만 있는 이름을 쓰지 않는다. 다른 도구가 읽고 헷갈린다. 그런 내용은 CLAUDE.md에 둔다.
- `@AGENTS.md`는 CLAUDE.md 첫 줄에, 코드 펜스·백틱·따옴표 없이 둔다. 펜스 안이나 따옴표로 감싸면 가져오지 않는다.
- 기존 AGENTS.md에 다른 도구 전용 내용(예: Codex 승인 설정 안내)이 있어도 지우거나 옮기지 않는다. 보고서에 "다른 도구 전용으로 보이는 줄"로 알린다.

**settings.json 채우기**
- 2번에서 확인한 검증 명령을 `allow`에 추가한다. **Bash와 PowerShell 형식을 같이 넣는다.** 예: `"Bash(npm run lint *)", "PowerShell(npm run lint *)"`. Windows에서 Git Bash가 없으면 Bash 규칙이 하나도 맞지 않기 때문이다.
- 마이그레이션·배포·장비 제어처럼 되돌리기 어려운 명령은 `ask`에 추가한다.
- 저장소에 다른 비밀 파일 패턴이 있으면 `deny`에 `Read(...)`를 추가한다.
- `{{org}}`는 마켓플레이스 저장소 주인으로 바꾼다. 기본은 공개 키트의 `hgko1207`이다. 이 PC의 키트가 다른 곳(회사 사본, 사내 git)에서 설치됐으면(`claude plugin marketplace list`의 Source) 그 주인을 쓰고, GitHub가 아닌 주소면 `source` 형식을 그에 맞게 바꾼다. `{{org}}`를 남긴 채 두면 팀원 PC에서 플러그인 설치가 실패한다.

**team-ai.json 채우기**
- 기본 보호 목록(.env, 키 파일, secrets/, .git/ 등)과 보호 브랜치(main, master, develop, release/* 등)는 훅에 내장되어 항상 켜져 있다. 이 파일에는 **이 저장소에만 필요한 것만 추가**한다. 기본 목록을 줄일 수는 없다.
- 마이그레이션 폴더, 자동 생성 코드 폴더를 `protectedPaths`에 추가한다. 예: `"db/migrations/**"`. 사람이 고치는 일반 소스·스크립트는 넣지 않는다 (보호가 지나치면 정상 작업이 막힌다).
- 로컬에 설치된 포매터가 있을 때만 `formatCommand`를 배열로 채운다. 예: `["npx", "--no-install", "prettier", "--write", "{file}"]`. 대상 확장자를 `formatExtensions`에 적는다. Markdown은 넣지 않는다.
- 이 파일이 JSON 문법 오류이면 훅이 안전을 위해 모든 파일 수정과 명령을 막는다. 처음 만들 때 한 번에 올바르게 쓰고, 쓴 뒤 반드시 파싱해 본다. 만든 뒤에는 Claude가 고칠 수 없고 사람이 고친다.
- `allowPaths`는 팀이 추가한 `protectedPaths`의 예외일 뿐이며, 기본 보호 목록은 풀 수 없다.
- AGENTS 방식이면 `reinjectSections`에 `"검증 명령"`, `"하지 말 것"`을 넣는다. CLAUDE.md가 가져온 AGENTS.md를 대화 압축 후 다시 읽는지는 공식 문서에 없어서, 재주입 훅이 AGENTS.md에서 이 섹션을 찾아 다시 넣는다. 기본 방식이면 비워 둔다.

## 4. 스택 규칙

- 감지한 스택마다 `templates/.claude/rules/_stack-rule.template.txt`를 바탕으로 `.claude/rules/<스택>.md`를 만든다.
- `paths:`에 그 스택 파일 glob을 넣어 해당 파일을 다룰 때만 로드되게 한다.
- 이 저장소 코드에서 확인된 관례만 쓴다. 확인 안 되는 섹션은 지운다.
- 템플릿 원본(`.txt`)은 저장소에 복사하지 않는다.

## 5. 확인

1. 쓴 JSON 파일을 모두 파싱해 본다: `node -e "JSON.parse(require('fs').readFileSync('<파일>','utf8'))"` (`.vscode/*.json`은 주석이 있어 제외).
2. `{{`가 남은 곳을 검색한다. 팀이 정해야 하는 값만 남기고 목록으로 보고한다.
3. 사용자에게 Claude Code를 다시 열고 아래를 확인하라고 안내한다.
   - `/context`에서 CLAUDE.md와 의도한 rule만 로드됐는지 (AGENTS 방식이면 AGENTS.md 내용도 함께 들어왔는지)
   - `.env.test 파일을 만들고 A=1 한 줄 넣어줘`가 훅에 막히는지 (`.env`는 Claude가 규칙을 보고 먼저 거절해 훅 동작을 확인할 수 없다)
   - `/team-ai:verify`가 검증 명령을 실행하는지

## 6. 보고

파일을 쓰지 못한 경우는 원인을 구분해서 적는다.
- **팀 설정 파일 보호 훅**: 이미 있는 `.claude/settings.json`·`team-ai.json`. 병합한 전체 내용을 보여 주고 사용자에게 직접 적용을 요청한다.
- **Claude Code 권한 확인**: `.claude/`·`.vscode/` 아래 새 파일은 Claude Code가 민감 경로로 보고 승인을 묻는다. 거절됐거나 승인할 수 없는 환경이면 내용을 보여 주고, 다시 실행해 승인하거나 직접 만들라고 안내한다.

```
## 감지
- 지침 파일 방식: 기본 / AGENTS (이유: ...)
- 스택: ...
- 확인한 명령: ... (실행 결과)
- 실행하지 않은 명령: ... (이유)

## 적용
- 생성: ...
- 병합: ... (무엇을 추가했는지)

## 팀이 정할 것
- [ ] {{...}}로 남은 항목
- [ ] 커밋·PR (요청하면 진행)
```

커밋은 사용자가 요청할 때만 한다. 다만 보고 마지막에 다음을 안내한다:

> 다음 작업을 시작하기 전에 세팅을 **별도 커밋**으로 먼저 정리하세요: `/team-ai:commit` (메시지 예: `chore: Claude Code 팀 세팅`). 세팅 파일이 기능 커밋에 섞이지 않게 하기 위해서입니다.
