import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';
import Settings from './EditorSettings.js';

import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-csharp';
import 'ace-builds/src-noconflict/mode-golang';

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


const Ace = (props) => {
    const { language, setLanguage, code, setCode, roomName, updateRoom, roomid } = props;
    const [theme, setTheme] = useState('monokai');
    const [fontSize, setFontSize] = useState(18);
    const [fontFamily, setFontFamily] = useState('monospace');


    useEffect(() => {
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
                })
                .catch((err) => {
                    console.log("error from axios", err)
                })
        }, 2000)

        return () => clearTimeout(sendData)
    }, [code])


    function handleChange(newValue) {
        setCode((newValue));
        updateRoom(newValue,language);
    }

    return (
        <div className="editor">
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
                updateRoom={updateRoom}
            />
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
                fontSize={14}
                width="90vw"
                height='70vh'
            />
        </div>
    )
};

export default Ace;
