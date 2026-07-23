/**
 * 모든 화면에서 공통으로 쓰는 최소 도우미입니다.
 * 화면 구조와 화면별 클릭 이벤트는 각각 js/화면이름.js에서 작성합니다.
 */
(function createChamverseHelpers() {
  const fallbackContents = [
    {
      id: 1,
      title: '짱구는 못말려',
      poster: '../images/contents/id-01.jpg',
      genre: ['일상', '코미디'],
      year: 1992,
      description: '다섯 살 말썽꾸러기 짱구와 가족, 친구들이 펼치는 유쾌한 일상 이야기.'
    }
  ];

  async function getContents() {
    try {
      const response = await fetch('../data/contents.json');
      return response.ok ? await response.json() : fallbackContents;
    } catch (error) {
      console.warn('콘텐츠 데이터를 불러오지 못했습니다.', error);
      return fallbackContents;
    }
  }

  function posterMarkup(item) {
    return `<a class="poster-card" href="play.html?id=${item.id}"><div class="poster"><img src="${item.poster}" alt="${item.title}" loading="lazy"></div><h3>${item.title}</h3><p>${item.genre?.[0] || '애니'} · ${item.year}</p></a>`;
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      Object.assign(toast.style, {
        position: 'fixed',
        zIndex: '30',
        bottom: '30px',
        left: '50%',
        padding: '14px 21px',
        color: '#fff',
        background: 'rgba(30, 30, 30, 0.9)',
        borderRadius: '10px',
        pointerEvents: 'none',
        transform: 'translate(-50%, 0)'
      });
      document.body.appendChild(toast);
    }
    clearTimeout(window.chamverseToastTimer);
    cancelAnimationFrame(window.chamverseToastFrame);
    toast.getAnimations().forEach((animation) => animation.cancel());
    toast.style.transition = 'none';
    toast.textContent = message;
    toast.style.opacity = '0';
    toast.classList.remove('is-visible');
    /* 연속 호출 시에도 시작 위치를 확정해 등장 애니메이션을 다시 재생합니다. */
    toast.getBoundingClientRect();
    toast.style.transition = '';
    toast.getBoundingClientRect();
    window.chamverseToastFrame = requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.classList.add('is-visible');
    });
    window.chamverseToastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.classList.remove('is-visible');
    }, 2800);
  }

  function headerMarkup() {
    return `
      <div class="common-header__inner">
        <a class="common-header__brand" href="main.html" aria-label="CHAMVERSE 홈으로 이동">
          <img class="common-header__logo" src="../images/common/logo.png" alt="CHAMVERSE">
        </a>
        <nav class="common-header__menu" aria-label="주요 메뉴">
          <a class="common-header__menu-link common-header__menu-link--home" href="main.html">홈</a>
          <a class="common-header__menu-link common-header__menu-link--live" href="live.html">LIVE <span aria-hidden="true">((•))</span></a>
          <a class="common-header__menu-link common-header__menu-link--wish" href="wish.html">찜한 콘텐츠</a>
          <a class="common-header__menu-link common-header__menu-link--ranking" href="ranking.html">랭킹</a>
          <a class="common-header__menu-link" href="main.html">장르</a>
          <a class="common-header__menu-link common-header__menu-link--event" href="voteEvent.html">이벤트</a>
        </nav>
        <div class="common-header__actions">
          <a class="common-header__search" href="search.html" aria-label="검색">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 4 4"></path></svg>
            <span>작품명을 검색해보세요.</span>
            <svg class="common-header__search-end" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 4 4"></path></svg>
          </a>
          <span class="common-header__divider" aria-hidden="true"></span>
          <a class="common-header__notification" href="notification.html" aria-label="새 알림">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10.3 21a2 2 0 0 0 3.4 0"></path></svg>
            <b aria-hidden="true"></b>
          </a>
          <a class="common-header__profile" href="myPage.html" aria-label="마이페이지">
            <img src="../images/main/profile07.png" alt="">
          </a>
        </div>
      </div>`;
  }

  function navigationMarkup(page) {
    const activePage = ['download', 'settings', 'notification', 'price', 'notice'].includes(page)
      ? 'myPage'
      : ['search', 'play', 'voteEvent', 'vote', 'ranking'].includes(page)
        ? 'main'
        : page;
    const menus = [
      { key: 'main', label: '홈', href: 'main.html', icon: 'icon-01' },
      { key: 'live', label: '라이브', href: 'live.html', icon: 'icon-02' },
      { key: 'wish', label: '찜', href: 'wish.html', icon: 'icon-03' },
      { key: 'myPage', label: '마이', href: 'myPage.html', icon: 'icon-04' }
    ];
    return `<div class="common-nav__inner">${menus.map((menu) => {
      const active = menu.key === activePage;
      const icon = `../images/common/${menu.icon}-on.png`;
      return `<a class="common-nav__item ${active ? 'is-active' : ''}" href="${menu.href}"><img src="${icon}" alt="">${menu.label}</a>`;
    }).join('')}</div>`;
  }

  function mountCommonUi() {
    const { body } = document;
    if (body.dataset.useCommonUi !== 'true') return;

    /* 페이지에 기존 제목 헤더가 있다면 공통 브랜드 헤더로 대체합니다. */
    document.querySelectorAll('.screen-header').forEach((header) => header.remove());

    const app = document.querySelector('.app') || body;
    const header = document.createElement('header');
    header.className = 'common-header';
    header.innerHTML = headerMarkup();
    app.insertAdjacentElement('afterbegin', header);

    const previousNavigation = document.querySelector('.bottom-nav');
    if (previousNavigation) previousNavigation.remove();

    const navigation = document.createElement('nav');
    navigation.className = 'common-nav';
    navigation.setAttribute('aria-label', '주요 메뉴');
    navigation.innerHTML = navigationMarkup(body.dataset.page || 'main');
    body.appendChild(navigation);

    const topButton = document.createElement('button');
    topButton.className = 'common-top-button';
    topButton.type = 'button';
    topButton.setAttribute('aria-label', '맨 위로 이동');
    topButton.innerHTML = `
      <span class="common-top-button__character">
        <img src="../images/main/profile15.png" alt="">
      </span>
      <b>TOP</b>`;
    body.appendChild(topButton);

    const updateTopButton = () => {
      topButton.classList.toggle('is-visible', window.scrollY > 320);
    };
    topButton.addEventListener('click', () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', updateTopButton, { passive: true });
    updateTopButton();
  }

  mountCommonUi();
  window.Chamverse = { getContents, posterMarkup, showToast };
}());
