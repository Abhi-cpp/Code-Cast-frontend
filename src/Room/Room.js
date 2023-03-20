import { useContext, useEffect, useState, useRef } from 'react';
import { DataContext } from '../Components/DataContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Ace from './Ace';
import { diff_match_patch } from 'diff-match-patch';
import defaultCode from './../static/default_code.json';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';


const dmp = new diff_match_patch();

const Room = () => {
    const { user, currRoom, socket } = useContext(DataContext);
    const navigate = useNavigate();
    const [language, setLanguage] = useState(currRoom ? currRoom.language : "javascript");
    let [code, setCode] = useState(currRoom ? currRoom.code : defaultCode[language ? language : "javascript"]);
    let roomid = currRoom ? currRoom.roomid : "";
    let name = user ? user.name : "";
    let roomName = currRoom ? currRoom.name : "";
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [inRoomUsers, setInRoomUsers] = useState([]);


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
                output,
                avatar: user.avatar
            })
        }

        socket.on('join', ({ msg, room }) => {
            console.log("jonin gave me this data\n", room, "\n");
            toast(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            setCode(room.code);
            setLanguage(room.language);
            setInput(room.input);
            setOutput(room.output);
            setInRoomUsers(room.users);
            socket.off('join')
        })
        return () => {
            socket.off();
        }

    }, [])

    // if socket is connected then emit updateIO
    if (socket.connected) {
        {
            socket.off('userJoin')
            socket.on('userJoin', ({ msg, newUser }) => {
                // add user to inRoomUsers
                const arr = [];
                arr.push(newUser);
                for (let user of inRoomUsers)
                    arr.push(user);
                setInRoomUsers(arr);
                toast.success(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
        }

        {
            socket.off('userLeft')
            socket.on('userLeft', ({ msg, userId }) => {
                console.log('userLeft', msg)
                // remove user from inRoomUsers
                const arr = inRoomUsers.filter(user => user.id !== userId);
                setInRoomUsers(arr);
                console.log('userLeft', inRoomUsers)
                toast.error(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
        }
        {
            socket.off('update')
            socket.on('update', ({ patch }) => {
                // i have no idea why code is empty at this point so i have to do this ugly hack
                // console.log('Editor Ref', EditorRef.current.editor.getValue())
                code = EditorRef.current.editor.getValue();
                let [newCode, results] = dmp.patch_apply(patch, code);
                if (results[0] === true) {
                    const pos = EditorRef.current.editor.getCursorPosition();
                    let oldn = code.split('\n').length;
                    let newn = newCode.split('\n').length;
                    code = newCode;
                    setCode(newCode);
                    const newrow = pos.row + newn - oldn;
                    if (oldn != newn) {
                        EditorRef.current.editor.gotoLine(newrow, pos.column);
                    }

                }
                else {
                    console.log('error applying patch')
                    socket.emit('getRoom', { roomid })
                }
            })
        }
        {
            socket.off('getRoom')
            socket.on('getRoom', ({ room }) => {
                setCode(room.code);
                setLanguage(room.language);
                setInput(room.input);
                setOutput(room.output);
            })
        }
        {
            socket.off('updateIO')
            socket.on('updateIO', ({ newinput, newoutput, newlanguage }) => {
                // update IO
                console.log('updateIo', newinput, newoutput, newlanguage);
                setLanguage(newlanguage);
                setInput(newinput);
                setOutput(newoutput);
            })
        }
        {
            socket.off('error')
            socket.on('error', ({ error }) => {
                console.log('error from socket call', error)
            })
        }
    }

    const IOEMIT = (a, b, c) => {
        socket.emit('updateIO', {
            roomid,
            input: a,
            output: b,
            language: c
        })
    }


    async function leaveRoom() {
        socket.emit('leave', { roomid });
        socket.off();
        navigate('/');
    }



    return (
        <div className="room">
            {(currRoom && user) ? (
                <div>
                    <br />
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
                    <br />
                    <button onClick={leaveRoom}>Leave Room</button>
                    <Stack direction="row" spacing={2}>
                        {inRoomUsers.map((user) => (
                            <Avatar key={user.id} alt={user.name} src={user.avatar} />
                        ))}
                    </Stack>
                </div>
            ) :
                null
            }
            <ToastContainer />
        </div>

    )
}


export default Room;