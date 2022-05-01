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

    const testToken = new SkyWayAuthToken({
      jti: uuidV4(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 600,
      scope: {
        app: {
          id: "ここにアプリケーションIDをペーストしてください",
          turn: true,
          actions: ["read"],
          channels: [
            {
              id: "*",
              name: "*",
              actions: ["write"],
              members: [
                {
                  id: "*",
                  name: "*",
                  actions: ["write"],
                  publication: {
                    actions: ["write"],
                  },
                  subscription: {
                    actions: ["write"],
                  },
                },
              ],
              sfuBots: [
                {
                  actions: ["write"],
                  forwardings: [
                    {
                      actions: ["write"]
                    }
                  ]
                }
              ]
            },
          ],
        },
      },
    });
    const tokenString = testToken.encode(
      "ここにシークレットキーをペーストしてください"
    );

    const buttonArea = document.getElementById("button-area");
    const theirMediaArea = document.getElementById("their-media-area");
    const roomNameInput = document.getElementById("room-name");
    const myId = document.getElementById("my-id");

    document.getElementById("join").onclick = async () => {
      if (roomNameInput.value === "") return;

      const context = await SkyWayContext.Create(tokenString);

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
    };
  })();
</script>