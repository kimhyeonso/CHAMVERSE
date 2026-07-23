document.querySelectorAll('.toggle').forEach((toggle) => {
  const name = toggle.closest('.menu-row')?.querySelector('b')?.textContent.trim() || 'setting';
  const initialEnabled = ChamverseApp.getToggle(ChamverseApp.KEY.settings, name, toggle.classList.contains('on'));
  toggle.classList.toggle('on', initialEnabled);
  if (name === '다크 모드') document.body.classList.toggle('dark-mode', initialEnabled);
  toggle.addEventListener('click', () => {
    const enabled = !toggle.classList.contains('on');
    toggle.classList.toggle('on', enabled);
    ChamverseApp.setToggle(ChamverseApp.KEY.settings, name, enabled);
    if (name === '다크 모드') document.body.classList.toggle('dark-mode', enabled);
    ChamverseApp.showToast(`${name} ${enabled ? '켜짐' : '꺼짐'}`);
  });
});

document.getElementById('logoutButton')?.addEventListener('click', () => {
  localStorage.removeItem(ChamverseApp.KEY.user);
  ChamverseApp.showToast('로그아웃되었습니다.');
  setTimeout(() => { location.href = 'login.html'; }, 400);
});

document.getElementById('withdrawButton')?.addEventListener('click', () => {
  if (!confirm('회원 탈퇴를 진행할까요? 저장된 개인 설정이 삭제됩니다.')) return;
  Object.values(ChamverseApp.KEY).forEach((key) => localStorage.removeItem(key));
  ChamverseApp.showToast('회원 탈퇴가 완료되었습니다.');
  setTimeout(() => { location.href = 'index.html'; }, 400);
});
