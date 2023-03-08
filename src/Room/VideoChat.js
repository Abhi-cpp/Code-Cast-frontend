import '../video-chat.css';
import AppendScript from '../AppendScript';
import { useEffect } from 'react';
const VideoChat = () => {

    useEffect(() => {
        AppendScript("./videoChat.js");
    })


    return (
        <div id="video-chat">
            <div className="stream">
                <div id="video-streams"></div>
                <div id="controls">
                    <div id="microphone" className="microphone">
                        <i className="fas fa-microphone"></i>
                        <i className="fas fa-microphone-slash"></i>
                    </div>
                    <div id="camera" className="camera">
                        <i className="fas fa-video"></i>
                        <i className="fas fa-video-slash"></i>
                    </div>
                    <div id="join">
                        <i className="fas fa-phone" id="join-btn"></i>
                        <i className="fas fa-phone-slash" id="leave-btn"></i>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default VideoChat;