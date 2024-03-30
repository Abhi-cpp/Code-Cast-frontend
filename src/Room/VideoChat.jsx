import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { DataContext } from "../Components/DataContext";
import Peer from "simple-peer"
import "../Styles/video-chat.css";

export const reArrangeVideos = () => {
    const videoContainer = document.querySelector(".video-chat .video-container");
    let width = videoContainer.getBoundingClientRect().width;
    let height = videoContainer.getBoundingClientRect().height;
    let padding = parseInt(window.getComputedStyle(videoContainer).padding);
    let gap = parseInt(window.getComputedStyle(videoContainer).gap);
    let totalComponents = document.querySelector(".video-chat .video-container").childElementCount;
    width -= padding * 2;
    height -= padding * 2;
    let video = document.querySelector("video");
    let videoWidth = video.videoWidth || 640;
    let videoHeight = video.videoHeight || 480;
    let ratio = videoWidth / videoHeight;
    let minRatio = ratio * 0.6;
    let maxRatio = ratio * 1.5;
    let rowCount = 1;
    let videoCards = document.querySelectorAll(".video-card");
    while (rowCount <= totalComponents) {
        let colCount = Math.ceil((totalComponents) / rowCount);
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
            videoCards.forEach((card, index) => {
                card.style.width = `${perRowWidth}px`;
                card.style.height = `${perRowHeight}px`;
            })
            break;
        }

        rowCount++;
    }
}

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <video playsInline autoPlay ref={ref}></video>
    );
}

const VideoChat = () => {
    const { user, currRoom, socket } = useContext(DataContext);
    const [peers, setPeers] = useState([]);
    const userVideo = useRef();
    const roomID = currRoom.roomid;

    function muteAudio() {
        const audio = userVideo.current.srcObject.getAudioTracks()[0];
        audio.enabled = !audio.enabled;
        document.querySelector(".video-card").classList.toggle("audio-active");
        socket.emit("toggle-audio", { roomID, userID: socket.id });
    }

    function muteVideo() {
        const video = userVideo.current.srcObject.getVideoTracks()[0];
        video.enabled = !video.enabled;

        socket.emit("toggle-video", { roomID, userID: socket.id });
        document.querySelector(".video-card").classList.toggle("video-active");
    }

    useEffect(() => {
        window.addEventListener("resize", reArrangeVideos);
        window.addEventListener("load", reArrangeVideos);
        reArrangeVideos(peers);
        socket.on("toggle-video", (data) => {
            setPeers(users => {
                return users.map(user => {
                    if (user.userID === data.userID) {
                        user.videoIsActive = !user.videoIsActive;
                    }
                    return user;
                })
            })
        });
        socket.on("toggle-audio", (data) => {
            setPeers(users => {
                return users.map(user => {
                    if (user.userID === data.userID) {
                        user.audioIsActive = !user.audioIsActive;
                    }
                    return user;
                })
            })
        });

        socket.on("sender receiving final signal", data => {
            const item = peers.find(p => p.userID === data.id);
            item.peer.signal(data.signal);
        })

        socket.on("user left video call", (data) => {
            setPeers(users => {
                return users.filter(user => user.userID !== data.userID);
            })
        })

        return () => {
            window.removeEventListener("resize", reArrangeVideos);
            window.removeEventListener("load", reArrangeVideos);
            socket.off("toggle-video");
            socket.off("toggle-audio");
            socket.off("user left video call");
            socket.off("sender receiving final signal");
        }
    }, [peers])

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socket.emit("start-video", { roomID });
            socket.on("allUsers", users => {
                const peers = [];
                users.forEach(user => {
                    const peer = createPeer(user.id, socket.id, stream);
                    peers.push({ peer, userID: user.id, name: user.name, avatar: user.avatar, videoIsActive: true, audioIsActive: true });
                })
                setPeers(peers);
            })

            socket.on("new video user joined", (data) => {
                const peer = addPeer(data.signal, data.callerID, stream);
                setPeers(users => [...users, { peer, userID: data.callerID, name: data.userSending.name, avatar: data.userSending.avatar, videoIsActive: true, audioIsActive: true }]);
            })
        })

        const buttons = document.querySelectorAll(".control-btn");
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
            })
        })

        return () => {
            userVideo.current?.srcObject?.getTracks().forEach(track => track.stop());
        }

    }, [])

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socket.emit("sending video signal", { userToSignal, callerID, signal, userSending: { name: user.name, avatar: user.avatar } })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socket.emit("returning video signal from receiver", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <div className="video-chat">
            <div className="video-container">
                <div className="video-card video-active audio-active">
                    <video ref={userVideo} autoPlay playsInline muted></video>
                    <div className="video-info">
                        <img src={user.avatar} alt="" />
                        <div className="name">{user.name} (You)</div>
                    </div>
                    <div className="audio-info">
                        <fa className="fa-solid fa-microphone-slash"></fa>
                    </div>
                </div>
                {peers.map((peerData, index) => {
                    return (
                        <div className={`video-card ${peerData.videoIsActive ? 'video-active' : ''} ${peerData.audioIsActive ? 'audio-active' : ''}`}>
                            <Video autoPlay playsInline peer={peerData.peer} />
                            <div className="video-info ">
                                <img src={peerData.avatar} alt="" />
                                <div className="name">{peerData.name}</div>
                            </div>
                            <div className="audio-info">
                                <fa className="fa-solid fa-microphone-slash"></fa>
                            </div>
                        </div>
                    )
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
    )
}


export default VideoChat;




