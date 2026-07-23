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
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(window.chamverseToastTimer);
    window.chamverseToastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  }

  function headerMarkup() {
    return `
      <div class="common-header__inner">
        <a href="main.html" aria-label="CHAMVERSE 홈으로 이동">
          <img class="common-header__logo" src="../images/common/logo.png" alt="CHAMVERSE">
        </a>
        <div class="common-header__actions">
          <a class="common-header__search" href="search.html" aria-label="검색">⌕</a>
          <a class="common-header__profile" href="myPage.html" aria-label="마이페이지">☺</a>
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
      const icon = `../images/common/${menu.icon}${active ? '-on' : ''}.png`;
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
  }

  mountCommonUi();
  window.Chamverse = { getContents, posterMarkup, showToast };
}());
