document.addEventListener('DOMContentLoaded', async () => {
  ChamverseApp.showLoading(document.getElementById('downloadList'));
  const items = await ChamverseApp.getContents();
  const listElement = document.getElementById('downloadList');
  let category = '전체';
  let sort = 'recent';
  const render = () => {
    let downloaded = items.filter((item) => ChamverseApp.uniqueIds(ChamverseApp.KEY.downloads).includes(item.id));
    if (category === '시리즈') downloaded = downloaded.filter((item) => item.episode > 12);
    if (category === '극장판') downloaded = downloaded.filter((item) => item.episode <= 12);
    if (sort === 'title') downloaded.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    const usedMb = downloaded.reduce((sum, item) => sum + Math.max(120, Number(item.episode) || 120), 0);
    const totalMb = 5120;
    document.getElementById('storageUsed').textContent = usedMb >= 1024 ? `${(usedMb / 1024).toFixed(1)}GB` : `${usedMb}MB`;
    document.getElementById('storageTotal').textContent = '5GB';
    document.getElementById('storageBar').style.setProperty('--value', `${Math.min(100, (usedMb / totalMb) * 100)}%`);
    listElement.innerHTML = downloaded.length
      ? downloaded.map((item) => `<article class="download-item"><img src="${item.poster}" alt="${item.title}"><div><h3>${item.title}</h3><p>${item.description}</p><p>${Math.max(120, item.episode)}MB · 방금 다운로드 완료</p></div><button class="round-play" data-play="${item.id}">▶</button><button class="download-remove" data-remove="${item.id}">×</button></article>`).join('')
      : ChamverseApp.createEmptyState('다운로드한 콘텐츠가 없어요.', '콘텐츠 둘러보기', 'main.html');
    ChamverseApp.finishLoading(listElement);
  };
  render();
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    category = tab.textContent.trim();
    document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item === tab));
    render();
  }));
  document.getElementById('downloadSort')?.addEventListener('change', (event) => {
    sort = event.target.value;
    render();
  });
  listElement.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      ChamverseApp.toggleId(ChamverseApp.KEY.downloads, remove.dataset.remove);
      ChamverseApp.showToast('다운로드를 삭제했어요.');
      render();
      return;
    }
    const play = event.target.closest('[data-play]');
    if (play) location.href = `play.html?id=${play.dataset.play}`;
  });
});
