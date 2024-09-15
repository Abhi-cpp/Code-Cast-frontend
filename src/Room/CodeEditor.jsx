import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../Components/DataContext.jsx';
import defaultCode from '../static/default_code.json';
import AceEditor from 'react-ace';
import axios from 'axios';
import Settings from './EditorSettings.jsx';
import { diff_match_patch } from 'diff-match-patch';
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-csharp';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-rust.js';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-cobalt';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/theme-terminal';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-vibrant_ink';
import 'ace-builds/src-noconflict/theme-one_dark'
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-github_dark.js';
import { toast } from 'react-toastify';
import { THEME_OPTIONS } from '../utils/settingsOptions.js';


const CodeEditor = ({
    updateRoomUsers,
}) => {
    const dmp = new diff_match_patch();
    const [theme, setTheme] = useState('github_dark');
    const { user, currRoom, socket } = useContext(DataContext);
    let roomid = currRoom ? currRoom.roomid : "";
    let name = user ? user.name : "";
    let roomName = currRoom ? currRoom.name : "";
    const [fontSize, setFontSize] = useState(14);
    const [fontFamily, setFontFamily] = useState('monospace');
    const sent = useRef(true);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const EditorRef = useRef(null);
    let [code, setCode] = useState(currRoom ? currRoom.code : defaultCode[language ? language : "javascript"]);
    const [language, setLanguage] = useState(currRoom ? currRoom.language : "javascript");
    const [running, setRunning] = useState(false);


    const IOEMIT = (a, b, c) => {
        socket.emit('updateIO', {
            roomid,
            input: a,
            output: b,
            language: c
        })
    }

    const run = async () => {
        setRunning(true);
        const id = toast.loading("Compiling...")
        await axios({
            url: process.env.REACT_APP_BACKEND_URL + 'code/execute',
            method: 'post',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`
            },
            data: {
                code,
                input,
                language
            }
        })
            .then((res) => {
                toast.update(id, { render: "Compiled successfully", type: "success", isLoading: false, autoClose: 1000 });
                setRunning(false);
                let result = res.data.output ? res.data.output : res.data.error;
                setOutput(result)
                IOEMIT(input, result, language)
            })
            .catch((err) => {
                toast.update(id, { render: "Compilation failed", type: "error", isLoading: false, autoClose: 1500 });
                setRunning(false);
                console.log("error from axios", err)
            })
    }

    const sendCode = (patch) => {
        socket.emit('update', { roomid, patch })
    }

    useEffect(() => {
        if (!sent.current) return;
        sent.current = false;
        const sendData = setTimeout(() => {
            axios({
                method: 'patch',
                url: process.env.REACT_APP_BACKEND_URL + 'rooms/update',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('user')}`
                },
                data: {
                    'room': {
                        roomid,
                        code,
                        language
                    },
                }
            })
                .then((res) => {
                    // console.log("patched successfully", res)
                })
                .catch((err) => {
                    // console.log("error from axios", err)
                })
            sent.current = true;
        }, 2000)
    }, [code])

    useEffect(() => {
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

        socket.on('join', ({ msg, room, socketId }) => {
            toast(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            setCode(room.code);
            setLanguage(room.language);
            setInput(room.input);
            setOutput(room.output);
            updateRoomUsers(room.users);
            socket.off('join')
        })

        socket.on('update', ({ patch }) => {
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

        socket.on('getRoom', ({ room }) => {
            setCode(room.code);
            setLanguage(room.language);
            setInput(room.input);
            setOutput(room.output);
        })

        socket.on('updateIO', ({ newinput, newoutput, newlanguage }) => {
            setLanguage(newlanguage);
            setInput(newinput);
            setOutput(newoutput);
        })
    }, [])

    useEffect(() => {
        if (!theme) return;
        handleThemeChange();
    }, [theme])

    const handleThemeChange = () => {
        const newThemeType = THEME_OPTIONS.find((option) => option.value === theme).type;
        const root = document.querySelector('#root');
        root.classList.remove('light', 'dark');
        root.classList.add(newThemeType);
        let strings = theme.split('_');
        let aceClass = "ace";
        strings.forEach((string) => {
            aceClass += `-${string}`;
        })
        if (theme === 'terminal') aceClass += '-theme';
        let ace = document.querySelector(`.${aceClass}`);
        if (!ace) return;
        let aceStyle = getComputedStyle(ace);
        let aceGutterStyle = getComputedStyle(ace.querySelector('.ace_gutter'));
        let aceBackgroundColor = aceStyle.backgroundColor;
        let aceTextColor = aceStyle.color;
        let gutterBackColor = aceGutterStyle.backgroundColor;
        let gutterTextColor = aceGutterStyle.color;
        let room = document.querySelector('.room');
        room.style.setProperty('--primary-background-color', aceBackgroundColor);
        room.style.setProperty('--secondary-background-color', gutterBackColor);
        room.style.setProperty('--primary-text-color', aceTextColor);
        room.style.setProperty('--secondary-text-color', gutterTextColor);
    }

    function handleChange(newValue, event) {
        const patch = dmp.patch_make(code, newValue);
        sendCode(patch);
        setCode(newValue)
    }

    const handleIOChange = (newValue) => {
        setInput(newValue)
        IOEMIT(newValue, output, language)
    }

    function handleLangChange(e) {
        setLanguage(e)
        IOEMIT(input, output, e)
    }

    return (
        <div id="editor">
            <Settings
                setLanguage={setLanguage}
                setTheme={setTheme}
                setFontSize={setFontSize}
                setFontFamily={setFontFamily}
                language={language}
                theme={theme}
                fontSize={fontSize}
                fontFamily={fontFamily}
                roomName={roomName}
                sendCode={sendCode}
                run={run}
                handleLangChange={handleLangChange}
                roomid={roomid}
                running={running}
            />
            <div id='workspace' >
                <AceEditor
                    setOptions={{
                        useWorker: false,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        fontFamily,
                        fontSize,
                    }}

                    onChange={handleChange}
                    mode={language}
                    theme={theme}
                    name="ACE_EDITOR"
                    value={code}
                    fontSize={18}
                    height=''
                    width=''
                    setAutoScrollEditorIntoView
                    defaultValue=''
                    ref={EditorRef}
                    editorProps={{ $blockScrolling: true }}
                    highlightActiveLine={false}
                    wrapEnabled={true}
                />

                <div id='io'>
                    <div className="input">
                        <h5>Input</h5>
                        <AceEditor
                            theme={theme}
                            language={''}
                            value={input}
                            width=""
                            height=""
                            onChange={handleIOChange}
                            fontSize={fontSize}
                            highlightActiveLine={false}
                            wrapEnabled={true}
                        />
                    </div>
                    <div className="output">
                        <h5>Output</h5>
                        <AceEditor
                            theme={theme}
                            language={''}
                            value={output}
                            width=""
                            height=""
                            readOnly={true}
                            fontSize={fontSize}
                            highlightActiveLine={false}
                        />
                    </div>
                </div>
            </div>
        </div >
    )
};

export default CodeEditor;
