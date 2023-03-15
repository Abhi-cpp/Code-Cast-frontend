import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';
import Settings from './EditorSettings.js';
import { diff_match_patch } from 'diff-match-patch';
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
    const dmp = new diff_match_patch();
    const { language, setLanguage, roomName, updateRoom, code, setCode, roomid } = props;
    const [theme, setTheme] = useState('monokai');
    const [fontSize, setFontSize] = useState(18);
    const [fontFamily, setFontFamily] = useState('monospace');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    useEffect(() => {
        // const sendData = setTimeout(() => {
        //     axios({
        //         method: 'patch',
        //         url: process.env.REACT_APP_BACKEND_URL + 'rooms/update',
        //         headers: {
        //             'Authorization': `Bearer ${localStorage.getItem('user')}`
        //         },
        //         data: {
        //             'room': {
        //                 roomid,
        //                 code,
        //                 language
        //             },
        //         }
        //     })
        //         .then((res) => {
        //         })
        //         .catch((err) => {
        //             console.log("error from axios", err)
        //         })
        // }, 2000)

        // return () => clearTimeout(sendData)
    }, [code])


    function handleChange(newValue) {
        const patch = dmp.patch_make(code, newValue);
        updateRoom(patch);
        setCode(newValue)
        console.log(code);
    }


    const run = async () => {
        axios({
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
                if (res.data.output)
                    setOutput(res.data.output)
                else {
                    const error = res.data.error;
                    setOutput(error);
                }
            })
            .catch((err) => {
                console.log("error from axios", err)
            })
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
                run={run}
            />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: 1 }}>
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
                        height='100vh'
                        width='50vw'
                        defaultValue=''
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div className="text-center">
                        <h5>Input</h5>
                        <AceEditor
                            theme={theme}
                            language={''}
                            value={input}
                            onChange={setInput}
                            height={'48vh'}
                            width={'35vw'}
                            fontSize={fontSize}
                        />
                    </div>
                    <div className="text-center">
                        <h5>Output</h5>
                        <AceEditor
                            theme={theme}
                            language={''}
                            value={output}
                            readOnly={true}
                            height={'48vh'}
                            width={'35vw'}
                            fontSize={fontSize}
                        />
                    </div>
                </div>
            </div>

        </div>
    )
};

export default Ace;
