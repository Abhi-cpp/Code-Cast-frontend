import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { DataContext } from "../Components/DataContext.tsx";
import Peer from "simple-peer";
import "../Styles/video-chat.css";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { PeerType, VideoChatT } from "../types/videoChat.ts";
import { VideoPropsType } from "../types/videoChat.ts";

export const reArrangeVideos = () => {
  const videoContainer = document.querySelector(
    ".video-chat .video-container",
  ) as HTMLElement;
  let width = videoContainer?.getBoundingClientRect().width;
  let height = videoContainer?.getBoundingClientRect().height;
  if (width && width <= 200) {
    return;
  }
  const padding = parseInt(window.getComputedStyle(videoContainer).padding);
  const gap = parseInt(window.getComputedStyle(videoContainer).gap);
  const totalComponents =
    document.querySelector(".video-chat .video-container")?.childElementCount ||
    0;
  width -= padding * 2;
  height -= padding * 2;
  const video = document.querySelector("video");
  const videoWidth = video?.videoWidth || 640;
  const videoHeight = video?.videoHeight || 480;
  const ratio = videoWidth / videoHeight;
  const minRatio = ratio * 0.6;
  const maxRatio = ratio * 1.5;
  let rowCount = 1;
  const videoCards = document.querySelectorAll(
    ".video-card",
  ) as NodeListOf<HTMLElement>;
  while (rowCount <= totalComponents) {
    const colCount = Math.ceil(totalComponents / rowCount);
    let perRowWidth = (width - (colCount - 1) * gap) / colCount;
    let perRowHeight = (height - (rowCount - 1) * gap) / rowCount;
    let currRatio = perRowWidth / perRowHeight;
    let done = false;

    if (currRatio >= minRatio && currRatio <= maxRatio) {
      done = true;
    }

    if (currRatio > maxRatio) {
      while (currRatio > maxRatio) {
        perRowWidth *= 0.9;
        currRatio = perRowWidth / perRowHeight;
      }
      done = true;
    }

    if (currRatio < minRatio && rowCount == totalComponents) {
      while (currRatio < minRatio) {
        perRowHeight *= 0.9;
        currRatio = perRowWidth / perRowHeight;
      }
      done = true;
    }

    if (done) {
      videoCards.forEach((card) => {
        card.style.width = `${perRowWidth}px`;
        card.style.height = `${perRowHeight}px`;
      });
      break;
    }

    rowCount++;
  }
};

const Video = ({ peer }: VideoPropsType) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, []);

  return <video playsInline autoPlay ref={ref}></video>;
};

const VideoChat = ({ videoCollapsed, currRoom }: VideoChatT) => {
  const { user, socket } = useContext(DataContext);
  const [peers, setPeers] = useState<Array<PeerType>>([]);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const roomId = currRoom?.roomId;

  function muteAudio() {
    const audio = (
      userVideo.current?.srcObject as MediaStream
    )?.getAudioTracks()[0];
    audio.enabled = !audio.enabled;
    document.querySelector(".video-card")?.classList.toggle("audio-active");
    socket.emit("toggle-audio", { roomId, userId: socket.id });
  }

  function muteVideo() {
    const video = (
      userVideo.current?.srcObject as MediaStream
    )?.getVideoTracks()[0];
    video.enabled = !video.enabled;

    socket.emit("toggle-video", { roomId, userId: socket.id });
    document.querySelector(".video-card")?.classList.toggle("video-active");
  }

  useEffect(() => {
    window.addEventListener("resize", reArrangeVideos);
    window.addEventListener("load", reArrangeVideos);
    reArrangeVideos();
    socket.on("toggle-video", (data) => {
      setPeers((users) => {
        return users.map((user) => {
          if (user.userId === data.userId) {
            user.videoIsActive = !user.videoIsActive;
          }
          return user;
        });
      });
    });
    socket.on("toggle-audio", (data) => {
      setPeers((users) => {
        return users.map((user) => {
          if (user.userId === data.userId) {
            user.audioIsActive = !user.audioIsActive;
          }
          return user;
        });
      });
    });

    socket.on("sender receiving final signal", (data) => {
      const item = peers.find((p) => p.userId === data.id);
      item?.peer.signal(data.signal);
    });

    socket.on("user left video call", (data) => {
      setPeers((users) => {
        return users.filter((user) => user.userId !== data.userId);
      });
    });

    return () => {
      window.removeEventListener("resize", reArrangeVideos);
      window.removeEventListener("load", reArrangeVideos);
      socket.off("toggle-video");
      socket.off("toggle-audio");
      socket.off("user left video call");
      socket.off("sender receiving final signal");
    };
  }, [peers]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideo.current) userVideo.current.srcObject = stream;
        socket.emit("start-video", { roomId });
        socket.on("allUsers", (users) => {
          const peers: PeerType[] = [];
          users.forEach((user) => {
            const peer = createPeer(user.id, socket.id, stream);
            peers.push({
              peer,
              userId: user.id,
              name: user.name,
              avatar: user.avatar,
              videoIsActive: true,
              audioIsActive: true,
            });
          });
          setPeers(peers);
        });

        socket.on("new video user joined", (data) => {
          const peer = addPeer(data.signal, data.callerID, stream);
          setPeers((users) => [
            ...users,
            {
              peer,
              userId: data.callerID,
              name: data.userSending.name,
              avatar: data.userSending.avatar,
              videoIsActive: true,
              audioIsActive: true,
            },
          ]);
        });
      });

    const buttons = document.querySelectorAll(".control-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
      });
    });

    return () => {
      (userVideo.current?.srcObject as MediaStream)
        ?.getTracks()
        .forEach((track) => track.stop());
    };
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("sending video signal", {
        userToSignal,
        callerID,
        signal,
        userSending: { name: user?.name, avatar: user?.avatar },
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("returning video signal from receiver", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div
      className="video-chat"
      style={{ padding: `${videoCollapsed ? "0" : "1rem"}` }}
    >
      <div className="expand-collapse">
        {videoCollapsed ? (
          <ExpandLessIcon className="collapse" />
        ) : (
          <ExpandLessIcon className="expand" />
        )}
      </div>
      <div className="video-container">
        <div className="video-card video-active audio-active">
          <video ref={userVideo} autoPlay playsInline muted></video>
          <div className="video-info">
            <img src={user?.avatar} alt="" />
            <div className="name">{user?.name} (You)</div>
          </div>
          <div className="audio-info">
            <i className="fa-solid fa-microphone-slash"></i>
          </div>
        </div>
        {peers.map((peerData, index) => {
          return (
            <div
              className={`video-card ${
                peerData.videoIsActive ? "video-active" : ""
              } ${peerData.audioIsActive ? "audio-active" : ""}`}
              key={index}
            >
              <Video peer={peerData.peer} />
              <div className="video-info ">
                <img src={peerData.avatar} alt="" />
                <div className="name">{peerData.name}</div>
              </div>
              <div className="audio-info">
                <i className="fa-solid fa-microphone-slash"></i>
              </div>
            </div>
          );
        })}
      </div>
      <div className="control-buttons">
        <div className="audio-btn control-btn active " onClick={muteAudio}>
          <i className="fa-solid fa-microphone-slash"></i>
          <i className="fa-solid fa-microphone"></i>
        </div>
        <div className="video-btn control-btn active" onClick={muteVideo}>
          <i className="fa-solid fa-video-slash"></i>
          <i className="fa-solid fa-video"></i>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
