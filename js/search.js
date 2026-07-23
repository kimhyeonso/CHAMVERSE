document.addEventListener('DOMContentLoaded', async () => {
  ChamverseApp.showLoading(document.getElementById('trendingList'));
  const items = await ChamverseApp.getContents();
  const historyList = document.getElementById('historyList');
  const renderHistory = () => {
    const history = ChamverseApp.read(ChamverseApp.KEY.recentSearches, []);
    historyList.innerHTML = history.length
      ? history.map((keyword) => `<li><button class="history-keyword" data-keyword="${keyword}">${keyword}</button><button class="history-remove" data-keyword="${keyword}">×</button></li>`).join('')
      : '<li>최근 검색어가 없습니다.</li>';
  };
  const renderResults = (keyword) => {
    const normalized = keyword.toLowerCase();
    const found = items.filter((item) => item.title.toLowerCase().includes(normalized) || item.genre.some((genre) => genre.toLowerCase().includes(normalized)));
    document.getElementById('searchResults').innerHTML = found.length
      ? found.map((item) => ChamverseApp.createCard(item, { action: 'wish' })).join('')
      : ChamverseApp.createEmptyState('검색 결과가 없어요.', '추천 작품 보기', 'main.html');
    document.getElementById('searchResultSection').hidden = false;
  };

  document.getElementById('trendingList').innerHTML = items.filter((item) => item.isTop10).slice(0, 8).map((item) => ChamverseApp.createCard(item)).join('');
  ChamverseApp.finishLoading(document.getElementById('trendingList'));
  renderHistory();
  document.getElementById('searchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) return;
    ChamverseApp.addRecentSearch(keyword);
    renderHistory();
    renderResults(keyword);
  });
  historyList.addEventListener('click', (event) => {
    const keyword = event.target.dataset.keyword;
    if (!keyword) return;
    if (event.target.classList.contains('history-remove')) {
      ChamverseApp.removeRecentSearch(keyword);
      renderHistory();
      return;
    }
    document.getElementById('searchInput').value = keyword;
    renderResults(keyword);
  });
  document.getElementById('searchResults').addEventListener('click', (event) => {
    const wish = event.target.closest('[data-wish]');
    if (!wish) return;
    event.preventDefault();
    const added = ChamverseApp.toggleId(ChamverseApp.KEY.wish, wish.dataset.wish);
    ChamverseApp.showToast(added ? '찜 목록에 추가했어요.' : '찜 목록에서 삭제했어요.');
  });
});
