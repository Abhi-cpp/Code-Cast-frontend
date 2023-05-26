// using webrtc and  peerjs creat audio chat.
import { Peer } from "peerjs";
import React, { useEffect, useRef, useState } from "react";
const VideoChat = ({ socket, roomid }) => {
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);
    const [screen, setScreen] = useState(false);
    const time = useRef(performance.now());
    const peer = new Peer();

    // mute video audio or stop video
    const muteVideo = () => {
        setVideo(!video);
    }

    const muteAudio = () => {
        setAudio(!audio);
    }

    function quitVideoCall() {
        setScreen(false);
        peerInstance.current.destroy();
    }

    function startCall() {
        socket.emit('Id', { roomid, peerId })
        setScreen(true);
        document.querySelectorAll(".user-video").forEach(video => {
            video.classList.add("active");
        })
    }


    const call = (remotePeerId) => {
        let getUserMedia = navigator.getUserMedia;

        getUserMedia({ video: true, audio: true }, (mediaStream) => {

            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();

            const call = peerInstance.current.call(remotePeerId, mediaStream)

            call.on('stream', (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream
                remoteVideoRef.current.play();
            });
        });
    }

    useEffect(() => {

        peer.on('open', (id) => {
            setPeerId(id)
            console.log(performance.now() - time.current);
        });

        peer.on('call', (call) => {
            let getUserMedia = navigator.getUserMedia;

            getUserMedia({ video: true, audio: true }, (mediaStream) => {
                currentUserVideoRef.current.srcObject = mediaStream;
                currentUserVideoRef.current.play();
                call.answer(mediaStream)
                call.on('stream', function (remoteStream) {
                    remoteVideoRef.current.srcObject = remoteStream
                    remoteVideoRef.current.play();
                });
            });
        })

        socket.on('Id', (id) => {
            setRemotePeerIdValue(id.peerId);
        })

        peer.on("close", () => {
            console.log("peer closed")
            // setRemotePeerIdValue('');
            // currentUserVideoRef.current.srcObject = null;
            // currentUserVideoRef.current.pause();
            // currentUserVideoRef.current.load();
            // peerInstance.current.destroy();
            // remoteVideoRef.current.srcObject = null;
            // remoteVideoRef.current.pause();
            // remoteVideoRef.current.load();

        });





        peerInstance.current = peer;
    }, [])
    useEffect(() => {
        if (currentUserVideoRef.current && screen) {
            currentUserVideoRef.current.srcObject.getAudioTracks()[0].enabled = audio;
        }

        if (currentUserVideoRef.current && screen) {
            currentUserVideoRef.current.srcObject.getVideoTracks()[0].enabled = video;
        }
    }, [audio, video])

    useEffect(() => {
        if (remotePeerIdValue && screen) {
            call(remotePeerIdValue);
        }
    }, [remotePeerIdValue, screen])

    return (
        <div className="video-chat">
            <div className="users">
                <div className="user-video">
                    <video ref={remoteVideoRef} />
                </div>
                <div className="user-video">
                    <video ref={currentUserVideoRef} muted />
                </div>
            </div>
            {peerId ?
                (<div className="video-buttons">
                    {screen ?
                        <>
                            <button onClick={muteVideo} className={video ? "" : "muted"}>
                                {video ? <i className="fas fa-video"></i> : <i className="fas fa-video-slash"></i>}
                            </button>
                            <button onClick={muteAudio} className={audio ? " " : "muted"}>
                                {audio ? <i className="fas fa-microphone"></i> : <i className="fas fa-microphone-slash"></i>}
                            </button>
                            <button onClick={quitVideoCall}>
                                <i className="fas fa-phone"></i>
                            </button>

                        </> :
                        <button onClick={startCall}>Start Call</button>}
                </div>) : <h1>Loading</h1>}
        </div >
    );
};

export default VideoChat;