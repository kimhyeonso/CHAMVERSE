/** 인트로 화면 전용 동작: 시작 버튼은 HTML 링크로 관리합니다. */
document.querySelector('.intro-cta')?.addEventListener('click', () => {
  sessionStorage.setItem('chamverse-visited', 'true');
});
