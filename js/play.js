document.addEventListener('DOMContentLoaded', async () => {
  const [items, playData] = await Promise.all([ChamverseApp.getContents(), ChamverseApp.getPlayData()]);
  const id = Number(new URLSearchParams(location.search).get('id')) || items[0].id;
  const item = items.find((content) => content.id === id) || items[0];
  const detail = playData.find((content) => content.contentId === item.id) || {};
  const episodeCount = Math.min(5, Math.max(3, Math.ceil((item.episode || 12) / 500)));

  document.getElementById('playHero').style.backgroundImage = `url('${detail.background || item.poster}')`;
  document.getElementById('playTitle').textContent = item.title;
  document.getElementById('playMeta').innerHTML = `<span class="tag">${detail.seasonLabel || '시즌 1'}</span><span class="tag">${item.age || 'ALL'}세 이상</span><span>${item.genre.join(' · ')}</span><span>${item.year}</span>`;
  document.getElementById('playDescription').textContent = item.description;
  const seasonSelect = document.getElementById('seasonSelect');
  const seasonNames = (detail.seasonLabel || '시즌 1').includes('선택') ? ['시즌 1', '시즌 2', '시즌 3'] : [detail.seasonLabel || '시즌 1'];
  seasonSelect.innerHTML = seasonNames.map((season) => `<option>${season}</option>`).join('');
  seasonSelect.addEventListener('change', () => ChamverseApp.showToast(`${seasonSelect.value} 에피소드를 보고 있어요.`));
  document.getElementById('episodeList').innerHTML = Array.from({ length: episodeCount }, (_, index) => `<article class="episode"><img src="${item.poster}" alt="${item.title}"><div><h3>${index + 1}. ${item.title} ${index + 1}화</h3><p>${detail.runningTime || '약 24분'} · ${detail.country || '한국'}</p><p>${item.description}</p></div><button data-episode="${index + 1}">⋮</button></article>`).join('');

  document.getElementById('playButton').addEventListener('click', () => {
    ChamverseApp.setContinueWatching(item.id, 0.32);
    ChamverseApp.showToast('재생 위치를 저장했어요.');
  });
  document.getElementById('wishButton').addEventListener('click', () => {
    const added = ChamverseApp.toggleId(ChamverseApp.KEY.wish, item.id);
    ChamverseApp.showToast(added ? '찜 목록에 추가했어요.' : '찜 목록에서 삭제했어요.');
  });
  document.querySelector('[data-action="download"]').addEventListener('click', () => {
    const added = ChamverseApp.toggleId(ChamverseApp.KEY.downloads, item.id);
    ChamverseApp.showToast(added ? '다운로드 목록에 추가했어요.' : '다운로드 목록에서 삭제했어요.');
  });
  document.querySelector('[data-action="share"]').addEventListener('click', async () => {
    const link = location.href;
    if (navigator.clipboard) await navigator.clipboard.writeText(link);
    ChamverseApp.showToast('공유 링크를 복사했어요.');
  });
  document.querySelector('[data-action="rating"]').addEventListener('click', () => ChamverseApp.showToast(`평점 ${item.rating} 작품입니다.`));
});
