document.addEventListener('DOMContentLoaded', async () => {
  ChamverseApp.showLoading(document.getElementById('watchingList'));
  const [items, profiles] = await Promise.all([ChamverseApp.getContents(), ChamverseApp.getProfiles()]);
  const user = ChamverseApp.read(ChamverseApp.KEY.user, { name: '챔프', email: 'qwer@naver.com' });
  const profile = profiles.find((item) => item.id === user.profileId) || profiles[0];
  const account = document.querySelector('.account-card');
  if (account) {
    account.querySelector('img').src = profile?.image || '../images/profile/profile01.png';
    account.querySelector('h2').textContent = `${user.name} 님`;
    account.querySelector('p').textContent = user.email;
    account.querySelector('.badge').textContent = ChamverseApp.read(ChamverseApp.KEY.plan, '일반 회원권');
  }
  const watching = ChamverseApp.read(ChamverseApp.KEY.continueWatching, []);
  const list = watching.map((entry) => ({ item: items.find((content) => content.id === entry.contentId), progress: entry.progress })).filter((entry) => entry.item);
  document.getElementById('watchingList').innerHTML = (list.length ? list : items.slice(0, 5).map((item) => ({ item, progress: 0.25 })))
    .map((entry) => ChamverseApp.createCard(entry.item, { progress: entry.progress })).join('');
  ChamverseApp.finishLoading(document.getElementById('watchingList'));
  const counters = document.querySelectorAll('.counter');
  if (counters[0]) counters[0].textContent = `${ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).length}개`;
  if (counters[1]) counters[1].textContent = `${ChamverseApp.uniqueIds(ChamverseApp.KEY.downloads).length}개`;
  account?.querySelector('a').addEventListener('click', () => localStorage.removeItem(ChamverseApp.KEY.user));
});
