/* Shared data and LocalStorage utilities. Page UI remains in each page script. */
(function createAppUtilities() {
  const KEY = {
    user: 'chamverse:user',
    users: 'chamverse:users',
    wish: 'chamverse:wish',
    downloads: 'chamverse:downloads',
    recentSearches: 'chamverse:recent-searches',
    continueWatching: 'chamverse:continue-watching',
    settings: 'chamverse:settings',
    notifications: 'chamverse:notifications',
    plan: 'chamverse:plan',
    votes: 'chamverse:votes',
    myVote: 'chamverse:my-vote'
  };

  const cache = new Map();

  async function loadJson(path, fallback = []) {
    if (cache.has(path)) return cache.get(path);
    try {
      const response = await fetch(path);
      const data = response.ok ? await response.json() : fallback;
      cache.set(path, data);
      return data;
    } catch (error) {
      console.warn(`${path} 데이터를 불러오지 못했습니다.`, error);
      return fallback;
    }
  }

  async function getContents() {
    return loadJson('../data/contents.json');
  }

  async function getPlayData() {
    return loadJson('../data/play.json');
  }

  async function getProfiles() {
    return loadJson('../data/profile.json');
  }

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function uniqueIds(key) {
    return read(key, []).map(Number).filter(Number.isFinite);
  }

  function toggleId(key, id) {
    const numericId = Number(id);
    const ids = uniqueIds(key);
    const exists = ids.includes(numericId);
    const next = exists ? ids.filter((item) => item !== numericId) : [numericId, ...ids];
    write(key, next);
    return !exists;
  }

  function addRecentSearch(keyword) {
    const normalized = keyword.trim();
    if (!normalized) return read(KEY.recentSearches, []);
    const next = [normalized, ...read(KEY.recentSearches, []).filter((item) => item !== normalized)].slice(0, 8);
    return write(KEY.recentSearches, next);
  }

  function removeRecentSearch(keyword) {
    return write(KEY.recentSearches, read(KEY.recentSearches, []).filter((item) => item !== keyword));
  }

  function continueWatchingStorageKey() {
    const user = read(KEY.user, null);
    const identifier = user?.email || user?.phone;
    return identifier
      ? `${KEY.continueWatching}:${encodeURIComponent(String(identifier).toLowerCase())}`
      : null;
  }

  function getContinueWatching() {
    const storageKey = continueWatchingStorageKey();
    return storageKey ? read(storageKey, []) : [];
  }

  function setContinueWatching(contentId, progress = 0.28) {
    const storageKey = continueWatchingStorageKey();
    if (!storageKey) return [];
    const list = read(storageKey, []);
    const next = [{ contentId: Number(contentId), progress, updatedAt: Date.now() }, ...list.filter((item) => item.contentId !== Number(contentId))].slice(0, 12);
    return write(storageKey, next);
  }

  function createCard(content, options = {}) {
    const meta = options.meta || `${content.genre?.[0] || '애니'} · ${content.year || ''}`;
    const action = options.action ? `<button class="content-card__action" data-${options.action}="${content.id}" aria-label="${options.action}">${options.action === 'wish' ? '♡' : '⇩'}</button>` : '';
    const progress = options.progress ? `<div class="content-card__progress"><span style="--progress:${Math.round(options.progress * 100)}%"></span></div>` : '';
    return `<article class="content-card"><a href="play.html?id=${content.id}" class="content-card__link"><div class="content-card__poster"><img src="${content.poster}" alt="${content.title}" loading="lazy">${action}</div><h3>${content.title}</h3><p>${meta}</p>${progress}</a></article>`;
  }

  function createEmptyState(message, actionLabel, href) {
    return `<div class="empty-state"><p>${message}</p>${actionLabel ? `<a class="primary-btn" href="${href || 'main.html'}">${actionLabel}</a>` : ''}</div>`;
  }

  function setToggle(key, name, enabled) {
    const values = read(key, {});
    values[name] = enabled;
    return write(key, values);
  }

  function getToggle(key, name, fallback = false) {
    const values = read(key, {});
    return typeof values[name] === 'boolean' ? values[name] : fallback;
  }

  function votes() {
    return read(KEY.votes, {});
  }

  function submitVote(contentId) {
    const previous = read(KEY.myVote, null);
    const current = String(contentId);
    const result = votes();
    if (previous === current) return { changed: false, contentId: current };
    if (previous) result[previous] = Math.max(0, (result[previous] || 1) - 1);
    result[current] = (result[current] || 0) + 1;
    write(KEY.votes, result);
    write(KEY.myVote, current);
    return { changed: true, contentId: current };
  }

  function showToast(message) {
    if (window.Chamverse?.showToast) window.Chamverse.showToast(message);
  }

  function showLoading(target, message = '콘텐츠를 불러오는 중이에요…') {
    if (!target) return;
    target.setAttribute('aria-busy', 'true');
    target.innerHTML = `<div class="loading-state" role="status"><span></span>${message}</div>`;
  }

  function finishLoading(target) {
    target?.removeAttribute('aria-busy');
  }

  function restoreScrollPosition() {
    const key = `chamverse:scroll:${location.pathname}`;
    const saved = Number(sessionStorage.getItem(key));
    if (saved > 0) requestAnimationFrame(() => window.scrollTo(0, saved));
    window.addEventListener('pagehide', () => sessionStorage.setItem(key, String(window.scrollY)));
  }

  restoreScrollPosition();

  window.ChamverseApp = {
    KEY,
    loadJson,
    getContents,
    getPlayData,
    getProfiles,
    read,
    write,
    uniqueIds,
    toggleId,
    addRecentSearch,
    removeRecentSearch,
    getContinueWatching,
    setContinueWatching,
    createCard,
    createEmptyState,
    setToggle,
    getToggle,
    votes,
    submitVote,
    showToast,
    showLoading,
    finishLoading
  };
}());
