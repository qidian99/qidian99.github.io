/* eslint-disable require-jsdoc */

const fetchLesson = async () => {
  await setTimeout(() => {}, 1000);
  return {
    name: 'Module 1',
    lessons: [
      {
        time: 0,
        description: 'Lesson 1: Introduction',
      },
      {
        time: 10,
        description: 'Lesson 2: Conclusion',
      },
    ],
  };
};

function setCookie(key, value, expiry) {
  const expires = new Date();
  expires.setTime(expires.getTime() + expiry * 24 * 60 * 60 * 1000);
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
  const keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

function eraseCookie(key) {
  const keyValue = getCookie(key);
  setCookie(key, keyValue, '-1');
}

let triggered = false;
let duration;
let latestTime = 0.0;
let myPlayer;
let isMouseDown = false;
let restorePlay = false;
let timeupdate;
const ivideoAbsolute = $('.ivideo-absolute');
const MY_VIDEO = 'my-video';

$(document).ready(function() {
  const progressBarWidth = $('.progressBarContainer').width();
  const lastInCookie = getCookie('latestTime');

  myPlayer = videojs(MY_VIDEO);
  myPlayer.ready(function() {
    this.one('loadedmetadata', function() {
      duration = myPlayer.duration();
      $('.progressBar').append(
          `<div id=\"${MY_VIDEO}-lesson1\" class=\"courseBallContainer\"><div class=\"courseBall\"><div class=\"courseBallOverlay\"></div></div></div>`,
      );
      $(`#${MY_VIDEO}-lesson1`).css('left', 0);
      $('.progressBar').append(
          `<div id=\"${MY_VIDEO}-lesson2\" class=\"courseBallContainer\"><div class=\"courseBall\"><div class=\"courseBallOverlay\"></div></div></div>`,
      );
      $(`#${MY_VIDEO}-lesson2`).css('left', (10 / duration) * progressBarWidth);

      $('.courseContainer1').css('cursor', 'pointer');
      if (lastInCookie) {
        latestTime = lastInCookie;
        $('.progress').css('width', (latestTime / duration) * progressBarWidth);
      }
    });

    myPlayer.on('play', function() {
      if (timeupdate) clearInterval(timeupdate);
      resetTimeUpdate();
    });

    myPlayer.on('pause', function() {
      if (timeupdate) clearInterval(timeupdate);
      const offsetLeft = (myPlayer.currentTime() / duration) * progressBarWidth;
      $('.trackLine')
          .stop()
          .css('left', offsetLeft);
      if (latestTime < myPlayer.currentTime()) {
        $('.progress')
            .stop()
            .css('width', offsetLeft);
        latestTime = myPlayer.currentTime();
        setCookie('latestTime', latestTime, '365');
      }
    });
  });

  myPlayer.on('ended', function() {
    $('#playIcon').html('replay');
    clearTimeout(interval);
    showPlaybar();
    interval = getInterval();
  });

  let lastButton;
  let showCourseInfo = false;

  $(document).mousemove(function(e) {
    const button = checkButton(e.target);
    if (lastButton && button !== lastButton) {
      $('.' + lastButton).css({
        backgroundColor: 'rgba(53, 53, 53, 0.7)',
      });
      lastButton = false;
    }

    if (button) {
      $('.' + button).css({
        backgroundColor: 'rgba(53, 53, 53, 1.0)',
      });
      lastButton = button;
    }

    if (checkSelfAndParentClass(e.target, 'courseBallContainer')) {
      if (e.target.offsetParent.id === `${MY_VIDEO}-lesson1`) {
        $('.courseInfoText').html('Lesson 1: Introduction');
      } else if (e.target.offsetParent.id === `${MY_VIDEO}-lesson2`) {
        $('.courseInfoText').html('Lesson 2: Conclusion');
      }
      if (!showCourseInfo) {
        $('.courseInfo').animate(
            {
              top: 534,
            },
            100,
        );
        showCourseInfo = true;
      }
    } else {
      if (checkSelfAndParentClass(e.target, 'trackLine')) {
        const offsetLeft = parseInt(
            $('.trackLine')
                .css('left')
                .slice(0, -2),
        );
        const lesson2Offset = parseInt(
            $(`#${MY_VIDEO}-lesson2`)
                .css('left')
                .slice(0, -2),
        );
        let inRange = false;
        if (offsetLeft <= 32 && !showCourseInfo) {
          $('.courseInfoText').html('Lesson 1: Introduction');
          inRange = true;
          // } else if (offsetLeft >= lesson2Offset && offset <= lesson2Offset +
          // 32 && !showCourseInfo) {
        } else if (offsetLeft >= lesson2Offset && !showCourseInfo) {
          $('.courseInfoText').html('Lesson 2: Conclusion');
          inRange = true;
        }
        if (inRange && !showCourseInfo) {
          $('.courseInfo').animate(
              {
                top: 534,
              },
              100,
          );
          showCourseInfo = true;
        }
      } else if (showCourseInfo) {
        $('.courseInfo').animate(
            {
              top: 502,
            },
            100,
        );
        showCourseInfo = false;
      }
    }
  });

  $(document).mousedown(function(e) {
    if (
      checkSelfAndParentClass(e.target, 'progressBar') ||
      checkSelfAndParentClass(e.target, 'courseBallContainer')
    ) {
      isMouseDown = true;
      if (!myPlayer.paused()) {
        restorePlay = true;
        myPlayer.pause();
      }
    }
  });

  $(document).mouseup(function() {
    isMouseDown = false;
    if (restorePlay) {
      restorePlay = false;
      myPlayer.play();
    }
  });

  function updateTimeText(player) {
    const currentTime = moment(Math.floor(player.currentTime()), 'ss');
    if (currentTime.minute() < 10) {
      $('.timeText').html(currentTime.format('m:ss'));
    } else {
      $('.timeText').html(currentTime.format('mm:ss'));
    }
  }

  function changeCourse(player, time) {
    player.currentTime(time);
    const offset = (time / duration) * progressBarWidth;
    if (player.paused()) {
      $('.trackLine')
          .stop()
          .css('left', offset);
      updateTimeText(player);
    } else {
      if (timeupdate) clearInterval(timeupdate);
      $('.trackLine')
          .stop()
          .css('left', offset);
      timeupdate = setTimeUpdate();
    }
  }

  $(document).click(function(e) {
    if (checkSelfAndParentClass(e.target, 'playButton')) {
      togglePlayAndPause();
    } else if (checkSelfAndParentClass(e.target, 'courseContainer1')) {
      changeCourse(myPlayer, 0);
    } else if (checkSelfAndParentClass(e.target, 'courseContainer2')) {
      if (latestTime >= 10) {
        changeCourse(myPlayer, 10);
      }
    } else if (checkSelfAndParentClass(e.target, 'courseListButton')) {
      if (triggered) {
        $('.catalog').animate(
            {
              'margin-left': 770,
            },
            'fast',
        );
      } else {
        $('.catalog').animate(
            {
              'margin-left': 585,
            },
            'fast',
        );
      }
      triggered = !triggered;
    } else if (checkSelfAndParentClass(e.target, 'fullScreenButton')) {
      /** TODO - Make page fullscreen, not videojs full screen **/
      e.preventDefault();
      $('.vjs-fullscreen-control').click();
    } else if (checkSelfAndParentClass(e.target, 'courseBallContainer')) {
      if (
        $(e.target.offsetParent).attr('class') === 'lesson1' &&
        e.offsetX < $('.progress').width()
      ) {
        // const currTime = e.offsetX / progressBarWidth * duration
        const offset = e.pageX - $('.progressBar').offset().left;
        const currTime = (offset / progressBarWidth) * duration;
        myPlayer.currentTime(currTime);
        $('.trackLine')
            .stop()
            .css('left', offset);
      } else if ($(e.target.offsetParent).attr('class') == 'lesson2') {
        const offset = e.pageX - $('.progressBar').offset().left;
        const realOffset =
          offset +
          parseInt(
              $(`#${MY_VIDEO}-lesson2`)
                  .css('left')
                  .slice(0, -2),
          );
        const currTime = (realOffset / progressBarWidth) * duration;
        if (realOffset < $('.progress').width()) {
          myPlayer.currentTime(currTime);
          $('.trackLine')
              .stop()
              .css('left', realOffset);
        }
      }
    } else if (checkSelfAndParentClass(e.target, 'progressBar')) {
      if (e.offsetX < $('.progress').width()) {
        const offset = e.pageX - $('.progressBar').offset().left;
        const currTime = (offset / progressBarWidth) * duration;
        myPlayer.currentTime(currTime);
        updateTimeText(myPlayer);
        $('.trackLine')
            .stop()
            .css('left', offset);
        if ($('#playIcon').html() === 'replay') {
          if (myPlayer.paused()) {
            $('#playIcon').html('play_arrow');
          } else {
            $('#playIcon').html('pause');
          }
        }
      }
    } else if ($(e.target).hasClass('ivideo-absolute')) {
      togglePlayAndPause();
    }
  });

  let interval;
  let showing;

  function showPlaybar() {
    if (!showing) {
      showing = true;
      ivideoAbsolute.stop().animate(
          {
            opacity: '1.0',
          },
          'fast',
      );
    }
  }

  function checkSelfAndParentClass(target, className) {
    if (
      $(target).attr('class') === className ||
      (target.parentNode &&
        $(target.parentNode).attr('class') &&
        checkSelfAndParentClass(target.parentNode, className))
    ) {
      return true;
    }
    return false;
  }

  function checkSelfAndParent(target, id) {
    if (
      target.id === id ||
      (target.parentNode &&
        target.parentNode.id &&
        checkSelfAndParent(target.parentNode, id))
    ) {
      return true;
    }
    return false;
  }

  function checkButton(target) {
    if (target && $(target).attr('class')) {
      return $(target)
          .attr('class')
          .includes('Button') ?
        $(target).attr('class') :
        target.parentNode &&
            $(target.parentNode).attr('class') &&
            checkButton(target.parentNode);
    } else {
      return false;
    }
  }

  function togglePlayAndPause() {
    switch ($('#playIcon').html()) {
      case 'play_arrow':
        myPlayer.play();
        $('#playIcon').html('pause');
        break;
      case 'pause':
        myPlayer.pause();
        $('#playIcon').html('play_arrow');
        break;
      case 'replay':
        myPlayer.play();
        $('#playIcon').html('pause');
        break;
      default:
        break;
    }
  }

  function setTimeUpdate() {
    return setInterval(() => {
      updateTimeText(myPlayer);

      const offsetLeft =
        ((myPlayer.currentTime() + 0.1) / duration) * progressBarWidth;

      $('.trackLine')
          .stop()
          .css('left', (myPlayer.currentTime() / duration) * progressBarWidth)
          .animate(
              {
                left: offsetLeft,
              },
              100,
              'linear',
          );
      if (latestTime < myPlayer.currentTime()) {
        $('.progress')
            .stop()
            .css('width', (myPlayer.currentTime() / duration) * progressBarWidth)
            .animate(
                {
                  width: offsetLeft,
                },
                100,
                'linear',
            );
        latestTime = myPlayer.currentTime();
        setCookie('latestTime', latestTime, '365');
      }

      // Set remaining lesson cursor
      if (latestTime >= 3) {
        $('.courseContainer2').css('cursor', 'pointer');
      }
    }, 100);
  }

  function hidePlaybar() {
    showing = false;
    ivideoAbsolute.stop().animate(
        {
          opacity: '0',
        },
        'fast',
    );
  }

  function getInterval() {
    return setTimeout(function() {
      hidePlaybar();
    }, 1000);
  }

  function resetTimeUpdate() {
    if (timeupdate) clearInterval(timeupdate);
    timeupdate = setTimeUpdate();
  }

  $(document).mousemove(function(e) {
    if (isMouseDown) {
      if (
        checkSelfAndParentClass(e.target, 'progressBar') ||
        checkSelfAndParentClass(e.target, 'courseBallContainer')
      ) {
        const offset = e.pageX - $('.progressBar').offset().left;
        if (offset < $('.progress').width()) {
          const currTime = (offset / progressBarWidth) * duration;
          myPlayer.currentTime(currTime);
          $('.trackLine').css('left', offset);
        }
      }
    }

    if (
      checkSelfAndParentClass(e.target, 'playbar') ||
      checkSelfAndParentClass(e.target, 'catalog')
    ) {
      clearTimeout(interval);
      showPlaybar();
    } else if ($(e.target).hasClass('ivideo-absolute')) {
      clearTimeout(interval);
      showPlaybar();
      interval = getInterval();
    } else {
      hidePlaybar();
    }
  });

  Mousetrap.bind('space', function(e) {
    if (myPlayer.paused()) {
      myPlayer.play();
      togglePlayAndPause();
    } else {
      myPlayer.pause();
      togglePlayAndPause();
    }
  });
});
