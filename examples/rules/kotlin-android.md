---
paths:
  - "**/*.kt"
  - "**/*.kts"
---

# Kotlin / Android 규칙 (예시)

<!-- setup 스킬이 대상 저장소에서 관찰한 내용으로 다시 쓴다. 이 파일은 형태 참고용. -->

## 구조
- 화면은 UI(Activity·Fragment·Composable), 상태는 ViewModel, 데이터는 Repository로 나눈다. 화면에서 네트워크·DB를 직접 부르지 않는다.
- 새 기능은 기존 기능 모듈과 같은 패키지 구조로 만든다.

## 코드 스타일
- `!!`를 쓰지 않는다. null이 가능한 값은 `?.`, `?:`, 이른 반환으로 처리한다.
- 포맷과 린트는 프로젝트 설정(ktlint·detekt 등)에 맡긴다.
- 문자열은 `strings.xml`에 둔다. 화면에 보이는 문장을 코드에 직접 쓰지 않는다.

## 이 스택의 함정
- 코루틴은 `viewModelScope`·`lifecycleScope`처럼 수명이 정해진 범위에서 띄운다. `GlobalScope`를 쓰지 않는다.
- 메인 스레드에서 네트워크·디스크 작업을 하지 않는다. `Dispatchers.IO`로 옮긴다.
- 의존성 버전은 버전 카탈로그(`libs.versions.toml`)나 기존 방식에 맞춰 한 곳에서 바꾼다.

## 검증
- `./gradlew lint`와 단위 테스트가 통과해야 한다. 기기·에뮬레이터가 필요한 테스트는 실행 전에 묻는다.
