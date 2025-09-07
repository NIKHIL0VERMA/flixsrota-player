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
      var player, gate, gateMsg, gateSpinner;
      var ready=false, loaded=false, errored=false;
      function sendMessageToRN(e) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(e));
      }
      function hideGate(){ gate && gate.classList.add('hidden'); }
      function onGateClick(){ if(ready&&loaded&&!errored){ hideGate(); try{ player.playVideo(); }catch(_){} } }
      document.addEventListener('DOMContentLoaded', function(){ gate=document.getElementById('gate'); gateMsg=document.getElementById('gate-msg'); gateSpinner=document.getElementById('gate-spinner'); if(gate) gate.addEventListener('click',onGateClick); });
      var tag=document.createElement('script'); tag.src="https://www.youtube.com/iframe_api"; document.body.appendChild(tag);
      function onYouTubeIframeAPIReady(){
        player=new YT.Player('flixsrota-player',{events:{onReady:onReady,onError:onError,onStateChange:onStateChange}});
      }
      function onError(e){ errored=true; sendMessageToRN({eventType:'playerError',data:e.data}); }
      function onReady(){ ready=true; sendMessageToRN({eventType:'playerReady'}); setInterval(()=>{ if(player&&player.getCurrentTime){ sendMessageToRN({eventType:'timeUpdate',currentTime:player.getCurrentTime(),duration:player.getDuration()}); }},1000); }
      function onStateChange(e){ sendMessageToRN({eventType:'playerStateChange',data:e.data}); }
      document.addEventListener('message',function(ev){ try{ var msg=JSON.parse(ev.data); switch(msg.command){ case 'playVideo':player.playVideo();break; case 'pauseVideo':player.pauseVideo();break; case 'muteVideo':player.mute();sendMessageToRN({eventType:'muteChange',data:true});break; case 'unMuteVideo':player.unMute();sendMessageToRN({eventType:'muteChange',data:false});break; case 'seekTo': if(typeof msg.seconds==='number'){player.seekTo(msg.seconds,true);} break; case 'toggleFullScreen':sendMessageToRN({eventType:'fullScreenChange'});break; case 'dismissGate':hideGate();break; }}catch(e){} });
    </script>
  </body>
</html>
`;
