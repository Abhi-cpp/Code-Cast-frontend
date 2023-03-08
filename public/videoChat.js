const APP_ID = "71fb4b634c9449348d44807b4b140848";
const TOKEN = "007eJxTYDBwPvxppuwJX61LN7w1tr9J+2Bz9PNHvvu5Pg32XcdfTZiswGBumJZkkmRmbJJsaWJiaWxikWJiYmFgDhQzNDGwMLHYpMeW0hDIyPA59QArIwMEgvgsDLmJmXkMDADNciCv";
const CHANNEL = "main";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)

    client.on('user-left', handleUserLeft)

    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`


    document.getElementById("video-streams").insertAdjacentHTML("beforeend", player);

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);

}


let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`);
        if (player != null) {
            player.remove();
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                            <div class="video-player" id="user-${user.uid}"></div>
                        </div>`


        document.getElementById("video-streams").insertAdjacentHTML("beforeend", player);
        user.videoTrack.play(`user-${user.uid}`);

    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}


let joinStream = async () => {
    document.querySelector("#join").classList.add("joined");
    await joinAndDisplayLocalStream();
}

let handleUserLeft = (user) => {
    document.getElementById(`user-container-${user.uid}`).remove();
    delete remoteUsers[user.uid];
}

let leaveAndRemoveLocalStream = async () => {
    for (let trackName in localTracks) {
        let track = localTracks[trackName];
        track.stop();
        track.close();
    }

    localTracks = [];

    await client.leave();
    window.location.reload();
    document.getElementById("video-streams").innerHTML = "";
}

let toggleCamera = () => {
    console.log("toggle camera")
    localTracks[1].muted ? localTracks[1].setMuted(false) : localTracks[1].setMuted(true);
    document.getElementById("camera").classList.toggle("camera");
}

let toggleMicrophone = () => {
    console.log("toggle mic")
    localTracks[0].muted ? localTracks[0].setMuted(false) : localTracks[0].setMuted(true);
    document.getElementById("microphone").classList.toggle("microphone");
}



document.getElementById("join").addEventListener("click", () => {
    if (join.classList.contains("joined")) {
        leaveAndRemoveLocalStream();
    }
    else {
        joinStream();
    }
});

document.getElementById("camera").addEventListener("click", toggleCamera);
document.getElementById("microphone").addEventListener("click", toggleMicrophone);



