document.addEventListener('DOMContentLoaded', async () => {
  ChamverseApp.showLoading(document.getElementById('wishList'));
  const [items, profiles] = await Promise.all([ChamverseApp.getContents(), ChamverseApp.getProfiles()]);
  const wishList = document.getElementById('wishList');
  let category = '전체';

  const lastWatching = ChamverseApp.read(ChamverseApp.KEY.continueWatching, [])[0];
  const continuing = items.find((item) => item.id === lastWatching?.contentId) || items.find((item) => ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(item.id)) || items[0];
  const banner = document.querySelector('.continue-banner');
  if (banner && continuing) {
    /* thumbnail 데이터 경로가 없을 때도 깨지지 않도록 실제 포스터를 우선 사용합니다. */
    banner.querySelector('img').src = continuing.poster || continuing.thumbnail;
    banner.querySelector('img').alt = continuing.title;
    banner.querySelector('h3').textContent = continuing.title;
    banner.querySelector('p').textContent = continuing.description;
    banner.querySelector('.progress span').style.setProperty('--value', `${Math.round((lastWatching?.progress || 0.25) * 100)}%`);
  }

  const render = () => {
    let selected = items.filter((item) => ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(item.id));
    if (category === '시리즈') selected = selected.filter((item) => item.episode > 12);
    if (category === '극장판') selected = selected.filter((item) => item.episode <= 12);
    wishList.innerHTML = selected.length
      ? selected.map((item) => ChamverseApp.createCard(item, { action: 'wish' })).join('')
      : `<div class="wish-empty"><img src="${profiles[0]?.image || '../images/profile/profile01.png'}" alt="울고 있는 캐릭터"><div><h3>아직 찜한 작품이 없어요</h3><p>마음에 드는 애니를 찜하면<br>여기에서 모아볼 수 있어요.</p><a class="primary-btn" href="main.html">콘텐츠 둘러보기</a></div></div>`;
    ChamverseApp.finishLoading(wishList);
  };

  render();
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    category = tab.textContent.trim();
    document.querySelectorAll('.tab').forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', String(isActive));
    });
    render();
  }));
  wishList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-wish]');
    if (!button) return;
    event.preventDefault();
    ChamverseApp.toggleId(ChamverseApp.KEY.wish, button.dataset.wish);
    ChamverseApp.showToast('찜 목록에서 삭제했어요.');
    render();
  });
});
