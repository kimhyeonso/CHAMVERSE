document.addEventListener('DOMContentLoaded', async () => {
  const items = await ChamverseApp.getContents();
  const hero = items.find((item) => item.isRecommend) || items[0];
  document.getElementById('voteHero').style.backgroundImage = `url('${hero.poster}')`;
  const count = Object.values(ChamverseApp.votes()).reduce((sum, value) => sum + value, 0) + 12480;
  document.querySelector('#voteHero .count').textContent = `D-5 마감 · ${count.toLocaleString()}명 참여 중`;
});
