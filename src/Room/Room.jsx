import { useContext, useEffect, useState } from 'react';
import { DataContext } from '../Components/DataContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CodeEditor from './CodeEditor';
import VideoChat from './VideoChat';
import WhiteBoard from './WhiteBoard';
import "../Styles/room.css";
import { reArrangeVideos } from './VideoChat';

const Room = () => {
    const { user, currRoom, socket } = useContext(DataContext);
    const navigate = useNavigate();
    let roomid = currRoom ? currRoom.roomid : "";
    const [inRoomUsers, setInRoomUsers] = useState([]);

    useEffect(() => {
        if (user === null || currRoom === null) {
            navigate('/');
        }
        socket.on('connect', () => {
            console.log('connected');
        })

        return () => {
            socket.off();
        }
    }, [])

    useEffect(() => {
        const resizeBtn = document.querySelector("#resize-editor");
        resizeBtn?.addEventListener("mousedown", (e) => {
            const startX = e.clientX;
            const initialWidth = document.querySelector("#editor").offsetWidth;
            document.body.addEventListener("mousemove", changeWidth);

            document.body.addEventListener("mouseup", () => {
                document.body.removeEventListener("mousemove", changeWidth);
            })

            document.body.addEventListener("mouseleave", () => {
                document.body.removeEventListener("mousemove", changeWidth);
            })

            function changeWidth(e) {
                const videoChat = document.querySelector(".video-chat");
                const editor = document.querySelector("#editor");
                const finalX = e.clientX;
                let editorWidth = initialWidth + finalX - startX;
                editor.style.width = editorWidth + "px";
                let videoWidth = window.innerWidth - editorWidth - 50;
                videoChat.style.width = videoWidth + "px";
                reArrangeVideos();
            }

        });

    }, [currRoom]);

    useEffect(() => {
        if (socket.connected) {
            socket.on('userJoin', ({ msg, newUser }) => {
                const arr = [];
                arr.push(newUser);
                for (let user of inRoomUsers)
                    arr.push(user);
                setInRoomUsers([...arr]);
                toast.success(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
            socket.on('userLeft', ({ msg, userId }) => {
                const arr = inRoomUsers.filter(user => user.id !== userId);
                setInRoomUsers(arr);
                toast.error(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
            socket.on('error', ({ error }) => {
                console.log('error from socket call', error)
            })
        }
    }, [socket])

    const updateRoomUsers = (users) => {
        setInRoomUsers([...users]);
    }

    async function leaveRoom() {
        socket.emit('leave', { roomid });
        socket.off();
        navigate('/');
        window.location.reload();
    }

    if (currRoom && user) {
        return (
            <div className='room'>
                <div className="users-joined">
                    <button id="leave-room" className="active" onClick={leaveRoom}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                    {inRoomUsers.map((user) => (
                        <div className="user-joined" key={user.id}>
                            <img src={user.avatar} alt="" />
                            <div className="name">{user.name}</div>
                        </div>
                    ))}
                </div>
                <div className="core-components">
                    <div className="code-editor-video-chat-parent">
                        <CodeEditor
                            updateRoomUsers={updateRoomUsers}
                        />
                        <div id="resize-editor">
                            <div id="lines-resize"></div>
                        </div>
                        <VideoChat />

                    </div>
                    <WhiteBoard />
                </div>
                <ToastContainer autoClose={2000} />
            </div >
        )
    }
    else return (null);
}
export default Room;