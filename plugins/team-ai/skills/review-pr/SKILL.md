---
name: review-pr
description: 현재 브랜치의 변경사항을 AI 코드 리뷰 6단계(의도·패키지 실존·경계값·숨은 가정·실패 경로·자동 검증)와 CLAUDE.md 규칙으로 리뷰한다. PR 전 자가 리뷰나 "리뷰해줘" 요청 때 사용한다. 코드는 고치지 않는다.
disable-model-invocation: true
argument-hint: "[기준 브랜치, 기본 main]"
allowed-tools:
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(git fetch *)
  - PowerShell(git diff *)
  - PowerShell(git log *)
  - PowerShell(git fetch *)
---

# PR 자가 리뷰

AI가 쓴 코드는 사람이 쓴 코드보다 **더 그럴듯하게 틀린다.** 읽기 좋은지가 아니라 맞는지를 본다. 리뷰만 하고 코드는 고치지 않는다.

## 준비

1. 기준 브랜치: 인자가 있으면 그것, 없으면 `main`(없으면 `master`).
2. `git fetch origin` (실패해도 계속) → `git diff --stat origin/<기준>...HEAD` → `git diff origin/<기준>...HEAD`. 원격이 없으면 로컬 `<기준>...HEAD`.
3. CLAUDE.md의 규칙·하지 말 것, plan.md의 해당 작업 항목을 읽는다.

## 6단계

1. **의도 확인** — plan.md의 목표·안 하는 것과 diff를 대조한다. 요청하지 않은 변경, 빠진 요구사항을 찾는다.
2. **import·패키지 실존** — 새로 쓴 패키지·모듈·함수가 실제로 있는지 확인한다. 매니페스트(package.json 등)와 lockfile에 있는지, import한 경로의 파일과 export가 있는지 본다. 없는 API를 지어낸 경우가 가장 흔하다.
3. **경계값** — null·빈 값·0·최댓값·음수·시간대·인코딩. 바뀐 함수마다 이 입력이 들어오면 어떻게 되는지 본다.
4. **숨은 가정** — 순서, 동시성, 항상 존재한다고 가정한 설정·파일·네트워크, 단일 사용자 가정.
5. **실패 경로** — 빈 catch, 삼킨 에러, 로그만 남기고 계속 가는 코드, 부분 실패 후 상태.
6. **자동 검증** — `verify`로 검증 명령을 돌린다. 추가로 diff에서 비밀값 패턴(`api_key`, `secret`, `password`, `token`, `BEGIN PRIVATE KEY`, 긴 base64 문자열)을 검색한다.

확실하지 않은 지적은 "확인 필요"로 둔다. 추측한 시나리오로 문제를 만들지 않는다. 실제 호출부나 입력을 찾았을 때만 지적한다.

## 보고 형식

```
## 요약
(변경 2~3줄) — 머지 가능 / 수정 후 머지 / 재작업

## 반드시 고칠 것
- file:line — 문제 — 근거(입력→결과) — 제안

## 고치면 좋은 것
- file:line — ...

## 확인 필요
- ...

## 자동 검증
- 검증 명령 결과, 비밀값 검색 결과
```
