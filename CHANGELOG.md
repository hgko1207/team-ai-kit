# CHANGELOG

## 0.4.0 — 2026-11-14

Claude Code와 Codex 같은 다른 AI 도구를 같이 쓰는 저장소 지원.

- setup에 AGENTS 방식 추가: 공통 규칙은 `AGENTS.md`, `CLAUDE.md`는 첫 줄 `@AGENTS.md`로 가져온 뒤 Claude 전용 안내만 둔다(공식 문서가 권하는 import 방식, Windows에서도 동작). CLAUDE.md·AGENTS.md가 둘 다 없으면 한 번 묻고, AGENTS.md만 있으면 이 방식을 제안한다.
- 대화 압축 후 재주입 훅이 `reinjectSections`의 섹션을 CLAUDE.md에서 못 찾으면 AGENTS.md에서 찾는다. AGENTS 방식이면 setup이 `검증 명령`, `하지 말 것`을 기본으로 넣는다.
- verify·review-pr·commit·plan-feature·open-pr·update-docs가 CLAUDE.md가 가져온 AGENTS.md도 함께 본다.

## 0.3.0 — 2026-11-10

첫 공개 버전(MIT).

- 기본 플러그인 `team-ai`: `setup`, `plan-feature`, `verify`, `review-pr`, `commit` 스킬과 보호 경로 차단, 위험 명령 차단, 수정 후 포맷, 대화 압축 후 남은 작업 다시 알림 훅.
- 선택 플러그인 `team-ai-extras`: `fix-issue`, `refactor`, `open-pr`, `update-docs` 스킬과 `verifier` 에이전트.
- 스택 규칙 예시 5종, 처음 쓰는 사람용 QUICKSTART, VS Code·Windows 참고 문서, 훅 테스트.
- setup이 마켓플레이스 주인을 기본 `hgko1207`로 채운다. 회사가 사본을 두었으면 그 주인으로 바꾼다.
