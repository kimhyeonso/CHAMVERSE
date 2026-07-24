document.addEventListener('DOMContentLoaded', async () => {
  const topTenList = document.getElementById('topTenList');
  const continueList = document.getElementById('continueList');
  const genreRows = document.getElementById('genreRows');
  const movieList = document.getElementById('movieList');

  [topTenList, continueList, genreRows, movieList].forEach((element) => {
    if (element) element.innerHTML = '<div class="loading-state">콘텐츠를 불러오는 중이에요…</div>';
  });

  const items = await ChamverseApp.getContents();
  if (!items.length) return;

  const recommended = items.filter((item) => item.isRecommend);
  const heroSlides = (recommended.length ? recommended : items).slice(0, 4);
  let heroIndex = 0;
  let hero = heroSlides[heroIndex];
  const heroElement = document.getElementById('hero');
  const heroTitle = document.getElementById('heroTitle');
  const heroDescription = document.getElementById('heroDescription');
  const heroPlay = document.getElementById('heroPlay');
  const heroWish = document.getElementById('heroWish');
  const heroDots = heroElement.querySelector('.slider-dots');

  const updateHeroWish = () => {
    const wished = ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(hero.id);
    heroWish.classList.toggle('is-wished', wished);
    heroWish.innerHTML = wished ? '♥ <span>찜 취소</span>' : '＋ <span>찜하기</span>';
  };

  const renderHero = (index, shouldAnimate = false) => {
    if (shouldAnimate) heroElement.classList.add('is-changing');
    window.setTimeout(() => {
      heroIndex = index;
      hero = heroSlides[heroIndex];
      heroElement.style.backgroundImage = `linear-gradient(0deg, rgba(7, 12, 18, 0.9), rgba(7, 12, 18, 0.08)), url('${hero.poster}')`;
      heroTitle.textContent = hero.title;
      heroDescription.textContent = hero.description;
      heroPlay.href = `play.html?id=${hero.id}`;
      heroWish.dataset.contentId = hero.id;
      updateHeroWish();
      heroDots.setAttribute('aria-label', `추천 콘텐츠 ${heroSlides.length}개 중 ${heroIndex + 1}번째`);
      heroDots.querySelectorAll('button').forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === heroIndex);
        dot.setAttribute('aria-current', String(dotIndex === heroIndex));
      });
      heroElement.classList.remove('is-changing');
    }, shouldAnimate ? 180 : 0);
  };

  heroDots.innerHTML = heroSlides.map((item, index) => `
    <button type="button" aria-label="${index + 1}번째 추천 콘텐츠: ${item.title}"${index === 0 ? ' class="is-active" aria-current="true"' : ''}></button>
  `).join('');
  renderHero(0);

  let heroSliderTimer = window.setInterval(() => {
    renderHero((heroIndex + 1) % heroSlides.length, true);
  }, 3000);

  const restartHeroSlider = () => {
    window.clearInterval(heroSliderTimer);
    heroSliderTimer = window.setInterval(() => {
      renderHero((heroIndex + 1) % heroSlides.length, true);
    }, 3000);
  };

  heroDots.addEventListener('click', (event) => {
    const selectedDot = event.target.closest('button');
    if (!selectedDot) return;
    const selectedIndex = [...heroDots.querySelectorAll('button')].indexOf(selectedDot);
    renderHero(selectedIndex, true);
    restartHeroSlider();
  });

  heroElement.addEventListener('mouseenter', () => window.clearInterval(heroSliderTimer));
  heroElement.addEventListener('mouseleave', restartHeroSlider);

  let heroSwipeStartX = 0;
  heroElement.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return;
    heroSwipeStartX = event.clientX;
    window.clearInterval(heroSliderTimer);
  });

  heroElement.addEventListener('pointerup', (event) => {
    if (!heroSwipeStartX) return;
    const swipeDistance = event.clientX - heroSwipeStartX;
    heroSwipeStartX = 0;
    if (Math.abs(swipeDistance) >= 40) {
      const nextIndex = swipeDistance < 0
        ? (heroIndex + 1) % heroSlides.length
        : (heroIndex - 1 + heroSlides.length) % heroSlides.length;
      renderHero(nextIndex, true);
    }
    restartHeroSlider();
  });

  heroElement.addEventListener('pointercancel', () => {
    heroSwipeStartX = 0;
    restartHeroSlider();
  });

  const posterMarkup = (item, className, extra = '') => `
    <a class="${className}" href="play.html?id=${item.id}" ${extra}>
      <span class="${className}__poster"><img src="${item.poster}" alt="${item.title}" loading="lazy"></span>
      <h3>${item.title}</h3>
    </a>`;

  const shuffleItems = (source) => [...source].sort(() => Math.random() - 0.5);
  const topContentIds = [1, 2, 5, 18, 24, 25, 26, 38, 39, 49];
  const topItems = topContentIds
    .map((contentId) => items.find((item) => item.id === contentId))
    .filter(Boolean);
  const topItemIds = new Set(topItems.map((item) => item.id));
  topTenList.innerHTML = topItems.map((item, index) => `
    <a class="rank-card" href="play.html?id=${item.id}" data-rank="${index + 1}" aria-label="${index + 1}위 ${item.title}">
      <span class="rank-card__poster"><img src="${item.poster}" alt="${item.title}" loading="lazy"></span>
    </a>`).join('');

  let dragStartX = 0;
  let dragStartScroll = 0;
  let isDragging = false;
  let topTenDragMoved = false;

  topTenList.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    isDragging = true;
    topTenDragMoved = false;
    dragStartX = event.clientX;
    dragStartScroll = topTenList.scrollLeft;
  });

  topTenList.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) < 5) return;
    topTenDragMoved = true;
    topTenList.classList.add('is-dragging');
    if (!topTenList.hasPointerCapture(event.pointerId)) {
      topTenList.setPointerCapture(event.pointerId);
    }
    topTenList.scrollLeft = dragStartScroll - distance;
  });

  const finishTopTenDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    topTenList.classList.remove('is-dragging');
    if (topTenList.hasPointerCapture(event.pointerId)) topTenList.releasePointerCapture(event.pointerId);
  };

  topTenList.addEventListener('pointerup', finishTopTenDrag);
  topTenList.addEventListener('pointercancel', (event) => {
    topTenDragMoved = false;
    finishTopTenDrag(event);
  });
  topTenList.addEventListener('click', (event) => {
    if (!topTenDragMoved) return;
    event.preventDefault();
    event.stopPropagation();
    topTenDragMoved = false;
  }, true);

  let continueDragStartX = 0;
  let continueDragStartScroll = 0;
  let isContinueDragging = false;
  let continueDragMoved = false;

  continueList.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    isContinueDragging = true;
    continueDragMoved = false;
    continueDragStartX = event.clientX;
    continueDragStartScroll = continueList.scrollLeft;
  });

  continueList.addEventListener('pointermove', (event) => {
    if (!isContinueDragging) return;
    const distance = event.clientX - continueDragStartX;
    if (Math.abs(distance) < 5) return;
    continueDragMoved = true;
    continueList.classList.add('is-dragging');
    if (!continueList.hasPointerCapture(event.pointerId)) {
      continueList.setPointerCapture(event.pointerId);
    }
    continueList.scrollLeft = continueDragStartScroll - distance;
  });

  const finishContinueDrag = (event) => {
    if (!isContinueDragging) return;
    isContinueDragging = false;
    continueList.classList.remove('is-dragging');
    if (continueList.hasPointerCapture(event.pointerId)) continueList.releasePointerCapture(event.pointerId);
  };

  continueList.addEventListener('pointerup', finishContinueDrag);
  continueList.addEventListener('pointercancel', (event) => {
    continueDragMoved = false;
    finishContinueDrag(event);
  });
  continueList.addEventListener('click', (event) => {
    if (!continueDragMoved) return;
    event.preventDefault();
    event.stopPropagation();
    continueDragMoved = false;
  }, true);

  const watching = ChamverseApp.getContinueWatching();
  const continueItems = watching
    .map((entry) => ({ item: items.find((content) => content.id === Number(entry.contentId)), progress: entry.progress }))
    .filter((entry) => entry.item);
  continueList.classList.toggle('is-empty', !continueItems.length);
  continueList.innerHTML = continueItems.length ? continueItems.slice(0, 6).map(({ item, progress }) => `
    <a class="continue-card" href="play.html?id=${item.id}&autoplay=1">
      <span class="continue-card__image">
        <img src="${item.poster}" alt="${item.title}" loading="lazy">
        <span class="continue-card__play" aria-hidden="true"></span>
        <span class="continue-card__progress"><span style="--progress:${Math.min(92, Math.round(progress * 100))}%"></span></span>
      </span>
      <h3>${item.title}</h3>
      <p>${Math.max(1, Math.round((item.episode || 12) / 50))}화</p>
    </a>`).join('') : '<p class="continue-empty">아직 시청한 작품이 없어요.</p>';

  const continueBannerSlider = document.getElementById('continueBannerSlider');
  const bannerTrack = continueBannerSlider.querySelector('.banner-slider__track');
  const bannerSlides = [...bannerTrack.children];
  const bannerDots = [...continueBannerSlider.querySelectorAll('.banner-slider__dots i')];
  const firstBannerClone = bannerSlides[0].cloneNode(true);
  const lastBannerClone = bannerSlides[bannerSlides.length - 1].cloneNode(true);
  firstBannerClone.setAttribute('aria-hidden', 'true');
  lastBannerClone.setAttribute('aria-hidden', 'true');
  bannerTrack.prepend(lastBannerClone);
  bannerTrack.appendChild(firstBannerClone);
  let bannerIndex = 1;
  let bannerTimer;

  const updateBannerDots = () => {
    const activeIndex = (bannerIndex - 1 + bannerSlides.length) % bannerSlides.length;
    bannerDots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
  };

  const moveBanner = (direction = 1) => {
    bannerIndex += direction;
    bannerTrack.style.transition = 'transform 480ms ease';
    bannerTrack.style.transform = `translateX(-${bannerIndex * 100}%)`;
    updateBannerDots();
  };

  bannerTrack.style.transform = 'translateX(-100%)';

  bannerTrack.addEventListener('transitionend', () => {
    if (bannerIndex !== bannerSlides.length + 1 && bannerIndex !== 0) return;
    if (bannerIndex === bannerSlides.length + 1) bannerIndex = 1;
    if (bannerIndex === 0) bannerIndex = bannerSlides.length;
    bannerTrack.style.transition = 'none';
    bannerTrack.style.transform = `translateX(-${bannerIndex * 100}%)`;
    updateBannerDots();
  });

  const startBannerSlider = () => {
    window.clearInterval(bannerTimer);
    bannerTimer = window.setInterval(moveBanner, 4000);
  };

  continueBannerSlider.addEventListener('mouseenter', () => window.clearInterval(bannerTimer));
  continueBannerSlider.addEventListener('mouseleave', startBannerSlider);

  let bannerSwipeStartX = 0;
  let bannerWasDragged = false;
  let bannerPointerId = null;
  let bannerPressedLink = null;
  continueBannerSlider.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) return;
    bannerSwipeStartX = event.clientX;
    bannerWasDragged = false;
    bannerPointerId = event.pointerId;
    bannerPressedLink = event.target.closest('a.banner-slider__slide');
    continueBannerSlider.classList.add('is-dragging');
    continueBannerSlider.setPointerCapture(event.pointerId);
    window.clearInterval(bannerTimer);
  });

  continueBannerSlider.addEventListener('pointerup', (event) => {
    if (!bannerSwipeStartX || event.pointerId !== bannerPointerId) return;
    const swipeDistance = event.clientX - bannerSwipeStartX;
    bannerSwipeStartX = 0;
    bannerPointerId = null;
    continueBannerSlider.classList.remove('is-dragging');
    if (continueBannerSlider.hasPointerCapture(event.pointerId)) {
      continueBannerSlider.releasePointerCapture(event.pointerId);
    }
    if (Math.abs(swipeDistance) >= 40) {
      bannerWasDragged = true;
      moveBanner(swipeDistance < 0 ? 1 : -1);
    } else if (bannerPressedLink) {
      bannerWasDragged = true;
      window.location.href = bannerPressedLink.href;
    }
    bannerPressedLink = null;
    startBannerSlider();
  });

  continueBannerSlider.addEventListener('pointercancel', () => {
    bannerSwipeStartX = 0;
    bannerPointerId = null;
    bannerPressedLink = null;
    continueBannerSlider.classList.remove('is-dragging');
    startBannerSlider();
  });

  continueBannerSlider.addEventListener('click', (event) => {
    if (!bannerWasDragged) return;
    event.preventDefault();
    bannerWasDragged = false;
  }, true);
  startBannerSlider();

  const renderGenreRows = () => {
    const genreCharacters = {
      일상: '../images/main/profile03.png',
      코미디: '../images/main/profile01.png',
      액션: '../images/main/profile08.png',
      판타지: '../images/main/profile05.png',
      모험: '../images/main/profile02.png',
      로맨스: '../images/main/profile07.png',
      추리: '../images/main/profile04.png',
      공포: '../images/main/profile06.png'
    };
    const desktopGenreCharacters = {
      일상: '../images/main/cutouts/profile03-cutout.png',
      코미디: '../images/main/cutouts/profile01-cutout.png',
      액션: '../images/main/cutouts/profile08-cutout.png',
      판타지: '../images/main/cutouts/profile05-cutout.png',
      모험: '../images/main/cutouts/profile02-cutout.png',
      로맨스: '../images/main/cutouts/profile07-cutout.png',
      추리: '../images/main/cutouts/profile04-cutout.png',
      공포: '../images/main/cutouts/profile06-cutout.png'
    };
    const genreOrder = ['일상', '코미디', '액션', '판타지', '모험', '로맨스', '추리', '공포'];
    const usedVisibleGenreItemIds = new Set();

    genreRows.innerHTML = genreOrder.map((genre) => {
      const matchedItems = shuffleItems(items.filter((item) => item.genre?.includes(genre)));
      const sourceItems = matchedItems.length ? matchedItems : shuffleItems(recommended);
      const visibleItems = sourceItems
        .filter((item) => !usedVisibleGenreItemIds.has(item.id))
        .slice(0, 3);
      const fillVisibleItems = visibleItems.length < 3
        ? shuffleItems(items.filter((item) => !usedVisibleGenreItemIds.has(item.id) && !visibleItems.includes(item)))
          .slice(0, 3 - visibleItems.length)
        : [];
      const firstVisibleItems = [...visibleItems, ...fillVisibleItems];
      const remainingItems = shuffleItems(sourceItems.filter((item) => !firstVisibleItems.includes(item)));
      const genreItems = [...firstVisibleItems, ...remainingItems].slice(0, 12);
      if (!genreItems.length) return '';
      firstVisibleItems.forEach((item) => usedVisibleGenreItemIds.add(item.id));
      return `<article class="genre-row" data-genre-row="${genre}">
        <a class="genre-lead" href="play.html?id=${genreItems[0].id}">
          <picture>
            <source media="(min-width: 769px)" srcset="${desktopGenreCharacters[genre] || '../images/main/cutouts/profile03-cutout.png'}">
            <img src="${genreCharacters[genre] || '../images/main/profile03.png'}" alt="${genre} 캐릭터" loading="lazy">
          </picture>
        </a>
        <div class="genre-card-row" aria-label="${genre} 콘텐츠 목록">
          ${genreItems.map((item) => `<a class="genre-card" href="play.html?id=${item.id}"><img src="${item.poster}" alt="${item.title}" loading="lazy"><span class="genre-card__title">${item.title}</span></a>`).join('')}
        </div>
      </article>`;
    }).join('');
  };
  renderGenreRows();

  genreRows.querySelectorAll('.genre-card-row').forEach((cardRow) => {
    let startX = 0;
    let startScroll = 0;
    let isDragging = false;
    let dragMoved = false;

    cardRow.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      startX = event.clientX;
      startScroll = cardRow.scrollLeft;
    });

    cardRow.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) < 5) return;
      dragMoved = true;
      cardRow.classList.add('is-dragging');
      if (!cardRow.hasPointerCapture(event.pointerId)) {
        cardRow.setPointerCapture(event.pointerId);
      }
      cardRow.scrollLeft = startScroll - distance;
    });

    const finishDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      cardRow.classList.remove('is-dragging');
      if (cardRow.hasPointerCapture(event.pointerId)) cardRow.releasePointerCapture(event.pointerId);
    };

    cardRow.addEventListener('pointerup', finishDrag);
    cardRow.addEventListener('pointercancel', (event) => {
      dragMoved = false;
      finishDrag(event);
    });
    cardRow.addEventListener('click', (event) => {
      if (!dragMoved) return;
      event.preventDefault();
      event.stopPropagation();
      dragMoved = false;
    }, true);
  });

  const newEpisodeIds = [1, 7, 25, 54, 18, 33];
  const newEpisodeItems = newEpisodeIds
    .map((contentId) => items.find((item) => item.id === contentId))
    .filter(Boolean);
  const visibleNewEpisodes = newEpisodeItems.length ? newEpisodeItems : recommended.slice(0, 5);
  const newEpisodeList = document.getElementById('newEpisodeList');
  newEpisodeList.innerHTML = visibleNewEpisodes.map((item) => `
    <a class="new-episode-card" href="play.html?id=${item.id}">
      <span class="new-episode-card__image">
        <img src="${item.poster}" alt="${item.title}" loading="lazy">
        <span class="new-episode-card__badge">NEW</span>
      </span>
      <h3>${item.title}</h3>
    </a>
  `).join('');

  let newEpisodeDragStartX = 0;
  let newEpisodeDragStartScroll = 0;
  let isNewEpisodeDragging = false;
  let newEpisodeDragMoved = false;

  newEpisodeList.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    isNewEpisodeDragging = true;
    newEpisodeDragMoved = false;
    newEpisodeDragStartX = event.clientX;
    newEpisodeDragStartScroll = newEpisodeList.scrollLeft;
  });
  newEpisodeList.addEventListener('pointermove', (event) => {
    if (!isNewEpisodeDragging) return;
    const distance = event.clientX - newEpisodeDragStartX;
    if (Math.abs(distance) < 5) return;
    newEpisodeDragMoved = true;
    newEpisodeList.classList.add('is-dragging');
    if (!newEpisodeList.hasPointerCapture(event.pointerId)) {
      newEpisodeList.setPointerCapture(event.pointerId);
    }
    newEpisodeList.scrollLeft = newEpisodeDragStartScroll - distance;
  });
  const finishNewEpisodeDrag = (event) => {
    if (!isNewEpisodeDragging) return;
    isNewEpisodeDragging = false;
    newEpisodeList.classList.remove('is-dragging');
    if (newEpisodeList.hasPointerCapture(event.pointerId)) {
      newEpisodeList.releasePointerCapture(event.pointerId);
    }
  };
  newEpisodeList.addEventListener('pointerup', finishNewEpisodeDrag);
  newEpisodeList.addEventListener('pointercancel', (event) => {
    newEpisodeDragMoved = false;
    finishNewEpisodeDrag(event);
  });
  newEpisodeList.addEventListener('click', (event) => {
    if (!newEpisodeDragMoved) return;
    event.preventDefault();
    event.stopPropagation();
    newEpisodeDragMoved = false;
  }, true);

  const renderMovies = (genre = '전체') => {
    let source = items.filter((item) => (item.episode || 0) <= 52);
    if (source.length < 6) source = items.slice(-12);
    if (genre !== '전체') source = source.filter((item) => item.genre?.includes(genre));
    if (source.length < 6) source = items.filter((item) => genre === '전체' || item.genre?.includes(genre));
    movieList.innerHTML = source.slice(0, 6).map((item) => posterMarkup(item, 'movie-card')).join('');
  };
  renderMovies();

  document.getElementById('genreChips').addEventListener('click', (event) => {
    const button = event.target.closest('[data-genre]');
    if (!button) return;
    document.querySelectorAll('#genreChips button').forEach((chip) => chip.classList.toggle('is-active', chip === button));
    const selectedGenre = button.dataset.genre;
    genreRows.querySelectorAll('[data-genre-row]').forEach((row) => {
      row.hidden = selectedGenre !== '전체' && row.dataset.genreRow !== selectedGenre;
    });
  });

  document.getElementById('movieTabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-movie-genre]');
    if (!button) return;
    document.querySelectorAll('#movieTabs button').forEach((tab) => tab.classList.toggle('is-active', tab === button));
    renderMovies(button.dataset.movieGenre);
  });

  // 가로 스크롤 영역에서도 카드 선택은 항상 상세 페이지로 연결합니다.
  document.querySelector('.main-page').addEventListener('click', (event) => {
    const contentCard = event.target.closest(
      'a.rank-card, a.continue-card, a.genre-lead, a.genre-card, a.banner-slider__slide, a.new-episode-card, a.movie-card'
    );
    if (!contentCard) return;

    event.preventDefault();
    window.location.href = contentCard.href;
  });

  heroWish.addEventListener('click', () => {
    const added = ChamverseApp.toggleId(ChamverseApp.KEY.wish, hero.id);
    updateHeroWish();
    ChamverseApp.showToast(added ? '찜 목록에 추가했어요.' : '찜 목록에서 삭제했어요.');
  });
});
