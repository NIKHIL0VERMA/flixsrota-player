/**
 * Generates the YouTube iframe HTML.
 * In future, we can swap this with other providers (Vimeo, HLS, DASH, etc.)
 */
export const youtubeHTML = (videoId: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
    <style>
      html, body { margin:0; padding:0; height:100%; background:#000; overflow:hidden; }
      .provider { position:relative; width:100%; height:100%; background:black; }
      .provider iframe { position:absolute; top:50%; left:50%; width:100%; height:1000%; border:0; transform:translate(-50%,-50%); }
      .overlay { position:absolute; inset:0; background:transparent; z-index:2; }
      .gate { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:3; cursor:pointer; }
      .gate.hidden { display:none; }
      .gate-box { display:flex; flex-direction:column; align-items:center; gap:8px; }
      .gate-msg { color:#fff; font:14px system-ui; text-align:center; }
      .spinner { width:22px; height:22px; border-radius:50%; border:2px solid #fff; border-top-color:transparent; animation:spin 1s linear infinite; }
      @keyframes spin { to { transform:rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="provider">
      <iframe
        id="flixsrota-player"
        frameborder="0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
        src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=0&controls=0&disablekb=1&enablejsapi=1"
        allowfullscreen
      ></iframe>
      <div class="overlay"></div>
      <div class="gate" id="gate">
        <div class="gate-box">
          <div class="spinner" id="gate-spinner"></div>
          <div class="gate-msg" id="gate-msg">Loading video…</div>
        </div>
      </div>
    </div>
    <script>
      var tag = document.createElement("script");
      tag.id = "iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player;
      var gate, gateMsg, gateSpinner;
      var ready = false,
        loaded = false,
        errored = false;
      var loadCheckInterval = null,
        loadTimeout = null;

      function sendMessageToRN(e) {
        window.ReactNativeWebView &&
          window.ReactNativeWebView.postMessage(JSON.stringify(e));
      }

      function setGateMessage(text, showSpinner) {
        if (gateMsg) gateMsg.textContent = text;
        if (gateSpinner) gateSpinner.style.display = showSpinner ? "block" : "none";
      }

      function hideGate() {
        if (gate) gate.classList.add("hidden");
      }

      function onGateClick() {
        if (ready && loaded && !errored) {
          hideGate();
          try {
            player && player.playVideo && player.playVideo();
          } catch (_) {}
        } else {
          setGateMessage("Something went wrong. Try again later.", false);
        }
      }

      document.addEventListener("DOMContentLoaded", function () {
        gate = document.getElementById("gate");
        gateMsg = document.getElementById("gate-msg");
        gateSpinner = document.getElementById("gate-spinner");
        if (gate) gate.addEventListener("click", onGateClick);
      });

      function onYouTubeIframeAPIReady() {
        player = new YT.Player("flixsrota-player", {
          events: {
            onReady: onPlayerReady,
            onError: onPlayerError,
            onStateChange: onPlayerStateChange,
            onPlaybackRateChange: onPlaybackRateChange,
            onPlaybackQualityChange: onPlaybackQualityChange,
          },
        });
      }

      function onPlayerError(e) {
        errored = true;
        setGateMessage("Something went wrong. Try again later.", false);
        sendMessageToRN({ eventType: "playerError", data: e.data });
      }

      function onPlaybackRateChange(e) {
        sendMessageToRN({
          eventType: "playbackRateChange",
          data: e.data,
        });
      }
      function onPlaybackQualityChange(e) {
        sendMessageToRN({
          eventType: "playerQualityChange",
          data: e.data,
        });
      }
      function onPlayerReady(e) {
        ready = true;
        sendMessageToRN({
          eventType: "playerReady",
        });
        loadCheckInterval = setInterval(function () {
          try {
            var d = player && player.getDuration ? player.getDuration() : 0;
            if (d && isFinite(d) && d > 0) {
              loaded = true;
              clearInterval(loadCheckInterval);
              loadCheckInterval = null;
              setGateMessage("", false);
            }
          } catch (_) {}
        }, 200);
        setInterval(function () {
          if (player && player.getCurrentTime && player.getDuration) {
            var current = player.getCurrentTime();
            var duration = player.getDuration();
            sendMessageToRN({
              eventType: "timeUpdate",
              currentTime: current,
              duration: duration,
            });
          }
        }, 1000); // every 1s
        loadTimeout = setTimeout(function () {
          if (!loaded) {
            errored = true;
            setGateMessage("Something went wrong. Try again later.", false);
          }
        }, 8000);
      }
      function onPlayerStateChange(e) {
        if (
          e.data === YT.PlayerState.CUED ||
          e.data === YT.PlayerState.BUFFERING ||
          e.data === YT.PlayerState.PLAYING ||
          e.data === YT.PlayerState.PAUSED
        ) {
          if (!loaded) {
            loaded = true;
            if (loadCheckInterval) {
              clearInterval(loadCheckInterval);
              loadCheckInterval = null;
            }
            if (loadTimeout) {
              clearTimeout(loadTimeout);
              loadTimeout = null;
            }
            setGateMessage("", false);
          }
        }
        sendMessageToRN({
          eventType: "playerStateChange",
          data: e.data,
        });
      }
      document.addEventListener("message", function (ev) {
        var msg;
        try {
          msg = JSON.parse(ev.data); // always JSON now
        } catch (e) {
          return;
        }
        if (msg && typeof msg === "object") {
          switch (msg.command) {
            case "playVideo":
              player.playVideo();
              break;
            case "pauseVideo":
              player.pauseVideo();
              break;
            case "muteVideo":
              player.mute();
              sendMessageToRN({ eventType: "muteChange", data: true });
              break;
            case "unMuteVideo":
              player.unMute();
              sendMessageToRN({ eventType: "muteChange", data: false });
              break;
            case "dismissGate":
              hideGate();
              break;
            case "toggleFullScreen":
              sendMessageToRN({ eventType: "fullScreenChange" });
              break;
            case "seekTo":
              if (typeof msg.seconds === "number") {
                player.seekTo(msg.seconds, true);
              }
              break;
          }
        }
      });
    </script>
  </body>
</html>
`;
