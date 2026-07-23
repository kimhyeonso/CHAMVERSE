document.addEventListener('DOMContentLoaded', async () => {
  const items = await ChamverseApp.getContents();
  const grid = document.getElementById('characterGrid');
  const selectedId = ChamverseApp.read(ChamverseApp.KEY.myVote, String(items[0].id));
  let selected = Number(selectedId);
  const voteBannerImage = document.querySelector('.vote-banner img');
  if (voteBannerImage) {
    const bannerItem = items.find((item) => item.id === selected) || items[0];
    voteBannerImage.src = bannerItem.poster;
    voteBannerImage.alt = bannerItem.title;
  }
  grid.innerHTML = items.slice(0, 9).map((item) => `<button class="character ${item.id === selected ? 'selected' : ''}" data-id="${item.id}"><img src="${item.poster}" alt="${item.title}"><span>${item.title}</span></button>`).join('');
  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.character');
    if (!card) return;
    selected = Number(card.dataset.id);
    grid.querySelectorAll('.character').forEach((item) => item.classList.toggle('selected', Number(item.dataset.id) === selected));
  });
  document.getElementById('voteSubmit').addEventListener('click', () => {
    const result = ChamverseApp.submitVote(selected);
    ChamverseApp.showToast(result.changed ? '투표가 완료되었습니다!' : '이미 선택한 캐릭터입니다.');
  });
});
