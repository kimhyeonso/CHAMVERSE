document.addEventListener('DOMContentLoaded', async () => {
  ChamverseApp.showLoading(document.getElementById('wishList'));
  const items = await ChamverseApp.getContents();
  const defaultWishMarker = 'chamverse:wish-default-ready';
  if (localStorage.getItem(defaultWishMarker) !== 'true') {
    if (!ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(1)) {
      ChamverseApp.toggleId(ChamverseApp.KEY.wish, 1);
    }
    localStorage.setItem(defaultWishMarker, 'true');
  }
  const wishList = document.getElementById('wishList');
  const wishSection = wishList.closest('.section');
  const wishPlayer = document.getElementById('wishPlayer');
  const wishPlayButton = document.getElementById('wishPlayButton');
  const continuePlayButton = document.getElementById('continuePlayButton');
  const continueWishButton = document.getElementById('continueWishButton');
  const wishLandscapeCloseButton = document.getElementById('wishLandscapeCloseButton');
  const continueThumb = document.querySelector('.continue-thumb');
  const wishCount = document.getElementById('wishCount');
  const wishSectionTitle = document.getElementById('wishSectionTitle');
  const wishTopEmpty = document.getElementById('wishTopEmpty');
  const wishRecommendControls = document.getElementById('wishRecommendControls');
  const wishRecommendPrev = document.getElementById('wishRecommendPrev');
  const wishRecommendNext = document.getElementById('wishRecommendNext');
  const wishPopularSection = document.getElementById('wishPopularSection');
  const wishPopularList = document.getElementById('wishPopularList');
  const wishUndo = document.getElementById('wishUndo');
  const wishUndoButton = document.getElementById('wishUndoButton');
  let lastRemovedWishId = null;
  let undoTimer = 0;
  let recommendationPage = 0;
  const recommendationIds = [1, 43, 42, 50, 7, 18, 24];
  let category = '전체';

  const closeWishFallbackLandscape = () => {
    continueThumb.classList.remove('is-fallback-landscape');
    document.body.classList.remove('wish-landscape-active');
  };

  const resetWishPlayer = () => {
    wishPlayer.pause();
    wishPlayer.controls = false;
    wishPlayer.currentTime = 0;
    wishPlayer.load();
    continueThumb.classList.remove('is-playing', 'has-started');
  };

  const openWishMobileLandscape = async () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (!isMobile) {
      try {
        if (wishPlayer.requestFullscreen) {
          await wishPlayer.requestFullscreen();
        } else if (wishPlayer.webkitEnterFullscreen) {
          wishPlayer.webkitEnterFullscreen();
        }
      } catch {
        /* 전체화면이 제한된 PC 브라우저에서는 페이지 안에서 재생합니다. */
      }
      return;
    }

    try {
      if (wishPlayer.requestFullscreen && screen.orientation?.lock) {
        await wishPlayer.requestFullscreen();
        await screen.orientation.lock('landscape');
        return;
      }

      if (window.matchMedia('(orientation: landscape)').matches && wishPlayer.webkitEnterFullscreen) {
        wishPlayer.webkitEnterFullscreen();
        return;
      }
    } catch {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      }
    }

    continueThumb.classList.add('is-fallback-landscape');
    document.body.classList.add('wish-landscape-active');
  };

  wishPlayButton.addEventListener('click', async () => {
    continueThumb.classList.add('has-started');

    try {
      wishPlayer.controls = true;
      const playPromise = wishPlayer.play();
      await openWishMobileLandscape();
      await playPromise;
    } catch {
      wishPlayer.controls = false;
      ChamverseApp.showToast('영상을 재생할 수 없어요');
    }
  });

  continuePlayButton?.addEventListener('click', () => {
    wishPlayButton.click();
  });

  wishLandscapeCloseButton.addEventListener('click', () => {
    resetWishPlayer();
    closeWishFallbackLandscape();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && continueThumb.classList.contains('is-fallback-landscape')) {
      resetWishPlayer();
      closeWishFallbackLandscape();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && continueThumb.classList.contains('has-started')) {
      resetWishPlayer();
      closeWishFallbackLandscape();
    }
  });

  wishPlayer.addEventListener('webkitendfullscreen', () => {
    resetWishPlayer();
    closeWishFallbackLandscape();
  });

  wishPlayer.addEventListener('play', () => {
    continueThumb.classList.add('is-playing');
  });

  wishPlayer.addEventListener('pause', () => {
    if (!wishPlayer.ended) continueThumb.classList.remove('is-playing');
  });

  wishPlayer.addEventListener('ended', () => {
    resetWishPlayer();
    closeWishFallbackLandscape();
  });

  const lastWatching = ChamverseApp.read(ChamverseApp.KEY.continueWatching, [])[0];
  const continuing = items.find((item) => item.id === lastWatching?.contentId) || items.find((item) => ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(item.id)) || items[0];
  let bannerContentId = continuing?.id ?? null;
  const banner = document.querySelector('.continue-banner');
  if (banner && continuing) {
    /* thumbnail 데이터 경로가 없을 때도 깨지지 않도록 실제 포스터를 우선 사용합니다. */
    wishPlayer.poster = continuing.poster || continuing.thumbnail;
    banner.querySelector('h3').textContent = continuing.title;
    banner.querySelector('p').textContent = continuing.description;
    banner.querySelector('.progress span').style.setProperty('--value', `${Math.round((lastWatching?.progress || 0.25) * 100)}%`);
  }

  const render = () => {
    const wishedItems = items
      .filter((item) => ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(item.id));
    const hasWishes = wishedItems.length > 0;
    const featuredWish = wishedItems[0];
    wishSectionTitle.textContent = hasWishes ? '내가 찜한 작품' : '이런 작품은 어때요?';
    wishCount.textContent = hasWishes ? `${wishedItems.length}개` : '';
    wishTopEmpty.hidden = hasWishes;
    banner.hidden = !hasWishes;
    document.querySelector('.tabs').hidden = !hasWishes;
    if (!hasWishes) {
      resetWishPlayer();
      closeWishFallbackLandscape();
    } else if (featuredWish) {
      bannerContentId = featuredWish.id;
      const isShinChan = featuredWish.id === 1;
      continueThumb.classList.toggle('is-poster-only', !isShinChan);
      if (!isShinChan) resetWishPlayer();
      wishPlayer.poster = featuredWish.poster || featuredWish.thumbnail;
      banner.querySelector('h3').textContent = featuredWish.title;
      banner.querySelector('p').textContent = featuredWish.description;
    }

    let selected = wishedItems;
    if (category === '시리즈') selected = selected.filter((item) => item.episode > 12);
    if (category === '극장판') selected = selected.filter((item) => item.episode <= 12);
    const recommendations = recommendationIds
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean);
    const isDesktopRecommendations = window.matchMedia('(min-width: 901px)').matches;
    const recommendationPageSize = isDesktopRecommendations ? 5 : 3;
    const recommendationMaxStart = Math.max(0, recommendations.length - recommendationPageSize);
    if (!isDesktopRecommendations) recommendationPage = 0;
    recommendationPage %= recommendationMaxStart + 1;
    const visibleRecommendations = recommendations.slice(
      recommendationPage,
      recommendationPage + recommendationPageSize
    );
    wishRecommendControls.hidden = hasWishes || recommendationMaxStart < 1;
    wishPopularSection.hidden = hasWishes;
    wishList.classList.toggle('is-recommendations', !hasWishes);
    wishSection.classList.toggle('is-recommendation-mode', !hasWishes);
    wishList.innerHTML = !hasWishes
      ? visibleRecommendations.map((item) => ChamverseApp.createCard(item, { action: 'wish' })).join('')
      : selected.length
        ? selected.map((item) => ChamverseApp.createCard(item, { action: 'wish' })).join('')
        : `<div class="wish-empty">
          <span class="wish-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M6.5 4.5h11v16l-5.5-3-5.5 3z"></path><path d="M9.5 9h5"></path></svg>
          </span>
          <div>
            <h3>이 분류에 찜한 작품이 없어요</h3>
            <p>다른 분류에서 찜한 콘텐츠를 확인해보세요.</p>
          </div>
        </div>`;
    wishPopularList.innerHTML = !hasWishes
      ? items.filter((item) => item.isTop10 && !recommendationIds.includes(item.id)).slice(0, 5)
        .map((item) => ChamverseApp.createCard(item, { action: 'wish' })).join('')
      : '';
    ChamverseApp.finishLoading(wishList);
  };

  wishRecommendPrev.addEventListener('click', () => {
    const pageSize = window.matchMedia('(min-width: 901px)').matches ? 5 : 3;
    const positionCount = Math.max(0, recommendationIds.length - pageSize) + 1;
    recommendationPage = (recommendationPage - 1 + positionCount) % positionCount;
    render();
  });

  wishRecommendNext.addEventListener('click', () => {
    const pageSize = window.matchMedia('(min-width: 901px)').matches ? 5 : 3;
    const positionCount = Math.max(0, recommendationIds.length - pageSize) + 1;
    recommendationPage = (recommendationPage + 1) % positionCount;
    render();
  });

  const hideWishUndo = () => {
    window.clearTimeout(undoTimer);
    wishUndo.classList.remove('is-visible');
  };

  const showWishUndo = (contentId) => {
    lastRemovedWishId = Number(contentId);
    window.clearTimeout(undoTimer);
    wishUndo.classList.remove('is-visible');
    requestAnimationFrame(() => wishUndo.classList.add('is-visible'));
    undoTimer = window.setTimeout(hideWishUndo, 4200);
  };

  wishUndoButton.addEventListener('click', () => {
    if (lastRemovedWishId === null) return;
    const currentIds = ChamverseApp.uniqueIds(ChamverseApp.KEY.wish);
    if (!currentIds.includes(lastRemovedWishId)) {
      ChamverseApp.toggleId(ChamverseApp.KEY.wish, lastRemovedWishId);
    }
    lastRemovedWishId = null;
    hideWishUndo();
    render();
  });

  render();
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    category = tab.textContent.trim();
    document.querySelectorAll('.tab').forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', String(isActive));
    });
    render();
  }));
  const handleWishAction = (event) => {
    const button = event.target.closest('[data-wish]');
    if (!button) return;
    event.preventDefault();
    const removedId = button.dataset.wish;
    const wasWished = ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(Number(removedId));
    ChamverseApp.toggleId(ChamverseApp.KEY.wish, removedId);
    render();
    if (!wasWished) {
      ChamverseApp.showToast('찜 목록에 추가했어요.');
    } else if (window.matchMedia('(max-width: 768px)').matches) {
      showWishUndo(removedId);
    } else {
      ChamverseApp.showToast('찜 목록에서 삭제했어요.');
    }
  };

  wishList.addEventListener('click', handleWishAction);
  wishPopularList.addEventListener('click', handleWishAction);
  continueWishButton?.addEventListener('click', () => {
    if (bannerContentId === null) return;
    ChamverseApp.toggleId(ChamverseApp.KEY.wish, bannerContentId);
    render();
    ChamverseApp.showToast('찜 목록에서 삭제했어요.');
  });
});
