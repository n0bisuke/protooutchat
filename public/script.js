const {
    SkyWayAuthToken,
    SkyWayContext,
    SkyWayMediaDevices,
    SkyWayRoom,
    uuidV4,
} = skyway_room;

  (async () => {
    const myVideo = document.getElementById("my-video");

    const {
      audio,
      video,
    } = await SkyWayMediaDevices.createMicrophoneAudioAndCameraStream();

    video.attach(myVideo);
    await myVideo.play();

    const buttonArea = document.getElementById("button-area");
    const theirMediaArea = document.getElementById("their-media-area");
    const roomNameInput = document.getElementById("room-name");
    const myId = document.getElementById("my-id");

    const join = async() => {
        if(location.hash) roomNameInput.value = location.hash.split('#')[1];
        if (roomNameInput.value === "") return;

        console.log(roomNameInput.value);
        //トークン
        const res = await fetch(`/token`);
        const data = await res.json();
        const context = await SkyWayContext.Create(data.tokenString);
  
        const room = await SkyWayRoom.FindOrCreate(context, {
          type: "p2p",
          name: roomNameInput.value,
        });
  
        const me = await room.join();
  
        myId.textContent = me.id;
  
        await me.publish(audio);
        await me.publish(video);
  
        function subscribeAndAttach(publication) {
          if (publication.publisher.id === me.id) return;
  
          const subscribeButton = document.createElement("button");
          subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
  
          buttonArea.appendChild(subscribeButton);
  
          subscribeButton.onclick = async () => {
            const { stream } = await me.subscribe(publication.id);
  
            let newMedia;
            switch (stream.track.kind) {
              case "video":
                newMedia = document.createElement("video");
                newMedia.playsInline = true;
                newMedia.autoplay = true;
                break;
              case "audio":
                newMedia = document.createElement("audio");
                newMedia.controls = true;
                newMedia.autoplay = true;
                break;
              default:
                return;
            }
  
            stream.attach(newMedia);
  
            theirMediaArea.appendChild(newMedia);
          };
        }
  
        room.publications.forEach(subscribeAndAttach);
  
        room.onStreamPublished.add(async (e) => {
          subscribeAndAttach(e.publication, me);
        });
    }

    document.getElementById("join").onclick = join;

    if(location.hash){
        join();
    }

  })();