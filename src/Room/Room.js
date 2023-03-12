import { useContext, useEffect, useState } from 'react';
import { DataContext } from '../Components/DataContext';
import CodeEditor from './CodeEditor';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Room = () => {
    const { user, currRoom, socket } = useContext(DataContext);
    const navigate = useNavigate();
    const [language, setLanguage] = useState(currRoom ? currRoom.language : "javascript");
    const [code, setCode] = useState(currRoom ? currRoom.code : "");
    let roomid = currRoom ? currRoom.roomid : "";
    let name = user ? user.name : "";
    let roomName = currRoom ? currRoom.name : "";

    useEffect(() => {
        if (user === null || currRoom === null) {
            navigate('/');
        }
        socket.on('connect', () => {
            console.log('connected');
        })

        if (currRoom) {
            socket.emit('join', {
                name,
                roomName,
                roomid,
                code,
                language,
                token: localStorage.getItem('user')
            })
        }

        socket.on('greet', ({ msg, room }) => {
            toast(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            setCode(room.code);
            setLanguage(room.language);
        })

        socket.on('userJoin', ({ msg }) => {
            toast.success(msg, {
                position: toast.POSITION.TOP_RIGHT
            });

        })

        socket.on('userLeft', ({ msg }) => {
            toast.error(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
        })

        socket.on('update', ({ room }) => {
            setCode(room.code);
            setLanguage(room.language);
        })


        socket.on('error', ({ error }) => {
            console.log('error from socket call', error)
        })


    }, [])

    function updateRoom(val) {
        socket.emit('updateRoom', {
            roomid,
            code: (val ? val : code)
            ,
            language
        })
    }


    async function leaveRoom() {
        socket.emit('leaveRoom', { roomid });
        socket.off();
        navigate('/');
    }


    return (
        <div className="room">
            {(currRoom && user) ? (
                <>
                    <CodeEditor
                        updateRoom={updateRoom}
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        roomName={roomName}
                    />
                    <button onClick={leaveRoom}>Leave Room</button>
                </>
            ) :
                null
            }
            <ToastContainer />
        </div>

    )
}


export default Room;