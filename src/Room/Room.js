import { useContext, useEffect, useState, useRef } from 'react';
import { DataContext } from '../Components/DataContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Ace from './Ace';
import { diff_match_patch } from 'diff-match-patch';
const dmp = new diff_match_patch();

const Room = () => {
    const { user, currRoom, socket } = useContext(DataContext);
    const navigate = useNavigate();
    const [language, setLanguage] = useState(currRoom ? currRoom.language : "javascript");
    let [code, setCode] = useState("");
    let roomid = currRoom ? currRoom.roomid : "";
    let name = user ? user.name : "";
    let roomName = currRoom ? currRoom.name : "";
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');


    const EditorRef = useRef(null);


    function updateRoom(patch) {
        socket.emit('update', { roomid, patch })
    }

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
                token: localStorage.getItem('user'),
                input,
                output
            })
        }

        socket.on('join', ({ msg, room }) => {
            toast(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            console.log('room', room)
            setCode(room.code);
            setLanguage(room.language);
            setInput(room.input);
            setOutput(room.output);
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

            // i have no idea why code is empty at this point so i have to do this ugly hack
            console.log('Editor Ref', EditorRef.current.editor.getValue())
            code = EditorRef.current.editor.getValue();
            let [newCode, results] = dmp.patch_apply(patch, code);
            if (results[0] === true) {
                code = newCode;
                setCode(newCode);
            }
            else {
                console.log('patch failed');
            }
        })

        socket.on('updateIO', ({ input, output, language }) => {
            // update IO
            console.log('updateIO', input, output, language)
            setLanguage(language);
            setInput(input);
            setOutput(output);
        })

        socket.on('error', ({ error }) => {
            console.log('error from socket call', error)
        })

        return () => {
            socket.off();
        }

    }, [])

    const IOEMIT = (a, b, c) => {
        console.log('ioemit', a, b, c)
        socket.emit('updateIO', {
            roomid,
            input: a,
            output: b,
            language: c
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
                    <Ace
                        updateRoom={updateRoom}
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        roomName={roomName}
                        roomid={roomid}
                        EditorRef={EditorRef}
                        input={input}
                        setInput={setInput}
                        output={output}
                        setOutput={setOutput}
                        IOEMIT={IOEMIT}
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