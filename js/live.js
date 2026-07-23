document.addEventListener('DOMContentLoaded', async () => {
  const items = await ChamverseApp.getContents();
  const live = items.find((item) => item.isLive) || items.find((item) => item.isRecommend) || items[0];
  const schedule = [live, ...items.filter((item) => item.id !== live.id).slice(0, 3)];
  document.getElementById('livePoster').src = live.poster;
  document.getElementById('liveTitle').textContent = live.title;
  document.getElementById('liveDescription').textContent = live.description;
  document.getElementById('scheduleList').innerHTML = schedule.map((item, index) => `<div class="schedule-row"><strong>${index === 0 ? 'NOW' : 'NEXT'}</strong><div><h3>${item.title}</h3><p>${item.description}</p></div><button data-live-alert="${item.id}">${index === 0 ? '▶' : '알림'}</button></div>`).join('');
  document.getElementById('scheduleList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-live-alert]');
    if (!button || button.textContent === '▶') return;
    ChamverseApp.setToggle(ChamverseApp.KEY.notifications, `live-${button.dataset.liveAlert}`, true);
    button.textContent = '알림 설정됨';
    ChamverseApp.showToast('라이브 시작 알림을 설정했어요.');
  });
});
