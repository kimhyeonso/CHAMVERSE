document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('playBackButton').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = 'main.html';
  });

  const [items, playData] = await Promise.all([ChamverseApp.getContents(), ChamverseApp.getPlayData()]);
  const id = Number(new URLSearchParams(location.search).get('id')) || items[0].id;
  const item = items.find((content) => content.id === id) || items[0];
  const detail = playData.find((content) => content.contentId === item.id) || {};
  const detailVideoOverlay = document.getElementById('detailVideoOverlay');
  const detailVideoPlayer = document.getElementById('detailVideoPlayer');
  const detailVideoClose = document.getElementById('detailVideoClose');
  const videoSources = {
    1: '../videos/crayon-shin-chan.mp4',
    2: '../videos/Hello%20Jadoo.mp4',
    3: '../videos/atashinchi.mp4'
  };
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

  const openEpisodePlayer = (episode) => {
    ChamverseApp.setContinueWatching(item.id, 0);
    episodePlayerTitle.textContent = episode.querySelector('h3').textContent;
    episodeVideo.src = episode.dataset.episodeVideo;
    if (typeof episodePlayer.showModal === 'function') episodePlayer.showModal();
    else episodePlayer.setAttribute('open', '');
    episodeVideo.play().catch(() => {});
  };
  const closeEpisodePlayer = () => {
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
    const requestFullscreen = episodeVideo.requestFullscreen || episodeVideo.webkitRequestFullscreen;
    try {
      if (requestFullscreen) await requestFullscreen.call(episodeVideo);
      else if (episodeVideo.webkitEnterFullscreen) episodeVideo.webkitEnterFullscreen();
      else throw new Error('Fullscreen is not supported');
    } catch {
      ChamverseApp.showToast('이 브라우저에서는 크게 보기를 지원하지 않아요.');
      return;
    }

    try {
      if (screen.orientation?.lock) await screen.orientation.lock('landscape');
    } catch {
      // 일부 브라우저는 전체 화면이어도 화면 방향 잠금을 허용하지 않습니다.
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && screen.orientation?.unlock) screen.orientation.unlock();
  });
  episodePlayer.addEventListener('click', (event) => {
    if (event.target === episodePlayer) closeEpisodePlayer();
  });
  episodePlayer.addEventListener('close', () => {
    episodeVideo.pause();
    episodeVideo.removeAttribute('src');
    episodeVideo.load();
  });

  let detailVideoRequestedFullscreen = false;

  const closeDetailVideo = () => {
    detailVideoPlayer.pause();
    detailVideoPlayer.removeAttribute('src');
    detailVideoPlayer.load();
    detailVideoOverlay.hidden = true;
    document.body.classList.remove('detail-video-open');
    detailVideoRequestedFullscreen = false;
  };

  const openDetailVideo = () => {
    const source = videoSources[item.id];
    if (!source) {
      ChamverseApp.showToast('재생 가능한 영상이 준비 중이에요.');
      return;
    }

    detailVideoPlayer.src = source;
    detailVideoOverlay.hidden = false;
    document.body.classList.add('detail-video-open');
    detailVideoPlayer.play().catch(() => {});

    if (detailVideoPlayer.requestFullscreen) {
      detailVideoRequestedFullscreen = true;
      detailVideoPlayer.requestFullscreen().catch(() => {
        detailVideoRequestedFullscreen = false;
      });
    } else if (detailVideoPlayer.webkitEnterFullscreen) {
      detailVideoRequestedFullscreen = true;
      detailVideoPlayer.webkitEnterFullscreen();
    }
  };

  detailVideoClose.addEventListener('click', closeDetailVideo);
  detailVideoPlayer.addEventListener('ended', closeDetailVideo);
  detailVideoPlayer.addEventListener('webkitendfullscreen', closeDetailVideo);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !detailVideoOverlay.hidden && !document.fullscreenElement) {
      closeDetailVideo();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (detailVideoRequestedFullscreen && !document.fullscreenElement && !detailVideoOverlay.hidden) {
      closeDetailVideo();
    }
  });

  document.getElementById('playButton').addEventListener('click', () => {
    const firstEpisode = document.querySelector('#episodeList [data-episode-video]');
    if (!firstEpisode) {
      ChamverseApp.showToast('재생할 수 있는 에피소드가 아직 없어요.');
      return;
    }
    openEpisodePlayer(firstEpisode);
  });
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
