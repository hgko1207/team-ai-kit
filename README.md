# team-ai-kit

팀이 Claude Code를 **같은 규칙, 같은 안전장치, 같은 작업 흐름**으로 쓰게 해 주는 플러그인입니다. 저장소에서 `/team-ai:setup` 한 번이면 그 저장소에 맞는 CLAUDE.md, 권한, VS Code 설정이 생기고, 팀원은 clone만 하면 같은 환경을 갖습니다. 혼자 쓰는 개인 프로젝트에도 그대로 쓸 수 있습니다.

- 위험한 작업은 항상 막습니다: `.env`·키 파일 수정, 강제 push, 전체 삭제 같은 명령
- 계획 → 구현 → 검증 → 커밋 흐름을 명령 하나씩으로 씁니다
- Windows + VS Code 환경을 고려했습니다 (Bash와 PowerShell 둘 다 지원)

## 명령을 어디에 입력하나

| 표시 | 어디에 |
|---|---|
| **[터미널]** | VS Code 메뉴 **터미널 → 새 터미널** (`` Ctrl+` ``) |
| **[Claude]** | VS Code 왼쪽 Claude 아이콘으로 연 대화창 |

## 설치 (PC마다 한 번)

준비물: Claude Code, [Node.js](https://nodejs.org) LTS, Git. **Node가 없으면 안전장치가 아무 말 없이 꺼집니다.**

[터미널]에서:

```
claude plugin marketplace add hgko1207/team-ai-kit
claude plugin install team-ai@team-ai-kit
```

설치한 뒤 Claude 대화를 **새로 엽니다.**

## 쓰는 법

### 내 저장소에 처음 세팅할 때 (개인, 팀 리드)

VS Code로 저장소 폴더를 열고 [Claude]에서:

```
/team-ai:setup
```

저장소를 읽고 스택과 빌드·테스트 명령을 찾아 CLAUDE.md, plan.md, 권한, 훅, VS Code 설정을 만듭니다. 이미 있는 파일은 덮어쓰지 않고 합칩니다. 무엇을 바꿀지 먼저 보려면 `/team-ai:setup --dry-run`. 자세한 과정은 [docs/QUICKSTART.md](docs/QUICKSTART.md).

세팅을 커밋하면 팀원 모두에게 적용됩니다.

### 팀원 (누가 이미 세팅해 둔 저장소)

1. 저장소를 받아 VS Code로 엽니다. "폴더를 신뢰하시겠습니까?"에서 **신뢰**.
2. 팀 플러그인 설치 안내가 뜨면 승인합니다. 안 뜨면 위 "설치"의 두 줄을 실행합니다.
3. 끝입니다. 저장소의 `docs/ai-workflow.md`에 팀 사용법이 있습니다.

### 매일 쓰는 명령 ([Claude]에 입력)

| 할 일 | 명령 |
|---|---|
| 큰 작업 전에 계획 | `/team-ai:plan-feature 무엇을 할지` → plan.md에 계획을 적고 멈춤. 읽고 승인 |
| 구현 | `계획 승인. plan.md 다음 작업 구현해줘` |
| 검증 (타입체크·린트·테스트 실제 실행) | `/team-ai:verify` |
| PR 전 자가 리뷰 | `/team-ai:review-pr` |
| 커밋 (비밀값·브랜치 확인 후 나눠서) | `/team-ai:commit` |

### 선택 기능

필요할 때 설치합니다: `claude plugin install team-ai-extras@team-ai-kit`

| 기능 | 명령 |
|---|---|
| 근본 원인부터 찾는 버그 수정 | `/team-ai-extras:fix-issue 증상` |
| 안전망 먼저, 작은 단계 리팩터링 | `/team-ai-extras:refactor 대상` |
| 커밋·검증 확인 후 push와 PR 만들기 | `/team-ai-extras:open-pr` |
| 코드 변경으로 틀린 문서 고치기 | `/team-ai-extras:update-docs` |
| 지적이 맞는지 반대로 검증 | `verifier 에이전트로 이 지적이 맞는지 확인해줘` |

## 들어 있는 것

```
.claude-plugin/marketplace.json
plugins/
├── team-ai/                  기본
│   ├── skills/  setup, plan-feature, verify, review-pr, commit
│   └── hooks/   보호 경로 차단, 위험 명령 차단, 수정 후 포맷, 대화 압축 후 남은 작업 다시 알림
└── team-ai-extras/           선택
    ├── skills/  fix-issue, refactor, open-pr, update-docs
    └── agents/  verifier
examples/rules/               스택 규칙 예시 (TS 웹, Python, Java/Spring, C#/.NET, Kotlin/Android)
docs/                         QUICKSTART, VS Code·Windows 참고
test/run-hook-tests.js        훅 테스트
```

## 알아둘 것

- **업데이트**: [터미널]에서 `claude plugin marketplace update team-ai-kit` → `claude plugin update team-ai@team-ai-kit` → 대화 새로 열기.
- **훅과 권한 규칙은 실수 방지 장치이지 보안 경계가 아닙니다.** 스크립트를 통한 간접 접근이나 새로운 우회 표기까지 모두 막지는 못합니다. 비밀값은 저장소 밖에 두세요.
- 기본 보호 목록(`.env`, 키 파일, `secrets/`, `.git/`)과 보호 브랜치(main, master 등)는 훅에 들어 있어 팀 설정으로 풀 수 없습니다. 저장소에만 필요한 보호는 `.claude/team-ai.json`에 더합니다.
- 설정 파일(`.claude/settings*.json`, `.claude/team-ai.json`)은 Claude가 고칠 수 없게 막혀 있습니다. 안전장치를 Claude가 스스로 풀지 못하게 하려는 것이라 사람이 편집기로 고칩니다.
- 회사망에서 GitHub에 접근할 수 없으면 [docs/QUICKSTART.md](docs/QUICKSTART.md)의 "GitHub에 접근할 수 없을 때".
- Windows 팀은 [docs/vscode-windows.md](docs/vscode-windows.md)를 한 번 보세요.

## 고치는 사람용

```
node test/run-hook-tests.js
claude plugin validate .
claude plugin validate ./plugins/team-ai
claude plugin validate ./plugins/team-ai-extras
```

고친 뒤에는 `marketplace.json`과 각 `plugin.json`의 version, `CHANGELOG.md`를 함께 올립니다. 버전이 같으면 설치된 PC는 예전 캐시를 계속 씁니다. 차단 우회를 찾으면 `test/run-hook-tests.js`에 먼저 추가하고 고칩니다.

## 만든 사람

[규니의 개발블로그](https://hgko-dev.tistory.com)에 써 온 Claude Code 작업 방식을 플러그인으로 묶었습니다. 플러그인 없이 파일 복사로 안전장치만 쓰고 싶으면 [claude-code-starter-kit](https://github.com/hgko1207/claude-code-starter-kit)을 보세요. MIT 라이선스입니다.
