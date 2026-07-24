document.addEventListener('DOMContentLoaded', async () => {
  const watchingList = document.getElementById('watchingList');

  ChamverseApp.showLoading(watchingList);

  const [items, profiles] = await Promise.all([
    ChamverseApp.getContents(),
    ChamverseApp.getProfiles()
  ]);

  const user = ChamverseApp.read(
    ChamverseApp.KEY.user,
    {
      name: '챔프',
      email: 'qwer@naver.com'
    }
  );

  /*
   * index.html에서 선택한 프로필은
   * user.activeProfile 안에 저장되어 있음.
   *
   * 구조:
   * {
   *   id: 'seunggeun',
   *   name: '승근',
   *   image: '../images/profile/profile05.png'
   * }
   */
  const selectedProfile =
    user.activeProfile
    && typeof user.activeProfile === 'object'
      ? user.activeProfile
      : null;

  /*
   * 혹시 예전에 로그인한 유저처럼 activeProfile이 없는 경우를 대비해서
   * 기존 profileId 방식도 fallback으로 남겨둠.
   */
  const fallbackProfile =
    profiles.find((item) => item.id === user.profileId)
    || profiles[0];

  const profileName =
    selectedProfile?.name
    || fallbackProfile?.name
    || user.name
    || '챔프';

  const profileImage =
    selectedProfile?.image
    || fallbackProfile?.image
    || '../images/profile/profile01.png';

  const account = document.querySelector('.account-card');

  if (account) {
    const profileImageElement =
      account.querySelector('img');

    const nameElement =
      account.querySelector('h2');

    const emailElement =
      account.querySelector('p');

    const badgeElement =
      account.querySelector('.badge');

    if (profileImageElement) {
      profileImageElement.src = profileImage;
      profileImageElement.alt = `${profileName} 프로필`;
    }

    if (nameElement) {
      nameElement.textContent = `${profileName} 님`;
    }

    if (emailElement) {
      emailElement.textContent =
        user.email || 'qwer@naver.com';
    }

    if (badgeElement) {
      badgeElement.textContent = ChamverseApp.read(
        ChamverseApp.KEY.plan,
        '일반 회원권'
      );
    }
  }

  const watching = ChamverseApp.getContinueWatching();

  const list = watching
    .map((entry) => ({
      item: items.find(
        (content) => content.id === entry.contentId
      ),
      progress: entry.progress
    }))
    .filter((entry) => entry.item);

  watchingList.classList.toggle('is-empty', !list.length);
  watchingList.innerHTML = list.length
    ? list.map((entry) => (
      ChamverseApp.createCard(
        entry.item,
        {
          progress: entry.progress
        }
      )
    ))
    .join('')
    : '<p class="watching-empty">아직 시청한 작품이 없어요.</p>';

  ChamverseApp.finishLoading(watchingList);

  const counters = document.querySelectorAll('.counter');

  if (counters[0]) {
    counters[0].textContent =
      `${ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).length}개`;
  }

  if (counters[1]) {
    counters[1].textContent =
      `${ChamverseApp.uniqueIds(ChamverseApp.KEY.downloads).length}개`;
  }

  account
    ?.querySelector('a')
    ?.addEventListener('click', () => {
      localStorage.removeItem(ChamverseApp.KEY.user);
    });
});
