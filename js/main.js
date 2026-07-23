document.addEventListener('DOMContentLoaded', async () => {
  ['topTenList', 'continueList', 'genreList'].forEach((id) => ChamverseApp.showLoading(document.getElementById(id)));
  const items = await ChamverseApp.getContents();
  const recommended = items.filter((item) => item.isRecommend);
  const hero = recommended[0] || items[0];
  const render = (target, list, options = {}) => {
    const element = document.getElementById(target);
    if (element) {
      element.innerHTML = list.map((item) => ChamverseApp.createCard(item, options)).join('');
      ChamverseApp.finishLoading(element);
    }
  };

  document.getElementById('heroTitle').textContent = hero.title;
  document.getElementById('heroDescription').textContent = hero.description;
  document.getElementById('heroPlay').href = `play.html?id=${hero.id}`;
  const heroWish = document.getElementById('heroWish');
  heroWish.dataset.contentId = hero.id;
  heroWish.textContent = ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(hero.id) ? '♥ 찜 취소' : '＋ 찜하기';

  render('topTenList', items.filter((item) => item.isTop10).slice(0, 10), { action: 'wish' });
  const continueList = ChamverseApp.read(ChamverseApp.KEY.continueWatching, []);
  const continueItems = continueList.map((entry) => ({ content: items.find((item) => item.id === entry.contentId), progress: entry.progress })).filter((entry) => entry.content);
  document.getElementById('continueList').innerHTML = (continueItems.length
    ? continueItems
    : recommended.slice(0, 6).map((content) => ({ content, progress: 0.25 })))
    .map((entry) => ChamverseApp.createCard(entry.content, { action: 'wish', progress: entry.progress })).join('');
  ChamverseApp.finishLoading(document.getElementById('continueList'));

  const genreList = document.getElementById('genreList');
  const renderGenre = (genre) => {
    const list = genre === '전체' ? items : items.filter((item) => item.genre.includes(genre));
    genreList.innerHTML = list.slice(0, 10).map((item) => ChamverseApp.createCard(item, { action: 'wish' })).join('');
    ChamverseApp.finishLoading(genreList);
  };
  renderGenre('전체');

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach((item) => item.classList.toggle('active', item === chip));
      renderGenre(chip.textContent.trim());
    });
  });

  document.addEventListener('click', (event) => {
    const wish = event.target.closest('[data-wish]');
    const heroButton = event.target.closest('#heroWish');
    const id = wish?.dataset.wish || heroButton?.dataset.contentId;
    if (!id) return;
    event.preventDefault();
    const added = ChamverseApp.toggleId(ChamverseApp.KEY.wish, id);
    ChamverseApp.showToast(added ? '찜 목록에 추가했어요.' : '찜 목록에서 삭제했어요.');
    if (heroButton) heroButton.textContent = added ? '♥ 찜 취소' : '＋ 찜하기';
  });
});
