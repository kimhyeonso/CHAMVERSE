document.addEventListener('DOMContentLoaded', () => {

  /* =====================================
     CHARACTER DATA
  ====================================== */

  const characters = [
    {
      id: 'ATAMAmMA',
      name: '아따맘마',
      englishName: 'ATAMAmMA',
      image: '../images/vote/ATAMAmMA-05.png',
      color: '#ffd86f',
    },

    {
      id: 'Dooly',
      name: '둘리',
      englishName: 'Dooly',
      image: '../images/vote/Dooly-02.png',
      color: '#b9dfb2',
    },

    {
      id: 'Doraemon',
      name: '도라에몽',
      englishName: 'Doraemon',
      image: '../images/vote/Doraemon-03.png',
      color: '#9ed9ef',
    },

    {
      id: 'patrick',
      name: '뚱이',
      englishName: 'patrick',
      image: '../images/vote/Patrick Star-11.png',
      color: '#f7c4dc',
    },

    {
      id: 'Keroro',
      name: '케로로',
      englishName: 'Keroro',
      image: '../images/vote/Keroro-07.png',
      color: '#f49a8f',
    },

    {
      id: 'loopy',
      name: '루피',
      englishName: 'loopy',
      image: '../images/vote/loopy-08.png',
      color: '#cab1ea',
    },

    {
      id: 'jadoo',
      name: '자두',
      englishName: 'jadoo',
      image: '../images/vote/jadoo-06.png',
      color: '#f8b6c4',
      
    },

    {
      id: 'Shin_Chan',
      name: '짱구',
      englishName: 'Shin_Chan',
      image: '../images/vote/Shin_chan-10.png',
      color: '#a9dcda',
    },
  ];



  /* =====================================
     ELEMENTS
  ====================================== */

  const characterGrid =
    document.querySelector('#characterGrid');

  const voteFloating =
    document.querySelector('#voteFloating');

  const voteSubmit =
    document.querySelector('#voteSubmit');

  const selectedName =
    document.querySelector('#selectedName');

  const selectedThumb =
    document.querySelector('#selectedThumb');


  const voteModal =
    document.querySelector('#voteModal');

  const modalCharacter =
    document.querySelector('#modalCharacter');

  const modalName =
    document.querySelector('#modalName');

  const modalClose =
    document.querySelector('#modalClose');

  const modalCancel =
    document.querySelector('#modalCancel');

  const modalConfirm =
    document.querySelector('#modalConfirm');


  const voteComplete =
    document.querySelector('#voteComplete');


  let selectedCharacter = null;



  /* =====================================
     RENDER
  ====================================== */

  const renderCharacters = () => {

    characterGrid.innerHTML =
      characters
        .map((character, index) => {

          const number =
            String(index + 1)
              .padStart(2, '0');

          return `
            <button
              type="button"
              class="vote-character"
              data-character-id="${character.id}"
              style="--card-color:${character.color}"
            >

              <span class="vote-character__number">
                ${number}
              </span>

              <span class="vote-character__check">
                ✓
              </span>


              <div class="vote-character__image">

                <img
                  src="${character.image}"
                  alt="${character.name}"
                >

              </div>


              <div class="vote-character__info">

                <span>
                  ${character.englishName}
                </span>

                <strong>
                  ${character.name}
                </strong>

                <em class="vote-character__pick">
                  MY PICK ♥
                </em>

              </div>

            </button>
          `;

        })
        .join('');

  };


  renderCharacters();



  /* =====================================
     CHARACTER SELECT
  ====================================== */

  characterGrid.addEventListener(
    'click',
    event => {

      const card =
        event.target.closest(
          '.vote-character'
        );


      if (!card) return;


      const characterId =
        card.dataset.characterId;


      const character =
        characters.find(
          item =>
            item.id === characterId
        );


      if (!character) return;



      /*
        같은 캐릭터 다시 누르면 선택 해제
      */

      if (
        selectedCharacter?.id ===
        character.id
      ) {

        selectedCharacter = null;

        clearSelection();

        return;

      }


      selectedCharacter =
        character;


      document
        .querySelectorAll(
          '.vote-character'
        )
        .forEach(item => {

          item.classList.remove(
            'is-selected'
          );

        });


      card.classList.add(
        'is-selected'
      );


      updateFloating();

    }
  );



  /* =====================================
     FLOATING CTA UPDATE
  ====================================== */

  const updateFloating = () => {

    if (!selectedCharacter) {
      clearSelection();

      return;
    }


    selectedName.textContent =
      `${selectedCharacter.name}을(를) 선택했어요!`;


    selectedThumb.innerHTML = `
      <img
        src="${selectedCharacter.image}"
        alt="${selectedCharacter.name}"
      >
    `;


    selectedThumb.style.background =
      selectedCharacter.color;


    voteSubmit.disabled =
      false;


    voteFloating.classList.add(
      'is-visible'
    );

  };



  /* =====================================
     CLEAR
  ====================================== */

  const clearSelection = () => {

    document
      .querySelectorAll(
        '.vote-character'
      )
      .forEach(item => {

        item.classList.remove(
          'is-selected'
        );

      });


    voteSubmit.disabled =
      true;


    voteFloating.classList.remove(
      'is-visible'
    );


    selectedThumb.innerHTML =
      '';


    selectedName.textContent =
      '캐릭터를 선택해주세요';

  };



  /* =====================================
     OPEN CONFIRM MODAL
  ====================================== */

  voteSubmit.addEventListener(
    'click',
    () => {

      if (!selectedCharacter) return;


      modalName.textContent =
        selectedCharacter.name;


      modalCharacter.style.background =
        selectedCharacter.color;


      modalCharacter.innerHTML = `
        <img
          src="${selectedCharacter.image}"
          alt="${selectedCharacter.name}"
        >
      `;


      voteModal.classList.add(
        'is-open'
      );


      voteModal.setAttribute(
        'aria-hidden',
        'false'
      );


      document.body.style.overflow =
        'hidden';

    }
  );



  /* =====================================
     CLOSE MODAL
  ====================================== */

  const closeModal = () => {

    voteModal.classList.remove(
      'is-open'
    );


    voteModal.setAttribute(
      'aria-hidden',
      'true'
    );


    document.body.style.overflow =
      '';

  };


  modalClose.addEventListener(
    'click',
    closeModal
  );


  modalCancel.addEventListener(
    'click',
    closeModal
  );


  voteModal
    .querySelector(
      '.vote-modal__dim'
    )
    .addEventListener(
      'click',
      closeModal
    );



  /* =====================================
   COMPLETE VOTE
====================================== */

modalConfirm.addEventListener(
  'click',
  () => {

    if (!selectedCharacter) return;

    /*
      실제 서버가 없는 프로토타입이므로
      localStorage에 투표 정보 저장
    */

    const voteData = {
      characterId:
        selectedCharacter.id,

      characterName:
        selectedCharacter.name,

      votedAt:
        new Date().toISOString(),
    };


    localStorage.setItem(
      'chamverseVote',
      JSON.stringify(voteData)
    );


    closeModal();


    voteFloating.classList.remove(
      'is-visible'
    );


    showVoteComplete();


    /*
      1.6초 후 랭킹 페이지 이동
    */

    setTimeout(() => {

      window.location.href =
        'ranking.html';

    }, 1600);

  }
);


  /* =====================================
     COMPLETE TOAST
  ====================================== */

  const showVoteComplete = () => {

    voteComplete.classList.add(
      'is-visible'
    );


    setTimeout(() => {

      voteComplete.classList.remove(
        'is-visible'
      );

    }, 1500);

  };



  /* =====================================
     ESC CLOSE
  ====================================== */

  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Escape'
      ) {

        closeModal();

      }

    }
  );

});

/* =========================================
   MOBILE CHARACTER SWIPE
========================================= */

const characterSlider =
  document.querySelector('.character-grid');

const characterCards =
  document.querySelectorAll('.character-card');


const setInitialCharacterSlide = () => {

  if (
    window.innerWidth <= 430 &&
    characterSlider &&
    characterCards.length > 1
  ) {

    const mainCard =
      characterCards[1];

    const targetPosition =
      mainCard.offsetLeft -
      (
        characterSlider.clientWidth -
        mainCard.offsetWidth
      ) / 2;


    characterSlider.scrollTo({
      left: targetPosition,
      behavior: 'instant'
    });

  }

};


window.addEventListener(
  'load',
  setInitialCharacterSlide
);
