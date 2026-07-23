document.addEventListener('DOMContentLoaded', async () => {
  const items = (await ChamverseApp.getContents()).slice(0, 10);
  const votes = ChamverseApp.votes();
  const ranked = [...items].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0) || a.id - b.id);
  const total = Math.max(1, Object.values(votes).reduce((sum, value) => sum + value, 0) + ranked.length * 5);
  document.getElementById('podium').innerHTML = [ranked[1], ranked[0], ranked[2]].map((item, index) => `<div class="podium-item ${index === 1 ? 'first' : ''}"><div class="circle" style="background-image:url('${item.poster}')"></div><b>${index === 1 ? '1위' : index === 0 ? '2위' : '3위'} ${item.title}</b></div>`).join('');
  document.getElementById('rankingList').innerHTML = ranked.slice(3).map((item, index) => { const rate = Math.max(3, Math.round(((votes[item.id] || 5) / total) * 100)); return `<div class="rank-row"><b>${index + 4}</b><img src="${item.poster}" alt="${item.title}"><b>${item.title}</b><div class="progress"><span style="--value:${rate}%"></span></div><small>${rate}%</small></div>`; }).join('');
});
