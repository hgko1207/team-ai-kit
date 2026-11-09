# VS Code · Windows 팀을 위한 참고

> 대상: Windows + VS Code 위주인 팀에 키트를 세팅하는 사람. 버전마다 동작이 바뀔 수 있으니 도입 때 한 번씩 직접 확인한다.

## 설치

- VS Code 확장(anthropic.claude-code)만 설치하면 터미널의 `claude` 명령은 생기지 않는다. 플러그인 설치·`claude doctor` 같은 CLI 작업을 하려면 CLI를 따로 설치한다.
- 훅이 Node.js로 실행되므로 팀원 PC에 Node가 있어야 한다. 없으면 훅이 실패한다.

## 권한 규칙은 Bash와 PowerShell을 같이 쓴다

Windows에서 Git Bash가 없으면 Claude Code는 Bash 도구 대신 PowerShell 도구를 쓴다. 이때 `Bash(...)` 규칙은 하나도 맞지 않는다. 그래서 settings.json에는 항상 짝으로 넣는다.

```json
"Bash(npm run lint *)", "PowerShell(npm run lint *)"
```

키트의 위험 명령 차단 훅도 Bash와 PowerShell 둘 다에 걸려 있다.

## 권한 우회 모드 막기

`.vscode/settings.json`의 `"claudeCode.allowDangerouslySkipPermissions": false`는 모드 선택기에서 권한 우회 모드를 없앤다. `.claude/settings.json`의 `"disableBypassPermissionsMode": "disable"`과 함께 둔다. 앞의 것은 VS Code 확장에만, 뒤의 것은 CLI에도 적용된다. 둘 다 팀원이 개인 설정으로 풀 수 있으므로, 회사 차원에서 꼭 잠가야 하면 아래 managed settings를 쓴다.

## 시작 권한 모드는 저장소가 정하지 못한다

VS Code 확장은 새 대화의 권한 모드를 사용자 설정(`claudeCode.initialPermissionMode`), 직전에 고른 모드, 사용자 또는 managed 설정의 `permissions.defaultMode` 순으로 정한다. 저장소의 `.vscode/settings.json`이나 `.claude/settings.json`은 여기에 쓰이지 않는다. 그래서 키트를 넣어도 팀원의 시작 모드는 각자 설정 그대로다.

- 저장소가 할 수 있는 것: `allow`, `ask`, `deny`와 훅. 이것들은 어느 모드에서든 적용된다. 되돌리기 어려운 명령은 `ask`나 훅으로 막는 이유다.
- 팀 전체의 시작 모드를 정해야 하면: managed settings.

## managed settings (조직 차원 강제)

회사 IT가 PC에 배포하는 설정으로, 개인 설정보다 우선하고 팀원이 풀 수 없다. Windows는 `C:\ProgramData\ClaudeCode\managed-settings.json`이다. 다음을 넣을 수 있다.

- `permissions.disableBypassPermissionsMode: "disable"`
- `permissions.defaultMode` (시작 모드)
- `strictKnownMarketplaces` (허용한 마켓플레이스만 설치)

배포는 회사 IT 정책(GPO, MDM)을 따른다. 공식 문서에서 현재 키 이름을 확인한 뒤 적용한다.

## 샌드박스가 없는 환경

Claude Code의 샌드박스는 macOS, Linux, WSL2에서 동작하고 네이티브 Windows에서는 쓸 수 없다. Windows 팀은 권한 규칙, 키트 훅, 그리고 git과 체크포인트(ESC 두 번으로 되감기)로 실수를 되돌린다. 작업 전에 브랜치를 만들고 작은 단위로 커밋하라고 안내한다.

## 승인 창의 저장 위치

권한 확인 창에서 "다시 묻지 않기"를 고르면 VS Code는 저장 위치로 공유 파일(`.claude/settings.json`)도 고를 수 있게 한다. 팀원 한 명의 클릭이 팀 전체 권한이 될 수 있으므로, 팀 가이드(`docs/ai-workflow.md`)에 "기본은 Local"을 적어 두었다. 키트의 보호 훅은 Claude가 설정 파일을 고치는 것을 막지만, 이 창은 사람이 고르는 것이라 막지 못한다.

## 읽기 차단(deny)의 한계

`Read(**/.env)` 같은 deny는 Claude의 파일 읽기 도구와 인식되는 셸 명령에는 적용되지만, 스크립트를 실행해 간접적으로 읽는 것까지 막지는 못한다. "실수 방지 장치이지 보안 경계는 아니다"로 이해해야 한다. 비밀값은 저장소 밖(비밀 관리 도구)에 두는 것이 원칙이다.

## .gitignore 예외

`.vscode/`를 통째로 무시하면 `!.vscode/settings.json`으로 되살릴 수 없다. git은 제외된 폴더 안의 파일을 다시 포함하지 않는다. 이렇게 바꾼다.

```gitignore
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
```

## 에이전트 메모리 범위

에이전트 frontmatter의 `memory: project`는 저장소 안에 저장되어 git으로 공유된다. 개인 메모로만 쓰려면 `memory: local`을 쓰고, `.claude/agent-memory-local/`을 .gitignore에 넣는다.

## 줄바꿈

`.sh` 스크립트를 함께 두는 경우 `.gitattributes`에 `*.sh text eol=lf`를 넣는다. 키트 훅은 Node 스크립트라 해당 없다.
