document.addEventListener('DOMContentLoaded', () => {

  const floatingVote =
    document.querySelector('#floatingVote');

  if (!floatingVote) return;


  const handleFloatingVote = () => {

    const scrollTop =
      window.scrollY;

    const scrollHeight =
      document.documentElement.scrollHeight;

    const viewportHeight =
      window.innerHeight;

    const maxScroll =
      scrollHeight - viewportHeight;


    if (maxScroll <= 0) return;


    const scrollProgress =
      scrollTop / maxScroll;


    /*
      페이지 약 65%를 본 시점부터 등장
    */

    if (scrollProgress >= 0.65) {

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
    handleFloatingVote,
    { passive: true }
  );


  handleFloatingVote();

});