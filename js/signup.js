document.querySelectorAll('.social').forEach((button) => {
  button.addEventListener('click', () => ChamverseApp.showToast('소셜 가입은 데모 계정으로 연결됩니다.'));
});

document.querySelector('.signup-cta')?.addEventListener('click', async (event) => {
  event.preventDefault();
  const users = ChamverseApp.read(ChamverseApp.KEY.users, []);
  const profiles = await ChamverseApp.getProfiles();
  const profile = profiles[Math.floor(Math.random() * Math.max(1, profiles.length))];
  const demoUser = { name: '챔프', email: `champ${users.length + 1}@chamverse.kr`, password: '1234', profileId: profile?.id || 1 };
  ChamverseApp.write(ChamverseApp.KEY.users, [...users, demoUser]);
  ChamverseApp.write(ChamverseApp.KEY.user, demoUser);
  ChamverseApp.showToast('회원가입이 완료되었습니다.');
  setTimeout(() => { location.href = 'main.html'; }, 450);
});
