document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('playBackButton').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = 'main.html';
  });

  const [items, playData] = await Promise.all([ChamverseApp.getContents(), ChamverseApp.getPlayData()]);
  const queryParams = new URLSearchParams(location.search);
  const id = Number(queryParams.get('id')) || items[0].id;
  const shouldAutoPlay = queryParams.get('autoplay') === '1';
  const item = items.find((content) => content.id === id) || items[0];
  const detail = playData.find((content) => content.contentId === item.id) || {};
  const episodeCount = Math.min(5, Math.max(3, Math.ceil((item.episode || 12) / 500)));
  const seasons = Array.isArray(detail.seasons) && detail.seasons.length
    ? detail.seasons
    : [detail.seasonLabel || '시즌 1'];
  const fallbackEpisodes = Array.from(
    { length: episodeCount },
    (_, index) => ({ number: index + 1 })
  );

  document.getElementById('playHero').style.backgroundImage = `url('${detail.background || item.poster}')`;
  document.getElementById('playTitle').textContent = item.title;
  document.getElementById('playMeta').innerHTML = `<span id="playSeasonTag" class="tag">${seasons[0]}</span><span class="tag">${item.age || 'ALL'}세 이상</span><span>${item.genre.join(' · ')}</span><span>${item.year}</span>`;
  document.getElementById('playDescription').textContent = item.description;
  document.getElementById('ratingScore').textContent = `${item.rating || 0}점`;
  const seasonSelect = document.getElementById('seasonSelect');
  const episodePlayer = document.getElementById('episodePlayer');
  const episodeVideo = document.getElementById('episodeVideo');
  const episodePlayerTitle = document.getElementById('episodePlayerTitle');
  const episodePlayerClose = document.getElementById('episodePlayerClose');
  const episodeFullscreenButton = document.getElementById('episodeFullscreenButton');
  seasonSelect.innerHTML = seasons.map((season) => `<option value="${season}">${season}</option>`).join('');

  const renderEpisodes = (season) => {
    const seasonEpisodes = Array.isArray(detail.episodes)
      ? detail.episodes
      : detail.episodes?.[season];
    const episodes = Array.isArray(seasonEpisodes) && seasonEpisodes.length
      ? seasonEpisodes
      : fallbackEpisodes;

    document.getElementById('episodeList').innerHTML = episodes.map((episode, index) => {
      const number = episode.episode || episode.number || index + 1;
      const thumbnailPath = episode.thumbnail || episode.image || item.poster;
      const thumbnail = /\.[a-z0-9]+(?:[?#].*)?$/i.test(thumbnailPath)
        ? thumbnailPath
        : `${thumbnailPath}.png`;
      const title = episode.title || `${season} · ${item.title} ${number}화`;
      const runningTime = episode.runningTime || detail.runningTime || '약 24분';
      const country = episode.country || detail.country || '한국';
      const linkAttribute = episode.link ? ` data-episode-video="${episode.link}" role="button" tabindex="0"` : '';
      return `<article class="episode"${linkAttribute}><img src="${thumbnail}" alt="${title}"><div><h3>${number}. ${title}</h3><p>${runningTime} · ${country}</p></div></article>`;
    }).join('');
  };

  renderEpisodes(seasons[0]);
  seasonSelect.addEventListener('change', () => {
    document.getElementById('playSeasonTag').textContent = seasonSelect.value;
    renderEpisodes(seasonSelect.value);
    ChamverseApp.showToast(`${seasonSelect.value} 에피소드를 보고 있어요.`);
  });

  let activeEpisode = null;
  let lastSavedSecond = -1;
  let activeEpisodeCompleted = false;
  const getSavedEpisode = () => ChamverseApp.getContinueWatching()
    .find((entry) => Number(entry.contentId) === item.id);
  const savePlaybackProgress = ({ completed = activeEpisodeCompleted } = {}) => {
    if (!activeEpisode) return;
    const duration = Number.isFinite(episodeVideo.duration) ? episodeVideo.duration : 0;
    const currentTime = completed ? 0 : Math.max(0, episodeVideo.currentTime || 0);
    const progress = duration > 0
      ? Math.min(completed ? 1 : currentTime / duration, 1)
      : 0;
    ChamverseApp.setContinueWatching(item.id, progress, {
      episodeLink: activeEpisode.link,
      episodeTitle: activeEpisode.title,
      season: activeEpisode.season,
      currentTime,
      completed
    });
  };
  const openEpisodePlayer = (episode) => {
    savePlaybackProgress();
    activeEpisode = null;
    episodeVideo.pause();
    const episodeLink = episode.dataset.episodeVideo;
    const episodeTitle = episode.querySelector('h3').textContent;
    const savedEpisode = getSavedEpisode();
    const resumeTime = savedEpisode?.episodeLink === episodeLink && !savedEpisode.completed
      ? Number(savedEpisode.currentTime) || 0
      : 0;
    activeEpisode = {
      link: episodeLink,
      title: episodeTitle,
      season: seasonSelect.value
    };
    lastSavedSecond = -1;
    activeEpisodeCompleted = false;
    episodePlayerTitle.textContent = episodeTitle;
    episodeVideo.addEventListener('loadedmetadata', () => {
      if (resumeTime > 0 && resumeTime < episodeVideo.duration) {
        episodeVideo.currentTime = resumeTime;
        ChamverseApp.showToast(`${Math.floor(resumeTime / 60)}분 ${Math.floor(resumeTime % 60)}초부터 이어서 재생해요.`);
      }
    }, { once: true });
    episodeVideo.src = episodeLink;
    if (typeof episodePlayer.showModal === 'function') episodePlayer.showModal();
    else episodePlayer.setAttribute('open', '');
    episodeVideo.play().catch(() => {});
  };
  const isEpisodeFullscreen = () => (
    document.fullscreenElement === episodePlayer
    || episodePlayer.classList.contains('is-fullscreen')
  );
  let requestedOrientation = null;
  const updateOrientationButton = () => {
    if (!isEpisodeFullscreen()) {
      episodeFullscreenButton.textContent = '전체 화면';
      episodeFullscreenButton.setAttribute('aria-label', '전체 화면으로 보기');
      return;
    }
    const physicalOrientation = window.matchMedia('(orientation: landscape)').matches
      ? 'landscape'
      : 'portrait';
    const activeOrientation = requestedOrientation || physicalOrientation;
    episodePlayer.classList.toggle(
      'is-landscape',
      activeOrientation === 'landscape' && physicalOrientation !== 'landscape'
    );
    episodePlayer.classList.toggle(
      'is-portrait',
      activeOrientation === 'portrait' && physicalOrientation !== 'portrait'
    );
    const isLandscape = activeOrientation === 'landscape';
    episodeFullscreenButton.textContent = isLandscape ? '세로 보기' : '가로 보기';
    episodeFullscreenButton.setAttribute('aria-label', isLandscape ? '세로 화면으로 보기' : '가로 화면으로 보기');
  };
  const exitEpisodeFullscreen = () => {
    episodePlayer.classList.remove('is-fullscreen', 'is-landscape', 'is-portrait');
    requestedOrientation = null;
    if (document.fullscreenElement === episodePlayer && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    if (screen.orientation?.unlock) screen.orientation.unlock();
    updateOrientationButton();
  };
  const closeEpisodePlayer = () => {
    exitEpisodeFullscreen();
    savePlaybackProgress();
    activeEpisode = null;
    episodeVideo.pause();
    episodeVideo.removeAttribute('src');
    episodeVideo.load();
    if (episodePlayer.open) episodePlayer.close();
  };
  document.getElementById('episodeList').addEventListener('click', (event) => {
    const episode = event.target.closest('[data-episode-video]');
    if (episode) openEpisodePlayer(episode);
  });
  document.getElementById('episodeList').addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-episode-video]')) {
      event.preventDefault();
      openEpisodePlayer(event.target.closest('[data-episode-video]'));
    }
  });
  episodePlayerClose.addEventListener('click', closeEpisodePlayer);
  episodeFullscreenButton.addEventListener('click', async () => {
    if (!isEpisodeFullscreen()) {
      requestedOrientation = null;
      episodePlayer.classList.remove('is-landscape', 'is-portrait');
      const requestFullscreen = episodePlayer.requestFullscreen || episodePlayer.webkitRequestFullscreen;
      try {
        if (requestFullscreen) await requestFullscreen.call(episodePlayer);
        else episodePlayer.classList.add('is-fullscreen');
      } catch {
        // iOS 등 표준 전체 화면을 지원하지 않는 환경에서도 X 버튼이 보이는 화면을 제공합니다.
        episodePlayer.classList.add('is-fullscreen');
      }
      updateOrientationButton();
      return;
    }

    const activeOrientation = requestedOrientation || (window.matchMedia('(orientation: landscape)').matches
      ? 'landscape'
      : 'portrait');
    const nextOrientation = activeOrientation === 'landscape'
      ? 'portrait'
      : 'landscape';
    requestedOrientation = nextOrientation;
    try {
      if (!screen.orientation?.lock) throw new Error('Orientation lock is not supported');
      await screen.orientation.lock(nextOrientation);
    } catch { /* 화면 내 회전 방식으로 계속 표시합니다. */ }
    updateOrientationButton();
    window.setTimeout(updateOrientationButton, 100);
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && screen.orientation?.unlock) screen.orientation.unlock();
    updateOrientationButton();
  });
  window.addEventListener('orientationchange', updateOrientationButton);
  episodePlayer.addEventListener('click', (event) => {
    if (event.target === episodePlayer) closeEpisodePlayer();
  });
  episodePlayer.addEventListener('close', () => {
    exitEpisodeFullscreen();
    savePlaybackProgress();
    activeEpisode = null;
    episodeVideo.pause();
    episodeVideo.removeAttribute('src');
    episodeVideo.load();
  });

  episodeVideo.addEventListener('timeupdate', () => {
    const currentSecond = Math.floor(episodeVideo.currentTime || 0);
    if (currentSecond > 0 && currentSecond - lastSavedSecond >= 5) {
      lastSavedSecond = currentSecond;
      savePlaybackProgress();
    }
  });
  episodeVideo.addEventListener('pause', savePlaybackProgress);
  episodeVideo.addEventListener('ended', () => {
    activeEpisodeCompleted = true;
    savePlaybackProgress({ completed: true });
  });
  window.addEventListener('pagehide', savePlaybackProgress);

  const playFirstEpisode = () => {
    const savedEpisode = getSavedEpisode();
    if (savedEpisode?.season && seasons.includes(savedEpisode.season) && seasonSelect.value !== savedEpisode.season) {
      seasonSelect.value = savedEpisode.season;
      document.getElementById('playSeasonTag').textContent = savedEpisode.season;
      renderEpisodes(savedEpisode.season);
    }
    const episodeToPlay = [...document.querySelectorAll('#episodeList [data-episode-video]')]
      .find((episode) => episode.dataset.episodeVideo === savedEpisode?.episodeLink)
      || document.querySelector('#episodeList [data-episode-video]');
    if (!episodeToPlay) {
      ChamverseApp.showToast('재생할 수 있는 에피소드가 아직 없어요.');
      return;
    }
    openEpisodePlayer(episodeToPlay);
  };
  document.getElementById('playButton').addEventListener('click', () => {
    playFirstEpisode();
  });
  if (shouldAutoPlay) requestAnimationFrame(playFirstEpisode);
  const wishButton = document.getElementById('wishButton');
  const renderWishButton = () => {
    const wished = ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(item.id);
    wishButton.setAttribute('aria-pressed', String(wished));
    wishButton.classList.toggle('is-active', wished);
    wishButton.innerHTML = wished
      ? '<span class="wish-icon is-filled" aria-hidden="true">♥</span> 찜하기 취소'
      : '<span class="wish-icon" aria-hidden="true">♡</span> 찜하기';
  };

  renderWishButton();
  wishButton.addEventListener('click', () => {
    const added = ChamverseApp.toggleId(ChamverseApp.KEY.wish, item.id);
    renderWishButton();
    ChamverseApp.showToast(added ? '찜 목록에 추가했어요.' : '찜 목록에서 삭제했어요.');
  });
  const downloadAction = document.getElementById('downloadAction');
  const downloadActionIcon = document.getElementById('downloadActionIcon');
  const downloadActionLabel = document.getElementById('downloadActionLabel');
  const renderDownloadAction = () => {
    const downloaded = ChamverseApp.uniqueIds(ChamverseApp.KEY.downloads).includes(item.id);
    downloadAction.setAttribute('aria-pressed', String(downloaded));
    downloadActionIcon.src = downloaded ? '../images/play/icon-12.png' : '../images/play/icon-11.png';
    downloadActionLabel.textContent = downloaded ? '다운로드 완료' : '다운로드';
  };

  renderDownloadAction();
  downloadAction.addEventListener('click', () => {
    const added = ChamverseApp.toggleId(ChamverseApp.KEY.downloads, item.id);
    renderDownloadAction();
    ChamverseApp.showToast(added ? '다운로드 목록에 추가했어요.' : '다운로드 목록에서 삭제했어요.');
  });
  window.addEventListener('pageshow', renderDownloadAction);
  document.querySelector('[data-action="share"]').addEventListener('click', async () => {
    const link = location.href;
    if (navigator.clipboard) await navigator.clipboard.writeText(link);
    ChamverseApp.showToast('공유 링크를 복사했어요.');
  });
  document.querySelector('[data-action="rating"]').addEventListener('click', () => ChamverseApp.showToast(`평점 ${item.rating} 작품입니다.`));
});
