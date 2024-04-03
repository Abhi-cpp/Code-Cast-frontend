import { useContext, useEffect, useState, useRef } from 'react';
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
    const [userUpdated, setUserUpdated] = useState(null);
    const requestId = useRef(null);
    const userAdded = useRef(false);

    useEffect(() => {
        if (user === null || currRoom === null) {
            navigate('/');
        }
        socket.on('connect', () => {
            console.log('connected');
            console.log(socket.id);
        })
        socket.on("join permission", (({ user, senderID }) => {
            const permissionBlock = document.querySelector(".room .permission-block");
            permissionBlock.classList.add("active");
            permissionBlock.children[0].children[1].innerHTML = `<span>${user.name}</span>  wants to join the room`;
            permissionBlock.children[0].children[0].src = user.avatar;
            requestId.current = senderID;
        }))
        window.addEventListener("scroll", stopScroll)

        function stopScroll(e) {
            e.preventDefault();
        }

        return () => {
            socket.off();
            window.removeEventListener("scroll", stopScroll);
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
                setUserUpdated(newUser);
                userAdded.current = true;
                toast.success(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
            socket.on('userLeft', ({ msg, userId }) => {
                setUserUpdated({ id: userId });
                userAdded.current = false;
                toast.error(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
            socket.on('error', ({ error }) => {
                console.log('error from socket call', error)
            })
        }
    }, [socket])


    useEffect(() => {
        if (!userUpdated) return;
        if (userAdded.current) {
            setInRoomUsers([...inRoomUsers, userUpdated]);
        } else {
            setInRoomUsers(inRoomUsers.filter((user) => user.id !== userUpdated.id));
        }
    }, [userUpdated])

    const updateRoomUsers = (users) => {
        setInRoomUsers([...users]);
    }

    async function leaveRoom() {
        socket.emit('leave', { roomid });
        socket.off();
        navigate('/');
        window.location.reload();
    }

    function acceptPermission() {
        const permissionBlock = document.querySelector(".room .permission-block");
        permissionBlock.classList.remove("active");
        socket.emit("accept permission", { senderID: requestId.current });
    }

    function rejectPermission() {
        const permissionBlock = document.querySelector(".room .permission-block");
        permissionBlock.classList.remove("active");
        socket.emit("reject permission", { senderID: requestId.current });
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
                <div className="permission-block">
                    <div className="user-info">
                        <img src="" alt="" />
                        <div className="user-name"></div>
                    </div>
                    <div className="buttons">
                        <button className="accept" onClick={acceptPermission}>Accept</button>
                        <button className="reject" onClick={rejectPermission}>Reject</button>
                    </div>
                </div>
                <ToastContainer autoClose={2000} />
            </div >
        )
    }
    else return (null);
}
export default Room;