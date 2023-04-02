// using webrtc and  peerjs creat audio chat.
import { Peer } from "peerjs";
import React, { useEffect, useRef, useState } from "react";
const VideoChat = ({ socket, roomid }) => {
    const [mic, setMic] = useState(false);
    const [peerId, setPeerId] = useState(null);
    const remoteVideoRef = useRef(null);
    const localVideoRef = useRef(null);
    const peerInstance = useRef(null);

    useEffect(() => {
        const peer = new Peer();
        peer.on("open", (id) => {
            setPeerId(id);
        });
        peer.on("call", (call) => {
            var getUserMedia = navigator.getUserMedia;
            getUserMedia({ video: false, audio: true }, (stream) => {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play();
                call.answer(stream);
                call.on("stream", (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play();
                });
            });
        });
        peerInstance.current = peer;

        socket.on("Id", ({ peerId }) => {
            connectToPeer(peerId);
        })

        return () => {
            peerInstance.current.destroy();
            socket.off("Id");
        };

    }, []);

    function join() {
        socket.emit("Id", { roomid, peerId });
    }

    const connectToPeer = (remotePeerId) => {

        var getUserMedia = navigator.getUserMedia;

        getUserMedia({ video: false, audio: true }, (stream) => {

            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();

            var call = peerInstance.current.call(remotePeerId, stream);

            call.on("stream", (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play();
            });
        });
    };

    return (
        <div>
            <div>
                {
                    peerId ? <button onClick={join}>Join Chat</button> : null
                }
            </div>
            <audio ref={localVideoRef} autoPlay muted></audio>
            <audio ref={remoteVideoRef} autoPlay></audio>
        </div>
    );
};

export default VideoChat;