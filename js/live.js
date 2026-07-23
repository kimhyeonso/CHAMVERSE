document.addEventListener('DOMContentLoaded', async () => {
  /* ------------------------------------------------------------------------
     라이브 진행 연출
     페이지 진입 시 바가 75% 채워진 막바지 상태에서 시작합니다.
     12:50:00부터 13:00:00까지 실제 10분 동안 나머지 25%를 채웁니다.
     ------------------------------------------------------------------------ */
  const elapsedTime = document.getElementById('liveElapsed');
  const progress = document.getElementById('liveProgress');
  const progressBar = document.getElementById('liveProgressBar');
  const mobileElapsedTime = document.getElementById('liveElapsedMobile');
  const mobileProgress = document.getElementById('liveProgressMobile');
  const mobileProgressBar = document.getElementById('liveProgressBarMobile');
  const displayDurationInSeconds = 10 * 60;
  const animationDuration = 10 * 60 * 1000;
  const initialProgress = 0.75;
  const startTimeInSeconds = (12 * 60 * 60) + (50 * 60);
  const animationStartedAt = performance.now();
  let previousSecond = -1;
  let progressAnimationId;

  /* 초 단위 시간을 12:30:00 형태로 변환합니다. */
  const formatClock = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  };

  /* 바는 매 프레임 부드럽게 움직이고, 시간 글자는 초가 바뀔 때만 갱신합니다. */
  const animateLiveProgress = (now) => {
    const elapsed = Math.min(now - animationStartedAt, animationDuration);
    const animationRatio = elapsed / animationDuration;
    const progressRatio = initialProgress + (animationRatio * (1 - initialProgress));
    const currentSecond = Math.floor(animationRatio * displayDurationInSeconds);

    progressBar.style.transform = `scaleX(${progressRatio})`;
    mobileProgressBar.style.transform = `scaleX(${progressRatio})`;

    if (currentSecond !== previousSecond) {
      elapsedTime.textContent = formatClock(startTimeInSeconds + currentSecond);
      mobileElapsedTime.textContent = elapsedTime.textContent;
      progress.setAttribute('aria-valuenow', String(Math.round(progressRatio * 100)));
      mobileProgress.setAttribute('aria-valuenow', progress.getAttribute('aria-valuenow'));
      previousSecond = currentSecond;
    }

    /* 10분이 되면 13:00:00과 가득 찬 바를 유지하고 종료합니다. */
    if (elapsed < animationDuration) {
      progressAnimationId = requestAnimationFrame(animateLiveProgress);
    } else {
      progressBar.style.willChange = 'auto';
      mobileProgressBar.style.willChange = 'auto';
    }
  };

  progressAnimationId = requestAnimationFrame(animateLiveProgress);

  /* 페이지를 떠날 때 남아 있는 애니메이션 요청을 정리합니다. */
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(progressAnimationId);
  }, { once: true });

  /* ------------------------------------------------------------------------
     로컬 라이브 영상
     메타데이터만 미리 읽고, 중앙 재생 버튼을 누를 때 실제 영상을 재생합니다.
     재생 중에는 브라우저 기본 컨트롤을 사용하고 종료되면 포스터로 돌아갑니다.
     ------------------------------------------------------------------------ */
  const liveVideo = document.querySelector('.live-video');
  const livePlayer = document.getElementById('livePlayer');
  const livePlayButton = document.getElementById('livePlayButton');
  const landscapeCloseButton = document.getElementById('landscapeCloseButton');
  const liveFullscreenButton = document.getElementById('liveFullscreenButton');
  const liveWatchButton = document.getElementById('liveWatchButton');
  const liveWishButton = document.getElementById('liveWishButton');

  const closeFallbackLandscape = () => {
    liveVideo.classList.remove('is-fallback-landscape');
    document.body.classList.remove('live-landscape-active');
  };

  const openLivePlayer = async () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    try {
      if (liveVideo.requestFullscreen && (!isMobile || screen.orientation?.lock)) {
        await liveVideo.requestFullscreen();

        if (isMobile && screen.orientation?.lock) {
          await screen.orientation.lock('landscape');
        }

        liveVideo.classList.add('is-native-fullscreen');
        return;
      }

      if (!isMobile) return;
    } catch {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      }
    }

    if (!isMobile) return;

    /* 자동 회전이 막힌 모바일 브라우저에서는 영상을 직접 90도 회전합니다. */
    liveVideo.classList.add('is-fallback-landscape');
    document.body.classList.add('live-landscape-active');
  };

  landscapeCloseButton.addEventListener('click', async () => {
    closeFallbackLandscape();

    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen().catch(() => {});
    }
  });

  liveFullscreenButton.addEventListener('click', () => {
    openLivePlayer();
  });

  liveWatchButton.addEventListener('click', () => {
    livePlayButton.click();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeFallbackLandscape();
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && liveVideo.classList.contains('is-native-fullscreen')) {
      liveVideo.classList.remove('is-native-fullscreen');
    }
  });

  livePlayButton.addEventListener('click', async () => {
    liveVideo.classList.add('has-started');

    try {
      livePlayer.controls = true;
      const playPromise = livePlayer.play();
      await openLivePlayer();
      await playPromise;
    } catch {
      livePlayer.controls = false;
      ChamverseApp.showToast('영상을 재생할 수 없어요');
    }
  });

  livePlayer.addEventListener('play', () => {
    liveVideo.classList.add('is-playing');
    livePlayButton.setAttribute('aria-label', '원피스 라이브 영상 재생 중');
  });

  livePlayer.addEventListener('pause', () => {
    if (livePlayer.ended) return;
    liveVideo.classList.remove('is-playing');
    livePlayButton.setAttribute('aria-label', '원피스 라이브 영상 이어서 재생');
  });

  livePlayer.addEventListener('ended', () => {
    closeFallbackLandscape();
    liveVideo.classList.remove('is-playing');
    livePlayer.controls = false;
    livePlayer.currentTime = 0;
    livePlayer.load();
    livePlayButton.setAttribute('aria-label', '원피스 라이브 영상 다시 재생');
  });

  const items = await ChamverseApp.getContents();
  const live = items.find((item) => item.isLive) || items.find((item) => item.isRecommend) || items[0];
  const syncLiveWishButton = () => {
    const isWished = ChamverseApp.uniqueIds(ChamverseApp.KEY.wish).includes(live.id);
    liveWishButton.classList.toggle('is-set', isWished);
    liveWishButton.querySelector('span').textContent = isWished ? '♥' : '♡';
    liveWishButton.querySelector('b').textContent = isWished ? '찜 완료' : '찜하기';
  };
  syncLiveWishButton();
  liveWishButton.addEventListener('click', () => {
    ChamverseApp.toggleId(ChamverseApp.KEY.wish, live.id);
    syncLiveWishButton();
  });
  const schedule = [live, ...items.filter((item) => item.id !== live.id).slice(0, 5)];
  livePlayer.poster = '../images/live/live01.jpg';
  document.getElementById('liveTitle').textContent = live.title;
  document.getElementById('liveDescription').textContent = live.description;
  const scheduleTimes = ['12:30', '13:00', '13:30', '14:00', '14:30', '15:00'];
  document.getElementById('scheduleList').innerHTML = schedule.map((item, index) => {
    const alertKey = `live-${item.id}`;
    const alertEnabled = index > 0 && ChamverseApp.getToggle(ChamverseApp.KEY.notifications, alertKey);
    return `
      <div class="schedule-row">
        <div class="schedule-status">
          <time>${scheduleTimes[index]}</time>
          ${index < 2 ? `<strong class="desktop-schedule-label">${index === 0 ? 'LIVE' : 'NEXT'}</strong>` : ''}
        </div>
        <div class="schedule-copy">
          <div class="schedule-title-line">
            <h3>${item.title}</h3>
            ${index < 2 ? `<strong class="mobile-schedule-label">${index === 0 ? 'NOW' : 'NEXT'}</strong>` : ''}
          </div>
          <p>${item.description}</p>
          <small class="schedule-duration">${item.runningTime || '25분'}</small>
        </div>
        <div class="schedule-action">
          <button type="button" class="${alertEnabled ? 'is-set' : ''}" aria-label="${index === 0 ? `${item.title} 라이브 시청` : `${item.title} 라이브 알림 ${alertEnabled ? '취소' : '설정'}`}" data-live-alert="${item.id}">
            ${index === 0
              ? '<span class="schedule-play-icon" aria-hidden="true"></span><span class="button-label desktop-button-label">시청하기</span><span class="button-label mobile-button-label">라이브</span>'
              : `<span class="notification-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10.3 21a2 2 0 0 0 3.4 0"></path></svg></span><span class="button-label desktop-button-label">${alertEnabled ? '설정됨' : '알림 설정'}</span><span class="button-label mobile-button-label">${alertEnabled ? '설정됨' : '알림'}</span>`}
          </button>
        </div>
      </div>`;
  }).join('');
  const scheduleList = document.getElementById('scheduleList');
  const schedulePrev = document.getElementById('schedulePrev');
  const scheduleNext = document.getElementById('scheduleNext');

  /* PC 편성표는 카드 한 칸씩 부드럽게 이동하고, 양 끝에서는 화살표를 비활성화합니다. */
  const updateScheduleControls = () => {
    const maxScrollLeft = scheduleList.scrollWidth - scheduleList.clientWidth;
    schedulePrev.disabled = scheduleList.scrollLeft <= 1;
    scheduleNext.disabled = scheduleList.scrollLeft >= maxScrollLeft - 1;
  };

  const moveSchedule = (direction) => {
    const firstCard = scheduleList.querySelector('.schedule-row');
    if (!firstCard) return;
    const gap = 12;
    scheduleList.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: 'smooth'
    });
  };

  schedulePrev.addEventListener('click', () => moveSchedule(-1));
  scheduleNext.addEventListener('click', () => moveSchedule(1));
  scheduleList.addEventListener('scroll', updateScheduleControls, { passive: true });
  window.addEventListener('resize', updateScheduleControls);
  updateScheduleControls();

  scheduleList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-live-alert]');
    if (button && Number(button.dataset.liveAlert) === Number(live.id)) {
      livePlayButton.click();
      return;
    }
    if (!button || button.textContent.trim() === '라이브') return;
    const alertKey = `live-${button.dataset.liveAlert}`;
    const alertEnabled = !ChamverseApp.getToggle(ChamverseApp.KEY.notifications, alertKey);
    ChamverseApp.setToggle(ChamverseApp.KEY.notifications, alertKey, alertEnabled);
    const buttonLabel = button.querySelector('.button-label');
    const desktopLabel = button.querySelector('.desktop-button-label');
    const mobileLabel = button.querySelector('.mobile-button-label');
    if (buttonLabel) buttonLabel.textContent = alertEnabled ? '설정됨' : '알림';
    if (desktopLabel) desktopLabel.textContent = alertEnabled ? '설정됨' : '알림 설정';
    if (mobileLabel) mobileLabel.textContent = alertEnabled ? '설정됨' : '알림';
    button.classList.toggle('is-set', alertEnabled);
    button.setAttribute('aria-label', `라이브 알림 ${alertEnabled ? '취소' : '설정'}`);
    ChamverseApp.showToast(alertEnabled ? '라이브 알림을 켰어요' : '라이브 알림을 껐어요');
  });
});
