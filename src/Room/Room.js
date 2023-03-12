import { useContext, useEffect, useRef } from 'react';
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
            toast(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            setCurrRoom({ ...room });
        })

        socket.on('userJoin', ({ msg, room }) => {
            toast.success(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            setCurrRoom({ ...room });
        })

        socket.on('userLeft', ({ msg, room }) => {
            toast.error(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            setCurrRoom({ ...room });
        })

        socket.on('update', ({ room }) => {
            console.log('update recieved', room)
            setCurrRoom({ ...room });
        })


        socket.on('error', ({ error }) => {
            console.log('error from socket call', error)
        })


    }, [])

    function updateRoom(room) {
        console.log('update sent', room)
        socket.emit('updateRoom', {
            roomid: room.roomid,
            code: room.code,
            language: room.language
        })
    }


    async function leaveRoom() {
        socket.emit('leaveRoom', { roomid: currRoom.roomid });
        socket.off();
        navigate('/');
    }


    return (
        <div className="room">
            {(currRoom && user) ? (
                <>
                    <CodeEditor updateRoom={updateRoom} /> 
                    <button onClick={leaveRoom}>Leave Room</button>
                    {/* <WhiteBoard />
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