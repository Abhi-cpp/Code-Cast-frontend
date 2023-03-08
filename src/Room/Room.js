import { useContext, useEffect } from 'react';
import { DataContext } from '../Components/DataContext';
import WhiteBoard from './WhiteBoard';
import CodeEditor from './CodeEditor';
import VideoChat from './VideoChat';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SquareLoader from "react-spinners/SquareLoader";

const Room = () => {
    const { user, currRoom, socket, setCurrRoom } = useContext(DataContext);
    const navigate = useNavigate();
    useEffect(() => {
        console.log('room data in room', currRoom);
        if (user === null || currRoom === null) {
            navigate('/');
        }
        socket.on('connect', () => {
            console.log('connected');
        })

        if (currRoom) {
            socket.emit('join', {
                name: user.name,
                roomName: currRoom.name,
                roomid: currRoom.roomid,
                code: currRoom.code,
                language: currRoom.language,
                token: localStorage.getItem('user')
            })
        }

        socket.on('greet', ({ msg, room }) => {
            console.log('room data', room)
            setCurrRoom(room);
        })

        socket.on('userJoin', ({ msg, room }) => {
            console.log('user joined', msg)
            toast.success(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            // setCurrRoom(room);
        })

        socket.on('userLeft', ({ msg, room }) => {
            console.log('user left', msg)
            toast.error(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            // setCurrRoom(room);
        })

        return () => {
            leaveRoom();
        }

    }, [])

    async function leaveRoom() {
        console.log("leave room");
        socket.emit('leaveRoom', { roomid: currRoom.roomid });
        socket.disconnect();
        console.log("leave completed")
        // navigate('/');
    }

    // window.addEventListener('beforeunload', handleBeforeUnload);
    // function handleBeforeUnload() {
    //     console.log('leaving room')
    //     socket.emit('leaveRoom', { roomid: currRoom.roomid });
    //     socket.off();
    // }


    return (
        <div className="room">
            {(currRoom && user) ? (
                <>
                    <button onClick={leaveRoom}>Leave Room</button>
                    {/* <WhiteBoard /> */}
                    {/* <CodeEditor />
                    <VideoChat /> */}
                </>
            ) :
                null
            }
            <ToastContainer />
        </div>

    )
}


export default Room;