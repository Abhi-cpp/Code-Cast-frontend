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
    useEffect(() => {
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id)
            console.log(performance.now() - time.current);
        });

        peer.on('call', (call) => {
            var getUserMedia = navigator.getUserMedia;

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

        peerInstance.current = peer;
    }, [])

    useEffect(() => {
        if (currentUserVideoRef.current && screen) {
            currentUserVideoRef.current.srcObject.getVideoTracks()[0].enabled = video;
        }
    }, [video])

    useEffect(() => {
        if (currentUserVideoRef.current && screen) {
            currentUserVideoRef.current.srcObject.getAudioTracks()[0].enabled = audio;
        }
    }, [audio])

    // mute video audio or stop video
    const muteVideo = () => {
        setVideo(!video);
    }

    const muteAudio = () => {
        setAudio(!audio);
    }

    const stopVideo = () => {
        setScreen(!screen);
    }


    useEffect(() => {
        if (remotePeerIdValue) {
            // console.log('remotePeerIdValue', remotePeerIdValue)
            // console.log('peerId', peerId)
            call(remotePeerIdValue);
        }
    }, [remotePeerIdValue])

    const call = (remotePeerId) => {
        var getUserMedia = navigator.getUserMedia;

        getUserMedia({ video: true, audio: true }, (mediaStream) => {

            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();

            const call = peerInstance.current.call(remotePeerId, mediaStream)

            call.on('stream', (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream
                remoteVideoRef.current.play();
            });
        });
        setScreen(true);
    }

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
                            <button onClick={muteVideo}>Mute Video</button>
                            <button onClick={muteAudio}>Mute Audio</button>
                            <button> End Call</button>
                            <button onClick={() => {
                                socket.emit('Id', { roomid, peerId })
                                setScreen(true);
                                document.querySelectorAll(".user-video").forEach(video => {
                                    video.classList.add("active");
                                })
                            }}>Start Call</button>
                        </> :
                        <button onClick={() => {
                            socket.emit('Id', { roomid, peerId })
                            setScreen(true);
                            document.querySelectorAll(".user-video").forEach(video => {
                                video.classList.add("active");
                            })
                        }}>Start Call</button>}
                </div>) : <h1>Loading</h1>}
        </div >
    );
};

export default VideoChat;