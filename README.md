# team-ai-kit

Claude Code에 **안전장치와 작업 순서**를 넣어 주는 무료 플러그인입니다. 혼자 써도, 팀이 같이 써도 됩니다.

- `.env` 수정, 강제 push, 전체 삭제 같은 위험한 작업을 막아 줍니다
- "계획 → 구현 → 검증 → 커밋"을 명령 하나씩으로 합니다
- Windows + VS Code에서 바로 동작합니다

## 3단계로 끝

준비물: Claude Code, [Node.js](https://nodejs.org) LTS, Git (**Node가 없으면 안전장치가 조용히 꺼집니다**)

**1. 설치 (PC마다 한 번)**: VS Code 메뉴 **터미널 → 새 터미널**에 두 줄을 붙여 넣습니다.

```
claude plugin marketplace add hgko1207/team-ai-kit
claude plugin install team-ai@team-ai-kit
```

터미널에서 `claude` 명령이 없다고 나오면(VS Code 확장만 설치한 경우) Claude 대화창에 `/plugin marketplace add hgko1207/team-ai-kit`과 `/plugin install team-ai@team-ai-kit`을 입력해도 됩니다.

**2. 세팅 (저장소마다 한 번)**: VS Code로 저장소 폴더를 열고, 왼쪽 **Claude 아이콘** 대화창에 입력합니다.

```
/team-ai:setup
```

저장소를 읽고 CLAUDE.md, 권한, 안전장치, VS Code 설정을 만들어 줍니다. 이미 있는 파일은 덮어쓰지 않고 합칩니다. 바꿀 내용만 먼저 보려면 `/team-ai:setup --dry-run`.

**3. 커밋**: 만들어진 파일을 커밋하고 push합니다. 팀이라면 이제 팀원 모두에게 적용됩니다.

## 나는 누구인가

| 나는 | 할 일 |
|---|---|
| 혼자 쓰는 개인 | 위 1~3단계. 끝 |
| 팀 리드 | 팀 저장소에서 1~3단계 |
| 팀원 (누가 이미 세팅한 저장소) | 저장소를 받아 VS Code로 열고 **신뢰** → 플러그인 설치 안내가 뜨면 **승인**. 안 뜨면 1단계 두 줄 실행 |
| 회사 PC에서도 쓰고 싶다 | 회사 PC에서 1단계만 다시. 회사망에서 GitHub가 막혀 있으면 [QUICKSTART](docs/QUICKSTART.md)의 "GitHub에 접근할 수 없을 때" |

설치하거나 업데이트한 뒤에는 Claude 대화를 **새로 열어야** 적용됩니다. 세팅 과정을 자세히 보려면 [docs/QUICKSTART.md](docs/QUICKSTART.md).

## 매일 쓰는 명령 (Claude 대화창에 입력)

| 할 일 | 명령 |
|---|---|
| 큰 작업 전에 계획 | `/team-ai:plan-feature 무엇을 할지` → plan.md에 계획을 적고 멈춤. 읽고 승인 |
| 구현 | `계획 승인. plan.md 다음 작업 구현해줘` |
| 검증 (타입체크·린트·테스트 실제 실행) | `/team-ai:verify` |
| PR 전 자가 리뷰 | `/team-ai:review-pr` |
| 커밋 (비밀값·브랜치 확인 후 나눠서) | `/team-ai:commit` |

## 선택 기능

필요할 때 터미널에서 설치합니다: `claude plugin install team-ai-extras@team-ai-kit`

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

- **업데이트**: 터미널에서 `claude plugin marketplace update team-ai-kit` → `claude plugin update team-ai@team-ai-kit` → 대화 새로 열기.
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

## 함께 쓰는 도구

| 이럴 때 | 저장소 |
|---|---|
| 플러그인 없이 파일 복사로 안전장치만 | [claude-code-starter-kit](https://github.com/hgko1207/claude-code-starter-kit) |
| 저장소 세팅 상태를 먼저 진단하고 싶다 (설치형 앱) | [cc-checkup](https://github.com/hgko1207/cc-checkup) |

## 만든 사람

[규니의 개발블로그](https://hgko-dev.tistory.com)에 써 온 Claude Code 작업 방식을 플러그인으로 묶었습니다. MIT 라이선스입니다.
