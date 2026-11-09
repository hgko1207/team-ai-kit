---
paths:
  - "src/main/java/**/*.java"
  - "src/test/java/**/*.java"
---

# Java / Spring 규칙 (예시)

<!-- setup 스킬이 대상 저장소에서 관찰한 내용으로 다시 쓴다. 이 파일은 형태 참고용. -->

## 구조
- controller → service → repository 방향으로만 의존한다. controller에서 repository를 직접 부르지 않는다.
- 요청·응답은 DTO로 받고 돌려준다. 엔티티를 API 응답으로 그대로 내보내지 않는다.

## 코드 스타일
- 생성자 주입을 쓴다. 필드 주입(`@Autowired` 필드)을 쓰지 않는다.
- 예외는 프로젝트의 공통 예외 타입으로 던지고, 전역 핸들러(`@RestControllerAdvice`)에서 응답으로 바꾼다.

## 이 스택의 함정
- 조회 루프 안에서 연관 엔티티를 지연 로딩해 N+1 쿼리를 만들지 않는다.
- 트랜잭션 경계(`@Transactional`)는 service 계층에 둔다.
- DB 스키마 변경은 마이그레이션 도구(Flyway/Liquibase) 파일로만 한다.

## 검증
- `./gradlew test`(또는 `mvn test`)로 바뀐 패키지의 테스트를 먼저 돌린다.
