(function initializeProfileSelect() {
  const PROFILE_HANDOFF_KEY =
    'chamverse:intro-index-handoff';

  const LOGIN_PAGE = 'login.html';
  const INTRO_PAGE = 'intro.html';
  const MAIN_PAGE = 'main.html';

  const profileButtons = document.querySelectorAll(
    '.profile-option[data-profile-id]'
  );

  const addButton = document.querySelector(
    '[data-profile-add="true"]'
  );

  const manageButton = document.getElementById(
    'profileManage'
  );

  function readActiveUser() {
    try {
      if (window.ChamverseApp?.read) {
        const user = ChamverseApp.read(
          ChamverseApp.KEY.user,
          null
        );

        if (
          user
          && typeof user === 'object'
        ) {
          return user;
        }
      }

      const storedUser = localStorage.getItem(
        'chamverse:user'
      );

      if (!storedUser) return null;

      const parsedUser = JSON.parse(
        storedUser
      );

      return parsedUser
        && typeof parsedUser === 'object'
        ? parsedUser
        : null;
    } catch {
      return null;
    }
  }

  function writeActiveUser(user) {
    try {
      if (window.ChamverseApp?.write) {
        ChamverseApp.write(
          ChamverseApp.KEY.user,
          user
        );

        return;
      }

      localStorage.setItem(
        'chamverse:user',
        JSON.stringify(user)
      );
    } catch {
      /* 저장 실패 시에도 화면 이동은 계속합니다. */
    }
  }

  function cameFromIntro() {
    try {
      return sessionStorage.getItem(
        PROFILE_HANDOFF_KEY
      ) === 'ready';
    } catch {
      return false;
    }
  }

  function clearIntroHandoff() {
    try {
      sessionStorage.removeItem(
        PROFILE_HANDOFF_KEY
      );
    } catch {
      /* 저장 공간을 사용할 수 없어도 계속 진행합니다. */
    }
  }

  function revealPage() {
    document.documentElement.classList.remove(
      'index-route-checking'
    );

    document.body.classList.add(
      'is-profile-ready'
    );
  }

  function showToast(message) {
    if (window.ChamverseApp?.showToast) {
      ChamverseApp.showToast(message);
    }
  }

  const activeUser = readActiveUser();
  const isIntroComplete = cameFromIntro();

  if (!activeUser) {
    location.replace(LOGIN_PAGE);
    return;
  }

  if (!isIntroComplete) {
    location.replace(INTRO_PAGE);
    return;
  }

  clearIntroHandoff();
  revealPage();

  function selectProfile(button) {
    profileButtons.forEach((profileButton) => {
      profileButton.classList.toggle(
        'is-selected',
        profileButton === button
      );
    });
  }

  function openProfile(button) {
    const profile = {
      id: button.dataset.profileId,
      name: button.dataset.profileName,
      image: button.dataset.profileImage
    };

    writeActiveUser({
      ...activeUser,
      activeProfile: profile
    });

    showToast(
      `${profile.name} 프로필로 시작할게요.`
    );

    window.setTimeout(() => {
      location.href = MAIN_PAGE;
    }, 220);
  }

  profileButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectProfile(button);
      openProfile(button);
    });
  });

  addButton?.addEventListener('click', () => {
    showToast(
      '프로필 추가 기능은 곧 연결할게요.'
    );
  });

  manageButton?.addEventListener('click', () => {
    showToast(
      '프로필 관리 기능은 곧 연결할게요.'
    );
  });
}());