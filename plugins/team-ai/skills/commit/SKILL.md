---
name: commit
description: 변경사항을 팀 커밋 규칙에 맞춰 목적별로 나눠 커밋한다. 비밀값과 브랜치를 확인하고, 푸시는 하지 않는다.
disable-model-invocation: true
argument-hint: "[커밋 메시지 힌트]"
allowed-tools:
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(git branch --show-current)
  - Bash(git rev-parse *)
  - Bash(git commit *)
  - PowerShell(git status *)
  - PowerShell(git diff *)
  - PowerShell(git log *)
  - PowerShell(git branch --show-current)
  - PowerShell(git rev-parse *)
  - PowerShell(git commit *)
---

# 팀 규칙 커밋

## 순서

1. **브랜치 확인**: 기본 브랜치(main/master)이면 커밋하지 않고 브랜치 이름을 제안한다. 사용자가 그래도 진행하라고 하면 진행한다.
2. **변경 확인**: `git status`, `git diff`, `git log --oneline -5`(기존 메시지 스타일 참고).
3. **비밀값 확인**: `.env*`, 키 파일, 인증서가 변경에 있거나, diff에 `api_key`, `secret`, `password`, `token`, `BEGIN PRIVATE KEY` 같은 값이 있으면 멈추고 알린다.
4. **나누기**: 목적이 다른 변경이 섞여 있으면 나누는 방법을 보여 준다. 기능 변경과 리팩터링은 섞지 않는다.
5. **스테이징**: 관련 파일만 `git add <파일>`. `git add -A`, `git add .`는 쓰지 않는다.
6. **커밋**: 메시지를 보여 주고 커밋한다. 힌트 인자가 있으면 반영한다.

## 메시지

CLAUDE.md(가져온 AGENTS.md 포함)의 커밋 규칙을 따른다. 없으면 Conventional Commits.

```
<type>(<범위>): <무엇이 달라지는지, 50자 안팎>

<필요하면 본문: 이유, 영향, Refs #이슈>
```

type: `feat` `fix` `refactor` `test` `docs` `chore` `perf` `build` `ci`

## 규칙

- 푸시, 강제 푸시, 리베이스, amend는 하지 않는다. 사용자가 명시적으로 요청한 경우만 예외다.
- 커밋 훅이 실패하면 `--no-verify`로 우회하지 말고 원인을 고친다.
- plan.md 항목을 끝낸 커밋이면 해당 항목이 `[x]`인지 확인한다.
