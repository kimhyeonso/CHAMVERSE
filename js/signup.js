(function initializeSignup() {
  const LAST_SIGNUP_KEY =
    'chamverse:last-signup';

  const providerNames = {
    kakao: '카카오톡',
    naver: '네이버',
    google: '구글'
  };

  let isProcessing = false;

  function users() {
    const storedUsers = ChamverseApp.read(
      ChamverseApp.KEY.users,
      []
    );

    return Array.isArray(storedUsers)
      ? storedUsers
      : [];
  }

  function startSession(user) {
    const {
      password,
      ...sessionUser
    } = user;

    ChamverseApp.write(
      ChamverseApp.KEY.user,
      sessionUser
    );
  }

  function setSocialButtonsDisabled(disabled) {
    document
      .querySelectorAll('.social')
      .forEach((button) => {
        button.disabled = disabled;
      });
  }

  function beginLeaving(activeElement) {
    document.body.classList.add(
      'is-leaving'
    );

    activeElement?.classList.add(
      'is-busy'
    );

    activeElement?.setAttribute(
      'aria-busy',
      'true'
    );
  }

  document
    .querySelectorAll('.social')
    .forEach((button) => {
      button.addEventListener(
        'click',
        async () => {
          if (isProcessing) return;

          const {
            provider
          } = button.dataset;

          if (!providerNames[provider]) {
            return;
          }

          isProcessing = true;
          setSocialButtonsDisabled(true);

          const userList = users();

          const existingUser = userList.find(
            (item) => (
              item.provider === provider
            )
          );

          if (existingUser) {
            startSession(existingUser);
            beginLeaving(button);

            ChamverseApp.showToast(
              `${providerNames[provider]} 연동 계정으로 시작합니다.`
            );

            setTimeout(() => {
              location.href = 'main.html';
            }, 450);

            return;
          }

          const profiles =
            await ChamverseApp.getProfiles();

          const profile = profiles[
            Math.floor(
              Math.random()
              * Math.max(1, profiles.length)
            )
          ];

          const socialUser = {
            name:
              `${providerNames[provider]} 챔프`,

            email:
              `${provider}.champ${userList.length + 1}@chamverse.kr`,

            provider,

            profileId:
              profile?.id || 1
          };

          ChamverseApp.write(
            ChamverseApp.KEY.users,
            [
              ...userList,
              socialUser
            ]
          );

          startSession(socialUser);
          beginLeaving(button);

          ChamverseApp.showToast(
            `${providerNames[provider]} 계정 연동이 완료되었습니다.`
          );

          setTimeout(() => {
            location.href = 'main.html';
          }, 450);
        }
      );
    });

  document
    .querySelector('.signup-cta')
    ?.addEventListener(
      'click',
      async (event) => {
        event.preventDefault();

        if (isProcessing) return;

        isProcessing = true;

        const signupButton =
          event.currentTarget;

        signupButton.classList.add(
          'is-busy'
        );

        signupButton.setAttribute(
          'aria-busy',
          'true'
        );

        const userList = users();

        const profiles =
          await ChamverseApp.getProfiles();

        const profile = profiles[
          Math.floor(
            Math.random()
            * Math.max(1, profiles.length)
          )
        ];

        const demoUser = {
          name: '챔프',

          email:
            `champ${userList.length + 1}@chamverse.kr`,

          password: '1234',

          provider: 'email',

          profileId:
            profile?.id || 1
        };

        ChamverseApp.write(
          ChamverseApp.KEY.users,
          [
            ...userList,
            demoUser
          ]
        );

        sessionStorage.setItem(
          LAST_SIGNUP_KEY,
          JSON.stringify({
            email: demoUser.email,
            password: demoUser.password
          })
        );

        beginLeaving(signupButton);

        ChamverseApp.showToast(
          '회원가입이 완료됐어요. 로그인 화면으로 이동합니다.'
        );

        setTimeout(() => {
          location.href =
            'login.html?signup=complete';
        }, 450);
      }
    );
}());