document.addEventListener('DOMContentLoaded', () => {

  /* ========================================
     RANKING DATA
  ======================================== */

  const rankingData = [
    {
      id: 'patrick',
      name: '뚱이',
      englishName: 'patrick',
      image: '/images/vote/patrick Star-11.png',
      color: '#f7c4dc',
      votes: 8363,
    },

    {
      id: 'Shin_Chan',
      name: '짱구',
      englishName: 'Shin_Chan',
      image: '/images/vote/Shin_Chan-10.png',
      color: '#a9dcda',
      votes: 8235,
    },

    {
      id: 'Dooly',
      name: '둘리',
      englishName: 'Dooly',
      image: '/images/vote/Dooly-02.png',
      color: '#b9dfb2',
      votes: 7910,
    },

    {
      id: 'Keroro',
      name: '케로로',
      englishName: 'Keroro',
      image: '/images/vote/Keroro-07.png',
      color: '#f49a8f',
      votes: 6542,
    },

    {
      id: 'loopy',
      name: '루피',
      englishName: 'loopy',
      image: '/images/vote/loopy-08.png',
      color: '#cab1ea',
      votes: 4612,
    },

    {
      id: 'Doraemon',
      name: '도라에몽',
      englishName: 'Doraemon',
      image: '/images/vote/Doraemon-03.png',
      color: '#9ed9ef',
      votes: 2861,
    },

    {
      id: 'ATAMAmMA',
      name: '아따맘마',
      englishName: 'ATAMAmMA',
      image: '/images/vote/ATAMAmMA-05.png',
      color: '#ffd86f',
      votes: 1733,
    },

    {
      id: 'jadoo',
      name: '자두',
      englishName: 'jadoo',
      image: '/images/vote/jadoo-06.png',
      color: '#f8b6c4',
      votes: 1012,
    },
  ];



  /* ========================================
     ELEMENTS
  ======================================== */

  const podium =
    document.querySelector('#podium');

  const rankingList =
    document.querySelector('#rankingList');



  /* ========================================
     MY VOTE
  ======================================== */

  let myVote = null;


  try {

    const savedVote =
      localStorage.getItem(
        'chamverseVote'
      );


    if (savedVote) {

      myVote =
        JSON.parse(savedVote);

    }

  } catch (error) {

    console.error(
      '투표 데이터를 불러오지 못했습니다.',
      error
    );

  }



  /* ========================================
     SORT
  ======================================== */

  const sortedRanking = [
    ...rankingData
  ].sort(
    (a, b) =>
      b.votes - a.votes
  );



  /* ========================================
     FORMAT
  ======================================== */

  const formatVotes = value => {

    return value.toLocaleString('ko-KR');

  };



  /* ========================================
     PODIUM
  ======================================== */

  const renderPodium = () => {

    if (!podium) return;

    const topThree =
      sortedRanking.slice(0, 3);


    /*
      실제 화면 배치 순서는

      2위 / 1위 / 3위
    */

    const displayOrder = [
      topThree[1],
      topThree[0],
      topThree[2],
    ];


    podium.innerHTML =
      displayOrder
        .map(character => {

          const realRank =
            sortedRanking.findIndex(
              item =>
                item.id ===
                character.id
            ) + 1;


          const isMyPick =
            myVote?.characterId ===
            character.id;


          return `
            <article
              class="
                podium-card
                podium-card--${realRank}
              "
            >

              ${
                realRank === 1
                  ? `
                    <span
                      class="podium-card__crown"
                    >
                      ♛
                    </span>
                  `
                  : ''
              }


              <div
                class="podium-card__character"
              >

                <img
                  src="${character.image}"
                  alt="${character.name}"
                >

              </div>


              <div
                class="podium-card__info"
              >

                <span>
                  ${character.englishName}
                </span>

                <strong>
                  ${character.name}
                </strong>

                <div
                  class="podium-card__votes"
                >
                  ${formatVotes(character.votes)}
                  <span>VOTES</span>
                </div>


                ${
                  isMyPick
                    ? `
                      <div
                        class="podium-card__mypick"
                      >
                        MY PICK ♥
                      </div>
                    `
                    : ''
                }

              </div>


              <div
                class="podium-card__block"
              >
                <span>
                  ${realRank}
                </span>
              </div>

            </article>
          `;

        })
        .join('');

  };



  /* ========================================
     FULL RANK LIST
  ======================================== */

  const renderRankingList = () => {

    /*
      TOP3는 위에서 보여주니까
      리스트에서는 4위부터 보여줌
    */

    const remaining =
      sortedRanking.slice(3);


    const firstVotes =
      sortedRanking[0].votes;


    rankingList.innerHTML =
      remaining
        .map((character, index) => {

          const rank =
            index + 4;


          const percentage =
            (
              character.votes /
              firstVotes
            ) * 100;


          const isMyPick =
            myVote?.characterId ===
            character.id;


          return `
            <article
              class="
                rank-row
                ${isMyPick
                  ? 'is-my-pick'
                  : ''}
              "
            >

              <div
                class="rank-row__number"
              >
                ${rank}
              </div>


              <div
                class="rank-row__thumb"
                style="
                  --character-color:
                  ${character.color}
                "
              >

                <img
                  src="${character.image}"
                  alt="${character.name}"
                >

              </div>


              <div
                class="rank-row__info"
              >

                <span>
                  ${character.englishName}
                </span>

                <strong>
                  ${character.name}
                </strong>

              </div>


              <div
                class="rank-row__progress"
              >

                <i
                  style="
                    --progress:
                    ${percentage}%
                  "
                ></i>

              </div>


              <div
                class="rank-row__votes"
              >

                <strong>
                  ${formatVotes(
                    character.votes
                  )}
                </strong>

                <span>
                  VOTES
                </span>

              </div>


              ${
                isMyPick
                  ? `
                    <span
                      class="rank-row__mypick"
                    >
                      MY PICK ♥
                    </span>
                  `
                  : ''
              }

            </article>
          `;

        })
        .join('');

  };



  /* ========================================
     RUN
  ======================================== */

  renderPodium();

  if (rankingList) renderRankingList();

});
