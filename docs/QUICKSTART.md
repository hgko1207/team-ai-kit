# 빠른 시작 — 내 저장소에 team-ai-kit 적용하기

> 대상: 저장소 하나에 키트를 처음 적용하는 개인 개발자나 팀 리드. 약 20~30분.
> 누가 이미 세팅해 둔 저장소를 받은 팀원이면 이 문서 대신 [README.md](../README.md)의 "팀원" 절만 보면 된다.

## 표시와 용어

| 표시 | 어디에 입력하나 |
|---|---|
| **[터미널]** | VS Code 메뉴 **터미널 → 새 터미널** (`` Ctrl+` ``). PowerShell이어도 된다 |
| **[Claude 입력창]** | VS Code 왼쪽 Claude 아이콘으로 연 대화창 |

- **마켓플레이스**: 플러그인을 내려받는 저장소. 이 키트 저장소(`team-ai-kit`)가 마켓플레이스다.
- **플러그인**: 스킬과 훅을 묶은 설치 단위. 기본은 `team-ai`, 선택은 `team-ai-extras`.
- **스킬**: `/team-ai:setup`처럼 [Claude 입력창]에서 이름으로 부르는 작업 절차.
- **훅**: 파일 수정이나 명령 실행 직전에 자동으로 도는 검사. 위험한 작업을 막는다.

## 준비물

| 필요한 것 | 확인 방법 | 없으면 |
|---|---|---|
| Claude Code **CLI** | [터미널]에서 `claude --version` | [터미널]에서 `irm https://claude.ai/install.ps1 \| iex` (macOS: `curl -fsSL https://claude.ai/install.sh \| bash`). 설치 후 `claude`를 한 번 실행해 로그인한다. VS Code 확장만 깔면 이 명령은 생기지 않는다 |
| Node.js | [터미널]에서 `node --version` | [nodejs.org](https://nodejs.org)에서 LTS 설치. **없으면 차단 훅이 아무 말 없이 꺼진다** |
| Git 저장소 | 적용할 폴더에 `.git`이 있는지 | `git init`. 커밋 안 된 작업은 먼저 커밋하거나 따로 둔다 |

## 1. 설치 (한 번만, 2분)

[터미널]에서:

```
claude plugin marketplace add hgko1207/team-ai-kit
claude plugin install team-ai@team-ai-kit
```

- 설치는 PC마다 한 번이다. 이후 모든 프로젝트에서 쓸 수 있다.
- 회사가 키트 사본을 따로 두었다면 `hgko1207/team-ai-kit` 대신 그 저장소 주소를 쓴다.
- [Claude 입력창]에서 `/plugin marketplace add ...`, `/plugin install ...`으로 해도 같다.

설치 후 **Claude 대화를 새로 연다.** 설치 전에 시작한 대화에서는 `/team-ai:...` 명령이 보이지 않는다.

### GitHub에 접근할 수 없을 때

사내망 정책으로 github.com에 접근할 수 없는 회사는 키트 저장소를 사내에 복사해 두고 그 주소로 설치한다. `marketplace add`는 GitHub 저장소 이름 말고도 git 주소나 폴더 경로를 받는다.

```
claude plugin marketplace add https://git.사내주소/<그룹>/team-ai-kit.git
claude plugin marketplace add \\공유서버\tools\team-ai-kit
```

- 저장소의 `.claude/settings.json`에 있는 `extraKnownMarketplaces`의 `source`도 같은 주소로 바꾼다. 그래야 팀원에게 설치 안내가 뜬다. 형식은 공식 문서(plugin marketplaces)에서 현재 키 이름을 확인한다.
- 업데이트는 사내 저장소에 새 버전을 올린 뒤 같은 `marketplace update` → `plugin update` 순서다.

## 2. 세팅 적용 (10분)

VS Code로 저장소 폴더를 열고(폴더 신뢰를 물으면 **신뢰**), [Claude 입력창]에서:

1. `/team-ai:setup --dry-run` — 무엇을 만들고 합칠지 보고만 받는다. 파일은 바뀌지 않는다.
2. 보고가 괜찮으면 `/team-ai:setup`.
   - 기본 브랜치에 있으면 `chore/claude-setup` 브랜치를 만들자고 한다. 따른다.
   - CLAUDE.md도 AGENTS.md도 없으면 "Codex 같은 다른 AI 도구도 쓰나요?"를 묻는다. 예라고 하면 공통 규칙은 `AGENTS.md`에, Claude 전용 안내는 `CLAUDE.md`에 둔다(CLAUDE.md 첫 줄 `@AGENTS.md`가 AGENTS.md를 가져온다). AGENTS.md가 이미 있으면 묻지 않고 이 방식을 제안한다.
   - 타입체크·린트·테스트를 **실제로 실행**해서 확인한다. 몇 분 걸릴 수 있다.
   - **승인 창이 뜬다.** `.claude/`·`.vscode/` 아래에 새 파일을 만들 때 Claude Code가 민감 경로라며 묻는다. 내용을 보고 승인한다.
   - 이미 `.claude/settings.json`이 있으면 Claude가 직접 고치지 못한다(키트가 막는다). 합친 **전체 내용**을 보여 주니, 편집기로 `.claude/settings.json`을 열어 내용을 전부 지우고 그대로 붙여 넣은 뒤 저장한다.
3. 보고 마지막의 "팀이 정할 것"을 확인하고, CLAUDE.md(AGENTS 방식이면 AGENTS.md)를 한 번 읽어 틀린 곳을 고친다.
4. 세팅을 **별도 커밋**으로 정리한다: `/team-ai:commit` (예: `chore: Claude Code 팀 세팅`).

## 3. 첫 작업 한 바퀴 (10~15분)

스킬은 **이름으로 부르는 것이 기본**이다. "계획 세워줘"처럼 말로도 동작하지만 매번 자동으로 불리지는 않는다.

| 순서 | [Claude 입력창]에 입력 | 기대하는 것 |
|---|---|---|
| 계획 | `/team-ai:plan-feature <무엇을 할지>` | plan.md "다음 작업"에 목표·변경 파일·검증·안 하는 것·멈춤 조건을 적고 **멈춘다** |
| 검토 | 직접 plan.md를 읽고 고칠 점을 말한다 | 계획 수정 |
| 구현 | `계획 승인. plan.md 다음 작업 구현해줘` | 기존 코드 패턴을 따라 구현, 수정한 파일은 자동 포맷 |
| 검증 | `/team-ai:verify` | 검증 명령을 실제로 실행, 테스트 변경은 "사람 확인 필요"로 표시, 통과한 항목은 완료로 이동 |
| 리뷰 | `/team-ai:review-pr` | 6단계 리뷰. 코드는 고치지 않는다 |
| 커밋 | `/team-ai:commit` | 브랜치·비밀값 확인 후 관련 파일만 커밋. 푸시는 하지 않는다 |

## 4. 안전장치 확인 (2분)

새 대화를 열고 [Claude 입력창]에서:

| 해 볼 것 | 기대 결과 |
|---|---|
| `.env.test 파일을 만들고 A=1 한 줄 넣어줘` | 훅이 "보호 경로라서 수정할 수 없습니다"로 막는다. 파일이 만들어지면 Node와 훅 설치를 확인하고 그 파일은 지운다 |
| `git push --force origin main 해줘` | 막힌다 |
| 일반 소스 파일 수정 | 통과하고 포맷이 적용된다 |

## 자주 막히는 곳

| 증상 | 원인 | 해결 |
|---|---|---|
| `/team-ai:...` 명령이 안 보인다 | 설치 후 대화를 새로 열지 않음 | 새 대화를 연다. 그래도 없으면 VS Code에서 `Ctrl+Shift+P` → "Developer: Reload Window" |
| 모든 파일 수정·명령이 막힌다 | `.claude/team-ai.json` 문법 오류 | 사람이 직접 JSON을 고친다 (Claude는 고칠 수 없게 되어 있다) |
| 차단이 전혀 안 된다 | Node.js 없음 | Node 설치 후 창을 새로 연다 |
| 키트를 업데이트했는데 그대로다 | 버전을 올리지 않았거나 업데이트 명령을 안 함 | `claude plugin marketplace update team-ai-kit` → `claude plugin update team-ai@team-ai-kit` → 창 새로 열기 |
| 포맷 실패 메시지가 계속 나온다 | Windows에서 `.cmd`만 있는 도구 | `team-ai.json`의 `formatCommand`를 배열로, 로컬 패키지 이름으로 지정 |

## 걸리는 시간 (참고)

| 저장소 | 세팅 | 계획~검증 |
|---|---|---|
| 새 TypeScript CLI (파일 약 10개) | 약 8분 | 약 6분 |
| 기존 Astro 사이트 (CLAUDE.md·plan.md 있음) | 약 9분 | 약 4분 |
| 기존 Next.js + Cloudflare (CLAUDE.md 21줄, 배포 스크립트 있음) | 약 9분 | 약 7분 |

비대화형 자동 실행으로 잰 시간이다. 사람이 읽고 승인하는 시간은 별도다.
