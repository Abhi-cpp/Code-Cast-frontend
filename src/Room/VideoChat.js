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
    useEffect(() => {
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id)
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
            console.log('remotePeerIdValue', remotePeerIdValue)
            console.log('peerId', peerId)
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
        <div className="App">
            <h1>Current user id is {peerId}</h1>
            <button onClick={muteVideo}>Mute Video</button>
            <button onClick={muteAudio}>Mute Audio</button>
            <button onClick={stopVideo}>Stop Video</button>
            {screen ? <> <div>
                <video ref={currentUserVideoRef} muted />
            </div>
                <div>
                    <video ref={remoteVideoRef} />
                </div></> : <button onClick={() => {
                    socket.emit('Id', { roomid, peerId })
                    setScreen(true);
                }}>Call</button>
            }



        </div>
    );
};

export default VideoChat;