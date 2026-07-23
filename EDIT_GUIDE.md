# CHAMVERSE 화면 수정 가이드

## 가장 먼저 볼 파일

이 프로젝트는 같은 카드, 헤더, 하단 메뉴를 여러 화면에서 반복 사용합니다. 그래서 공통 UI는 한 곳에서 관리하고, 각 화면 파일은 해당 화면을 선택하고 추가 스타일 또는 동작을 적는 구조입니다.

| 수정하려는 항목 | 수정할 파일 | 찾을 내용 |
| --- | --- | --- |
| 작품명, 장르, 포스터, 소개글 | `data/contents.json` | `title`, `genre`, `poster`, `description` |
| 공통 헤더와 하단 메뉴 | `common.html`, `common.css`, `common.js` | `.common-header`, `.common-nav`, `mountCommonUi()` |
| 화면의 문구·섹션·링크 | 해당 `html/*.html` | 실제 `<section>`과 `<button>` 마크업 |
| 메인 화면의 데이터 카드 | `js/main.js` | `renderCards()`와 `getContents()` |
| 검색·상세·라이브 | `js/search.js`, `js/play.js`, `js/live.js` | 페이지별 DOM 선택 코드 |
| 찜·마이페이지·다운로드 | `js/wish.js`, `js/myPage.js`, `js/download.js` | 페이지별 목록 생성 코드 |
| 설정·알림·이용권 | 해당 `js/*.js` | 토글과 버튼 클릭 코드 |
| 캐릭터 투표·랭킹 | `js/vote.js`, `js/ranking.js` | 선택 카드와 랭킹 생성 코드 |
| 특정 화면의 모든 여백·색상·카드·버튼 | 같은 이름의 `css/*.css` | 파일 전체가 해당 화면 전용 |
| 특정 화면의 모든 데이터·클릭 동작 | 같은 이름의 `js/*.js` | 파일 전체가 해당 화면 전용 |

## 안전하게 수정하는 순서

1. **작품 카드의 제목과 이미지를 바꾸려면** `data/contents.json`을 수정합니다.
   - `poster` 경로는 HTML 폴더 기준입니다. 예: `../images/contents/id-01.jpg`
   - `id`는 상세 페이지와 연결되므로 기존 값은 바꾸지 않는 편이 안전합니다.
2. **모든 화면의 주요 색상을 바꾸려면** `css/common.css` 상단의 `:root` 변수를 수정합니다.
   - `--coral`: 주요 버튼과 선택 상태
   - `--cream`: 배너와 검색창 배경
   - `--ink`: 기본 글자색
3. **한 화면만 꾸미려면** 해당 화면 CSS 파일에서 바로 수정합니다. 예를 들어 로그인 화면의 모든 스타일은 `css/login.css`에만 있습니다.
4. **메뉴나 카드의 구조·순서를 바꾸려면** 해당 `html/*.html`의 `<section>` 블록을 수정합니다.

## HTML 파일의 역할

각 `html/*.html`에는 실제 화면 마크업이 모두 들어 있습니다. 공통 CSS와 해당 페이지 CSS, 공통 JS와 해당 페이지 JS를 불러옵니다.

예를 들어 메인 화면은 아래 설정을 사용합니다.

```html
<body data-page="main">
```

`data-page`와 `data-static-page` 값은 그대로 두고, 화면 내용은 바로 아래의 HTML 태그를 수정하세요. 로그인·회원가입·인트로를 제외한 앱 화면은 `data-use-common-ui="true"`로 공통 헤더와 메뉴를 자동 적용합니다.

## JS 파일의 역할

`js/common.js`는 JSON 로딩, 카드 HTML 생성, 토스트 메시지처럼 여러 페이지에서 함께 쓰는 도우미 파일입니다.

- `window.Chamverse.getContents()` : `contents.json` 데이터 로딩
- `window.Chamverse.posterMarkup()` : 작품 카드 HTML 생성
- `window.Chamverse.showToast()` : 토스트 메시지 표시

각 화면 JS 파일은 해당 HTML의 요소를 직접 제어합니다. 예를 들어 메인 카드 목록은 `js/main.js`, 로그인 검증은 `js/login.js`에서 수정합니다.

## CSS 파일의 역할

`css/common.css`에는 기본 글꼴·색상 변수·초기화와 공통 헤더·하단 메뉴만 있습니다. 카드·버튼·목록 같은 화면 UI와 반응형 규칙은 모두 페이지 전용 CSS에 있습니다. 예를 들어 메인 배너는 `css/main.css`에서 바로 수정합니다.

```css
/* 메인 배너만 높이를 변경하는 예시 */
.main-page .hero {
  min-height: 420px;
}
```

## 자주 쓰는 클래스

- `.section`, `.section-title` : 섹션 여백과 제목
- `.card-row` : 가로 스크롤 카드 목록
- `.poster-card`, `.poster` : 작품 카드와 포스터
- `.primary-btn`, `.secondary-btn` : 주요·보조 버튼
- `.tabs`, `.tab` : 탭 메뉴
- `.menu-list`, `.menu-row` : 설정/마이페이지 목록
- `.toggle` : 스위치
