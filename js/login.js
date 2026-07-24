(function initializeLogin() {
  const LAST_SIGNUP_KEY = 'chamverse:last-signup';

  const form = document.getElementById('loginForm');
  const identifierInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const passwordToggle = document.querySelector('.password-toggle');
  const socialToggle = document.querySelector('.social-login-toggle');
  const socialPanel = document.getElementById('socialLoginPanel');
  const message = document.getElementById('loginMessage');

  const providerNames = {
    kakao: '카카오톡',
    naver: '네이버',
    google: '구글'
  };

  function showMessage(text, tone = 'error') {
    if (!message) return;

    message.textContent = text;
    message.dataset.tone = tone;
    message.hidden = false;
  }

  function clearMessage() {
    if (!message) return;

    message.textContent = '';
    message.hidden = true;

    delete message.dataset.tone;
  }

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

    // 실제 로그인 사용자 정보 저장
    ChamverseApp.write(
      ChamverseApp.KEY.user,
      sessionUser
    );

    // 기존 코드와 호환용 로그인 표시
    localStorage.setItem(
      'chamverseLoggedIn',
      'true'
    );

    // index.js에게 "로그인 후 프로필 선택 화면으로 들어가도 된다" 전달
    sessionStorage.setItem(
      'chamverse:intro-index-handoff',
      'ready'
    );

    clearMessage();

    ChamverseApp.showToast(
      `${sessionUser.name || '챔프'}님, 환영합니다!`
    );

    setTimeout(() => {
      location.href = 'index.html';
    }, 450);
  }

  function restoreNewAccount() {
    const params = new URLSearchParams(
      location.search
    );

    if (params.get('signup') !== 'complete') {
      return;
    }

    try {
      const account = JSON.parse(
        sessionStorage.getItem(LAST_SIGNUP_KEY)
      );

      if (!account?.email || !account?.password) {
        return;
      }

      identifierInput.value = account.email;
      passwordInput.value = account.password;

      showMessage(
        '회원가입이 완료됐어요. 아래 계정으로 로그인해주세요.',
        'success'
      );

      sessionStorage.removeItem(
        LAST_SIGNUP_KEY
      );

      history.replaceState(
        {},
        '',
        location.pathname
      );
    } catch {
      sessionStorage.removeItem(
        LAST_SIGNUP_KEY
      );
    }
  }

  function setSocialPanel(open) {
    if (!socialToggle || !socialPanel) return;

    socialToggle.setAttribute(
      'aria-expanded',
      String(open)
    );

    socialPanel.setAttribute(
      'aria-hidden',
      String(!open)
    );

    socialPanel.classList.toggle(
      'is-open',
      open
    );

    socialPanel.inert = !open;

    if (
      !open
      && socialPanel.contains(document.activeElement)
    ) {
      socialToggle.focus();
    }
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage();

    const identifier =
      identifierInput?.value.trim() || '';

    const password =
      passwordInput?.value || '';

    if (!identifier || !password) {
      showMessage(
        '이메일 또는 휴대폰 번호와 비밀번호를 모두 입력해주세요.'
      );

      return;
    }

    const normalizedIdentifier =
      identifier.toLowerCase();

    const normalizedPhone =
      identifier.replace(/\D/g, '');

    const user = users().find((item) => {
      const emailMatches =
        String(item.email || '').toLowerCase()
        === normalizedIdentifier;

      const phoneMatches =
        normalizedPhone
        && String(item.phone || '').replace(/\D/g, '')
        === normalizedPhone;

      return (
        (emailMatches || phoneMatches)
        && item.password === password
      );
    });

    if (!user) {
      showMessage(
        '가입한 계정 정보를 확인할 수 없어요. 이메일과 비밀번호를 다시 확인해주세요.'
      );

      ChamverseApp.showToast(
        '회원가입한 계정으로 로그인해주세요.'
      );

      return;
    }

    startSession(user);
  });

  passwordToggle?.addEventListener(
    'click',
    () => {
      const willShow =
        passwordInput.type === 'password';

      passwordInput.type =
        willShow ? 'text' : 'password';

      passwordToggle.setAttribute(
        'aria-pressed',
        String(willShow)
      );

      passwordToggle.setAttribute(
        'aria-label',
        willShow
          ? '비밀번호 숨기기'
          : '비밀번호 표시'
      );

      passwordInput.focus();
    }
  );

  socialToggle?.addEventListener(
    'click',
    () => {
      const willOpen =
        socialToggle.getAttribute('aria-expanded')
        !== 'true';

      setSocialPanel(willOpen);
    }
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key === 'Escape'
        && socialToggle?.getAttribute('aria-expanded') === 'true'
      ) {
        setSocialPanel(false);
      }
    }
  );

  document
    .querySelectorAll('.social-login')
    .forEach((button) => {
      button.addEventListener('click', () => {
        clearMessage();

        const { provider } = button.dataset;

        const user = users().find((item) => (
          item.provider === provider
          || (
            Array.isArray(item.providers)
            && item.providers.includes(provider)
          )
        ));

        if (!user) {
          const providerName =
            providerNames[provider] || '간편';

          showMessage(
            `${providerName}으로 가입하거나 연동한 계정이 없어요. 먼저 회원가입을 진행해주세요.`
          );

          ChamverseApp.showToast(
            `${providerName} 연동 계정을 찾을 수 없어요.`
          );

          return;
        }

        startSession(user);
      });
    });

  [
    identifierInput,
    passwordInput
  ].forEach((input) => {
    input?.addEventListener(
      'input',
      clearMessage
    );
  });

  setSocialPanel(false);
  restoreNewAccount();
}());