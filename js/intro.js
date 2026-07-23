(function initializeChamverseIntro() {
  const page = document.body;
  const canvas = document.querySelector(
    '.signal-noise'
  );

  const skipButton = document.querySelector(
    '.skip-intro'
  );

  const status = document.getElementById(
    'introStatus'
  );

  const prefersReducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

  /*
   * intro.html?preview=1로 접속하면
   * 애니메이션 종료 후 다른 페이지로 이동하지 않습니다.
   */
  const isPreview =
    new URLSearchParams(location.search)
      .get('preview') === '1';

  const timers = [];

  let stopStatic = () => {};
  let navigationStarted = false;

  function schedule(callback, delay) {
    const timer = window.setTimeout(
      callback,
      delay
    );

    timers.push(timer);

    return timer;
  }

  function updateStatus(message) {
    if (!status) return;

    status.textContent = message;
  }

  function readActiveUser() {
    try {
      const storedUser = localStorage.getItem(
        'chamverse:user'
      );

      if (!storedUser) return null;

      const parsedUser = JSON.parse(storedUser);

      return parsedUser
        && typeof parsedUser === 'object'
        ? parsedUser
        : null;
    } catch {
      return null;
    }
  }

  function nextDestination() {
    const isLoggedIn = Boolean(
      readActiveUser()
    );

    return isLoggedIn
      ? page.dataset.memberDestination
        || 'myPage.html'
      : page.dataset.guestDestination
        || 'login.html';
  }

  function clearTimers() {
    timers.forEach((timer) => {
      window.clearTimeout(timer);
    });

    timers.length = 0;
  }

  function navigateNext(immediate = false) {
    if (navigationStarted) return;

    navigationStarted = true;
    clearTimers();
    stopStatic();

    page.classList.add(
      'is-tv-on',
      'is-logo-coloring',
      'is-paper-wash'
    );

    updateStatus(
      '다음 화면으로 이동합니다.'
    );

    if (isPreview) {
      page.classList.add(
        'is-preview-complete'
      );

      navigationStarted = false;

      return;
    }

    const destination = nextDestination();

    if (immediate) {
      location.replace(destination);
      return;
    }

    page.classList.add('is-exiting');

    window.setTimeout(() => {
      location.replace(destination);
    }, 420);
  }

  /*
   * 작은 캔버스에 아날로그 노이즈를 만든 뒤
   * 화면 전체로 확대해 성능 부담을 줄입니다.
   */
  function createStaticRenderer() {
    if (!canvas) return () => {};

    const context = canvas.getContext(
      '2d',
      {
        alpha: false
      }
    );

    if (!context) return () => {};

    let running = true;
    let frameRequest = 0;
    let previousFrame = 0;

    function resizeCanvas() {
      const width = Math.min(
        360,
        Math.max(
          190,
          Math.round(innerWidth / 5)
        )
      );

      const height = Math.min(
        240,
        Math.max(
          130,
          Math.round(innerHeight / 5)
        )
      );

      canvas.width = width;
      canvas.height = height;
    }

    function randomShift(range) {
      return (
        Math.random() * range * 2
        - range
      );
    }

    function paintStatic(time) {
      if (!running) return;

      if (time - previousFrame < 48) {
        frameRequest =
          requestAnimationFrame(paintStatic);

        return;
      }

      previousFrame = time;

      const {
        width,
        height
      } = canvas;

      const frame = context.createImageData(
        width,
        height
      );

      const pixels = frame.data;

      let cursor = 0;

      for (let y = 0; y < height; y += 1) {
        const linePulse =
          Math.random() > 0.93
            ? randomShift(58)
            : randomShift(12);

        for (let x = 0; x < width; x += 1) {
          const grain =
            30 + Math.random() * 185;

          const colorChance = Math.random();

          let red = grain + linePulse;
          let green = grain + linePulse;
          let blue = grain + linePulse;

          if (colorChance > 0.91) {
            red += randomShift(46);
            green += randomShift(30);
            blue += randomShift(52);
          }

          pixels[cursor] = red;
          pixels[cursor + 1] = green;
          pixels[cursor + 2] = blue;
          pixels[cursor + 3] = 255;

          cursor += 4;
        }
      }

      context.putImageData(frame, 0, 0);

      const tearCount =
        3 + Math.floor(Math.random() * 5);

      for (
        let index = 0;
        index < tearCount;
        index += 1
      ) {
        const sourceY =
          Math.floor(Math.random() * height);

        const stripHeight =
          1 + Math.floor(Math.random() * 6);

        const offset =
          Math.floor(randomShift(16));

        context.drawImage(
          canvas,
          0,
          sourceY,
          width,
          stripHeight,
          offset,
          sourceY,
          width,
          stripHeight
        );
      }

      if (Math.random() > 0.74) {
        const glowY =
          Math.floor(Math.random() * height);

        const gradient =
          context.createLinearGradient(
            0,
            glowY,
            width,
            glowY
          );

        gradient.addColorStop(
          0,
          'rgba(255,255,255,0)'
        );

        gradient.addColorStop(
          0.5,
          'rgba(255,255,255,0.34)'
        );

        gradient.addColorStop(
          1,
          'rgba(255,255,255,0)'
        );

        context.fillStyle = gradient;

        context.fillRect(
          0,
          glowY,
          width,
          1 + Math.random() * 4
        );
      }

      frameRequest =
        requestAnimationFrame(paintStatic);
    }

    resizeCanvas();

    window.addEventListener(
      'resize',
      resizeCanvas,
      {
        passive: true
      }
    );

    frameRequest =
      requestAnimationFrame(paintStatic);

    return () => {
      running = false;
      cancelAnimationFrame(frameRequest);

      window.removeEventListener(
        'resize',
        resizeCanvas
      );
    };
  }

  /*
   * 로고 PNG의 투명 영역을 분석해 실제 글자와
   * 별·장식 조각을 자동으로 분리합니다.
   */
  async function prepareLogoPieces() {
    const sourceImage = document.querySelector(
      '.logo-image--color'
    );

    const pieceContainer =
      document.querySelector('.logo-letters');

    if (!sourceImage || !pieceContainer) {
      return;
    }

    try {
      if (
        !sourceImage.complete
        || !sourceImage.naturalWidth
      ) {
        await sourceImage.decode();
      }

      const sampleWidth = Math.min(
        900,
        sourceImage.naturalWidth
      );

      const sampleHeight = Math.round(
        sourceImage.naturalHeight
        * sampleWidth
        / sourceImage.naturalWidth
      );

      const workCanvas =
        document.createElement('canvas');

      workCanvas.width = sampleWidth;
      workCanvas.height = sampleHeight;

      const workContext =
        workCanvas.getContext(
          '2d',
          {
            willReadFrequently: true
          }
        );

      if (!workContext) return;

      workContext.clearRect(
        0,
        0,
        sampleWidth,
        sampleHeight
      );

      workContext.drawImage(
        sourceImage,
        0,
        0,
        sampleWidth,
        sampleHeight
      );

      const sourceFrame =
        workContext.getImageData(
          0,
          0,
          sampleWidth,
          sampleHeight
        );

      const totalPixels =
        sampleWidth * sampleHeight;

      const visited =
        new Uint8Array(totalPixels);

      const queue =
        new Int32Array(totalPixels);

      const components = [];
      const alphaThreshold = 16;

      function alphaAt(index) {
        return sourceFrame.data[
          index * 4 + 3
        ];
      }

      function addNeighbor(
        index,
        tail
      ) {
        if (
          index < 0
          || index >= totalPixels
          || visited[index]
          || alphaAt(index) <= alphaThreshold
        ) {
          return tail;
        }

        visited[index] = 1;
        queue[tail] = index;

        return tail + 1;
      }

      for (
        let startIndex = 0;
        startIndex < totalPixels;
        startIndex += 1
      ) {
        if (
          visited[startIndex]
          || alphaAt(startIndex)
            <= alphaThreshold
        ) {
          continue;
        }

        let head = 0;
        let tail = 0;

        let minimumX = sampleWidth;
        let maximumX = 0;
        let minimumY = sampleHeight;
        let maximumY = 0;

        visited[startIndex] = 1;
        queue[tail] = startIndex;
        tail += 1;

        while (head < tail) {
          const current = queue[head];
          head += 1;

          const x =
            current % sampleWidth;

          const y =
            Math.floor(
              current / sampleWidth
            );

          minimumX = Math.min(
            minimumX,
            x
          );

          maximumX = Math.max(
            maximumX,
            x
          );

          minimumY = Math.min(
            minimumY,
            y
          );

          maximumY = Math.max(
            maximumY,
            y
          );

          if (x > 0) {
            tail = addNeighbor(
              current - 1,
              tail
            );
          }

          if (x < sampleWidth - 1) {
            tail = addNeighbor(
              current + 1,
              tail
            );
          }

          if (y > 0) {
            tail = addNeighbor(
              current - sampleWidth,
              tail
            );
          }

          if (y < sampleHeight - 1) {
            tail = addNeighbor(
              current + sampleWidth,
              tail
            );
          }

          if (x > 0 && y > 0) {
            tail = addNeighbor(
              current - sampleWidth - 1,
              tail
            );
          }

          if (
            x < sampleWidth - 1
            && y > 0
          ) {
            tail = addNeighbor(
              current - sampleWidth + 1,
              tail
            );
          }

          if (
            x > 0
            && y < sampleHeight - 1
          ) {
            tail = addNeighbor(
              current + sampleWidth - 1,
              tail
            );
          }

          if (
            x < sampleWidth - 1
            && y < sampleHeight - 1
          ) {
            tail = addNeighbor(
              current + sampleWidth + 1,
              tail
            );
          }
        }

        const width =
          maximumX - minimumX + 1;

        const height =
          maximumY - minimumY + 1;

        if (
          tail < 28
          || width < 3
          || height < 3
        ) {
          continue;
        }

        components.push({
          area: tail,
          x: minimumX,
          y: minimumY,
          width,
          height
        });
      }

      const candidates = components
        .filter((component) => {
          const aspect =
            component.width
            / component.height;

          const isUnderline =
            aspect > 3.1
            && component.y
              > sampleHeight * 0.54;

          return (
            component.area > 42
            && !isUnderline
          );
        })
        .sort((left, right) => (
          right.area - left.area
        ))
        .slice(0, 18)
        .sort((left, right) => (
          left.x - right.x
          || left.y - right.y
        ));

      if (candidates.length < 7) {
        throw new Error(
          '로고 글자 조각을 충분히 찾지 못했습니다.'
        );
      }

      const delays = [
        420,
        80,
        520,
        210,
        610,
        20,
        330,
        150,
        560,
        270,
        460,
        110,
        590,
        360,
        50,
        500,
        240,
        130
      ];

      const jumps = [
        22,
        29,
        24,
        31,
        26,
        34,
        25,
        30
      ];

      pieceContainer.replaceChildren();

      candidates.forEach(
        (component, index) => {
          const padding = 3;

          const cropX = Math.max(
            0,
            component.x - padding
          );

          const cropY = Math.max(
            0,
            component.y - padding
          );

          const cropWidth = Math.min(
            sampleWidth - cropX,
            component.width + padding * 2
          );

          const cropHeight = Math.min(
            sampleHeight - cropY,
            component.height + padding * 2
          );

          const pieceCanvas =
            document.createElement('canvas');

          pieceCanvas.width = cropWidth;
          pieceCanvas.height = cropHeight;

          const pieceContext =
            pieceCanvas.getContext('2d');

          if (!pieceContext) return;

          pieceContext.putImageData(
            workContext.getImageData(
              cropX,
              cropY,
              cropWidth,
              cropHeight
            ),
            0,
            0
          );

          const piece =
            document.createElement('img');

          piece.className = 'logo-piece';
          piece.alt = '';
          piece.draggable = false;
          piece.decoding = 'async';

          piece.src =
            pieceCanvas.toDataURL(
              'image/png'
            );

          piece.style.left =
            `${cropX / sampleWidth * 100}%`;

          piece.style.top =
            `${cropY / sampleHeight * 100}%`;

          piece.style.width =
            `${cropWidth / sampleWidth * 100}%`;

          piece.style.setProperty(
            '--delay',
            `${delays[index % delays.length]}ms`
          );

          piece.style.setProperty(
            '--jump',
            `${jumps[index % jumps.length]}px`
          );

          piece.style.setProperty(
            '--tilt',
            `${index % 2 === 0
              ? -3 - index % 3
              : 3 + index % 3}deg`
          );

          pieceContainer.append(piece);
        }
      );

      page.classList.add(
        'logo-pieces-ready'
      );
    } catch (error) {
      console.warn(
        '글자별 로고 애니메이션을 준비하지 못했습니다.',
        error
      );

      page.classList.add(
        'logo-pieces-fallback'
      );
    }
  }

  function playFullIntro() {
    stopStatic = createStaticRenderer();

    requestAnimationFrame(() => {
      page.classList.add('is-playing');
    });

    schedule(() => {
      page.classList.add('is-tv-on');

      updateStatus(
        '챔버스 로고의 불을 켜고 있습니다.'
      );
    }, 1650);

    schedule(() => {
      page.classList.add(
        'is-logo-coloring'
      );

      updateStatus(
        '챔버스의 색을 채우고 있습니다.'
      );
    }, 2540);

    schedule(() => {
      stopStatic();

      page.classList.add(
        'is-paper-wash'
      );

      updateStatus(
        '다음 화면을 준비하고 있습니다.'
      );
    }, 4040);

    schedule(() => {
      navigateNext();
    }, 5650);
  }

  function playReducedIntro() {
    page.classList.add(
      'is-playing',
      'is-tv-on',
      'is-logo-coloring',
      'is-paper-wash'
    );

    updateStatus(
      '다음 화면을 준비하고 있습니다.'
    );

    schedule(() => {
      navigateNext();
    }, 900);
  }

  skipButton?.addEventListener(
    'click',
    () => {
      navigateNext();
    }
  );

  window.addEventListener(
    'pagehide',
    () => {
      clearTimers();
      stopStatic();
    },
    {
      once: true
    }
  );

  prepareLogoPieces().finally(() => {
    if (prefersReducedMotion) {
      playReducedIntro();
    } else {
      playFullIntro();
    }
  });
}());