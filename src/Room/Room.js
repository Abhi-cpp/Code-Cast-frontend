import { useContext, useEffect, useState, useRef } from 'react';
import { DataContext } from '../Components/DataContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Ace from './Ace';
import { debounce } from 'lodash';
import { diff_match_patch } from 'diff-match-patch';
const dmp = new diff_match_patch();

const Room = () => {

    const { user, currRoom, socket } = useContext(DataContext);
    const navigate = useNavigate();
    const [language, setLanguage] = useState(currRoom ? currRoom.language : "javascript");
    const [code, setCode] = useState("");
    let roomid = currRoom ? currRoom.roomid : "";
    let name = user ? user.name : "";
    let roomName = currRoom ? currRoom.name : "";
    // const updateRoom = useRef(debounce((newValue) => {

    // }, 1000)).current;

    function updateRoom(patch) {
        socket.emit('update', { roomid, patch })
    }

    useEffect(()=>{
        console.log('code change hua',code)
    },[code])

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

        socket.on('join', ({ msg, room }) => {
            toast(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            console.log('room', room)
            setCode(room.code);
            setLanguage(room.language);
            // add IO
            socket.off('join')
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

        socket.on('update', ({ patch }) => {
            console.log('patch', patch)
            console.log('code', code)
            let [newCode, results] = dmp.patch_apply(patch, code);
            console.log(newCode, results);
            setCode(newCode);
        })

        socket.on('updateIO', ({ inputPath, outputPatch, language }) => {
            // update IO
            setLanguage(language);
        })

        socket.on('error', ({ error }) => {
            console.log('error from socket call', error)
        })

        return () => {
            socket.off();
        }

    }, [])


    async function leaveRoom() {
        socket.emit('leaveRoom', { roomid });
        socket.off();
        navigate('/');
    }


    return (
        <div className="room">
            {(currRoom && user) ? (
                <>
                    <Ace
                        updateRoom={updateRoom}
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        roomName={roomName}
                        roomid={roomid}
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