document.addEventListener('DOMContentLoaded', () => {

  const floatingVote =
    document.querySelector('#floatingVote');

  const battleSection =
    document.querySelector('#battleSection');

  const revealElements =
    document.querySelectorAll('.reveal');


  /* =====================================
     REVEAL ANIMATION
  ====================================== */

  const revealObserver =
    new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add(
            'is-visible'
          );

          observer.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.15
      }
    );


  revealElements.forEach(element => {

    revealObserver.observe(
      element
    );

  });



  /* =====================================
     BATTLE GRAPH
  ====================================== */

  if (battleSection) {

    const battleObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (
              entry.isIntersecting
            ) {

              battleSection.classList.add(
                'is-active'
              );

            }

          });

        },
        {
          threshold: 0.35
        }
      );


    battleObserver.observe(
      battleSection
    );

  }



  /* =====================================
     FLOATING VOTE CTA
  ====================================== */

  const updateFloatingVote = () => {

    if (!floatingVote) return;


    const scrollTop =
      window.scrollY;

    const documentHeight =
      document.documentElement
        .scrollHeight;

    const windowHeight =
      window.innerHeight;

    const maxScroll =
      documentHeight -
      windowHeight;


    if (maxScroll <= 0) {
      return;
    }


    const scrollProgress =
      scrollTop /
      maxScroll;


    /*
      페이지 58% 정도 내려왔을 때부터
      투표 CTA 등장
    */

    if (
      scrollProgress >= 0.58
    ) {

      floatingVote.classList.add(
        'is-visible'
      );

    } else {

      floatingVote.classList.remove(
        'is-visible'
      );

    }

  };


  window.addEventListener(
    'scroll',
    updateFloatingVote,
    {
      passive: true
    }
  );


  updateFloatingVote();

});

/* =========================================
   MOBILE CHARACTER CAROUSEL
========================================= */

const characterCarousel =
  document.querySelector('.character-grid');

const carouselCards =
  characterCarousel
    ? [
        ...characterCarousel.querySelectorAll(
          '.character-card'
        )
      ]
    : [];


/*
  HTML 순서

  0 = 피카츄
  1 = 자두
  2 = 케로로

  처음 중앙 = 자두
*/

let activeCharacterIndex = 1;

let dragStartX = 0;
let dragCurrentX = 0;
let isDragging = false;


/* =========================================
   카드 위치 갱신
========================================= */

function updateCharacterCarousel() {

  if (
    !characterCarousel ||
    window.innerWidth > 430
  ) {
    return;
  }


  carouselCards.forEach(
    (card, index) => {

      card.classList.remove(
        'is-left',
        'is-center',
        'is-right'
      );


      const difference =
        (
          index -
          activeCharacterIndex +
          carouselCards.length
        ) % carouselCards.length;


      if (difference === 0) {

        card.classList.add(
          'is-center'
        );

      }

      else if (difference === 1) {

        card.classList.add(
          'is-right'
        );

      }

      else {

        card.classList.add(
          'is-left'
        );

      }

    }
  );

}


/* =========================================
   DRAG START
========================================= */

function startCharacterDrag(event) {

  if (
    window.innerWidth > 430 ||
    !characterCarousel
  ) {
    return;
  }


  isDragging = true;

  dragStartX =
    event.clientX;

  dragCurrentX = 0;


  characterCarousel.classList.add(
    'is-dragging'
  );


  if (
    characterCarousel
      .setPointerCapture
  ) {

    characterCarousel.setPointerCapture(
      event.pointerId
    );

  }

}


/* =========================================
   DRAG MOVE
========================================= */

function moveCharacterDrag(event) {

  if (!isDragging) {
    return;
  }


  dragCurrentX =
    event.clientX -
    dragStartX;


  const limitedDrag =
    Math.max(
      -100,
      Math.min(
        100,
        dragCurrentX
      )
    );


  characterCarousel.style.setProperty(
    '--drag-x',
    `${limitedDrag}px`
  );

}


/* =========================================
   DRAG END
========================================= */

function endCharacterDrag() {

  if (!isDragging) {
    return;
  }


  isDragging = false;


  characterCarousel.classList.remove(
    'is-dragging'
  );


  /*
    왼쪽으로 밀기
    → 오른쪽 카드가 중앙으로
  */

  if (dragCurrentX < -45) {

    activeCharacterIndex =
      (
        activeCharacterIndex + 1
      ) %
      carouselCards.length;

  }


  /*
    오른쪽으로 밀기
    → 왼쪽 카드가 중앙으로
  */

  else if (dragCurrentX > 45) {

    activeCharacterIndex =
      (
        activeCharacterIndex -
        1 +
        carouselCards.length
      ) %
      carouselCards.length;

  }


  characterCarousel.style.setProperty(
    '--drag-x',
    '0px'
  );


  updateCharacterCarousel();

}


/* =========================================
   EVENT
========================================= */

if (
  characterCarousel &&
  carouselCards.length
) {

  characterCarousel.addEventListener(
    'pointerdown',
    startCharacterDrag
  );


  characterCarousel.addEventListener(
    'pointermove',
    moveCharacterDrag
  );


  characterCarousel.addEventListener(
    'pointerup',
    endCharacterDrag
  );


  characterCarousel.addEventListener(
    'pointercancel',
    endCharacterDrag
  );

}


/* =========================================
   INIT
========================================= */

updateCharacterCarousel();


window.addEventListener(
  'resize',
  updateCharacterCarousel
);