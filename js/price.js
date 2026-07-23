document.querySelectorAll('.price-list .primary-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const plan = button.closest('.menu-row').querySelector('b').textContent.trim();
    ChamverseApp.write(ChamverseApp.KEY.plan, plan);
    document.querySelectorAll('.price-list .primary-btn').forEach((item) => { item.textContent = '선택'; });
    button.textContent = '선택됨';
    ChamverseApp.showToast(`${plan} 이용권을 선택했습니다.`);
  });
});
