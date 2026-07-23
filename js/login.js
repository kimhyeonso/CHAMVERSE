document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) return ChamverseApp.showToast('이메일과 비밀번호를 입력해주세요.');

  const users = ChamverseApp.read(ChamverseApp.KEY.users, []);
  const profiles = await ChamverseApp.getProfiles();
  const profile = profiles[Math.floor(Math.random() * Math.max(1, profiles.length))];
  const user = users.find((item) => item.email === email && item.password === password) || { email, name: email.split('@')[0] || '챔프', profileId: profile?.id || 1 };
  ChamverseApp.write(ChamverseApp.KEY.user, user);
  ChamverseApp.showToast(`${user.name}님, 환영합니다!`);
  setTimeout(() => { location.href = 'main.html'; }, 450);
});
