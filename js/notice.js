document.addEventListener('DOMContentLoaded', async () => {
  const items = await ChamverseApp.getContents();
  const list = document.querySelector('.notice-list');
  const tabs = [...document.querySelectorAll('.tab')];
  const notices = items.slice(0, 4).map((item, index) => `${index === 0 ? '[공지] ' : ''}${item.title} 업데이트 안내`);
  const questions = ['CHAMVERSE는 어떤 서비스인가요?', '다운로드 콘텐츠는 어디서 확인하나요?', '찜한 콘텐츠는 어떻게 삭제하나요?', '이용권은 어디서 변경할 수 있나요?'];
  const render = (entries) => {
    list.innerHTML = entries.map((entry) => `<button class="menu-row" data-notice="${entry}">${entry}<b>›</b></button>`).join('');
  };
  render(notices);
  tabs.forEach((tab, index) => tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.toggle('active', item === tab));
    render(index === 0 ? notices : questions);
  }));
  list.addEventListener('click', (event) => {
    const notice = event.target.closest('[data-notice]');
    if (notice) ChamverseApp.showToast(notice.dataset.notice);
  });
});
