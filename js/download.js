document.addEventListener('DOMContentLoaded', async () => {

  const listElement = document.getElementById('downloadList');
  const downloadSort = document.querySelector('.download-sort');
  const tabs = document.querySelector('.tabs');

  ChamverseApp.showLoading(listElement);

  const items = await ChamverseApp.getContents();

  let category = '전체';
  let sort = 'recent';


  /* =========================================
     EMPTY STATE
  ========================================= */

  const createDownloadEmpty = () => `
    <div class="download-empty">

      <div class="download-empty__icon">
        <span>↓</span>
      </div>

      <span class="download-empty__label">
        OFFLINE LIBRARY
      </span>

      <h2>
        아직 다운로드한<br>
        콘텐츠가 없어요
      </h2>

      <p>
        보고 싶은 콘텐츠를 미리 저장해두면<br>
        인터넷 없이도 언제든 감상할 수 있어요.
      </p>

      <a
        href="main.html"
        class="download-empty__button"
      >
        콘텐츠 둘러보기
        <span>→</span>
      </a>

    </div>
  `;


  /* =========================================
     RENDER
  ========================================= */

  const render = () => {

    const downloadIds =
      ChamverseApp.uniqueIds(
        ChamverseApp.KEY.downloads
      );


    const allDownloaded =
      items.filter(
        item => downloadIds.includes(item.id)
      );


    /* =========================================
       STORAGE
    ========================================= */

    const usedMb =
      allDownloaded.reduce(
        (sum, item) =>
          sum +
          Math.max(
            120,
            Number(item.episode) || 120
          ),
        0
      );

    const totalMb = 5120;


    document.getElementById('storageUsed').textContent =
      usedMb >= 1024
        ? `${(usedMb / 1024).toFixed(1)}GB`
        : `${usedMb}MB`;


    document.getElementById('storageTotal').textContent =
      '5GB';


    document.getElementById('storageBar')
      .style.setProperty(
        '--value',
        `${Math.min(
          100,
          (usedMb / totalMb) * 100
        )}%`
      );


    /* =========================================
       다운로드가 하나도 없을 때
    ========================================= */

    if (allDownloaded.length === 0) {

      tabs.style.display = 'none';
      downloadSort.style.display = 'none';

      listElement.innerHTML =
        createDownloadEmpty();

      return;
    }


    /* =========================================
       다운로드가 있을 때
    ========================================= */

    tabs.style.display = '';
    downloadSort.style.display = 'flex';


    let downloaded = [
      ...allDownloaded
    ];


    /* =========================================
       CATEGORY
    ========================================= */

    if (category === '시리즈') {

      downloaded =
        downloaded.filter(
          item => item.episode > 12
        );

    }


    if (category === '극장판') {

      downloaded =
        downloaded.filter(
          item => item.episode <= 12
        );

    }


    /* =========================================
       SORT
    ========================================= */

    if (sort === 'title') {

      downloaded.sort(
        (a, b) =>
          a.title.localeCompare(
            b.title,
            'ko'
          )
      );

    }


    /* =========================================
       LIST
    ========================================= */

    if (downloaded.length) {

      listElement.innerHTML =
        downloaded
          .map(item => `

            <article class="download-item">

              <img
                src="${item.poster}"
                alt="${item.title}"
              >

              <div>

                <h3>
                  ${item.title}
                </h3>

                <p>
                  ${item.description}
                </p>

                <p>
                  ${Math.max(
                    120,
                    Number(item.episode) || 120
                  )}MB · 방금 다운로드 완료
                </p>

              </div>


              <button
                class="round-play"
                data-play="${item.id}"
                type="button"
                aria-label="${item.title} 재생"
              >
                ▶
              </button>


              <button
                class="download-remove"
                data-remove="${item.id}"
                type="button"
                aria-label="${item.title} 다운로드 삭제"
              >
                ×
              </button>

            </article>

          `)
          .join('');

    } else {

      listElement.innerHTML = `

        <div class="download-category-empty">

          <p>
            해당 카테고리에 다운로드한
            콘텐츠가 없어요.
          </p>

        </div>

      `;

    }

  };


  render();



  /* =========================================
     TAB
  ========================================= */

  document
    .querySelectorAll('.tab')
    .forEach(tab => {

      tab.addEventListener(
        'click',
        () => {

          category =
            tab.textContent.trim();


          document
            .querySelectorAll('.tab')
            .forEach(item => {

              item.classList.toggle(
                'active',
                item === tab
              );

            });


          render();

        }
      );

    });



  /* =========================================
     SORT
  ========================================= */

  document
    .getElementById('downloadSort')
    ?.addEventListener(
      'change',
      event => {

        sort =
          event.target.value;

        render();

      }
    );



  /* =========================================
     PLAY / REMOVE
  ========================================= */

  listElement.addEventListener(
    'click',
    event => {

      const remove =
        event.target.closest(
          '[data-remove]'
        );


      if (remove) {

        ChamverseApp.toggleId(
          ChamverseApp.KEY.downloads,
          remove.dataset.remove
        );


        ChamverseApp.showToast(
          '다운로드를 삭제했어요.'
        );


        render();

        return;

      }


      const play =
        event.target.closest(
          '[data-play]'
        );


      if (play) {

        location.href =
          `play.html?id=${play.dataset.play}`;

      }

    }
  );

});