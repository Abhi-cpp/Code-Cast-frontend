import Editor from '@monaco-editor/react';
import { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { DataContext } from '../Components/DataContext';
import { debounce } from 'lodash';
import Settings from './EditorSettings.js';
import './io.css'
const CodeEditor = (props) => {

    const { code, language, setLanguage, roomName,roomid } = props;
    const { user} = useContext(DataContext);
    const [theme, setTheme] = useState(user.editor.theme);
    const editorRef = useRef(null);


    useEffect(() => {
        if (editorRef.current) {
            const pos = editorRef.current.getPosition();
            editorRef.current.setValue(code);
            editorRef.current.setPosition(pos);
        }
    }, [code])

    function handleEditorDispose() {
        senddata();
    }

    //default yaha se ayega
    function handleEditorDidMount(editor) {
        editorRef.current = editor;
        editorRef.current.updateOptions(user.editor);
    }



    // debounce function for sending data
    const debounceSendData = debounce(() => {
        senddata();
    }, 2000)
    function senddata() {
        axios({
            method: 'patch',
            url: process.env.REACT_APP_BACKEND_URL + 'rooms/update',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            },
            data: {
                'room': {
                    'roomid': roomid,
                    'code': code,
                    'language': language
                },
            }
        })
            .then((res) => {
            })
            .catch((err) => {
                console.log("error from axios", err)
            })
    }

    function handleLanguageSelect(event) {
        setLanguage(event.target.value)
        props.updateRoom();
    }

    function handleThemeSelect(event) {
        setTheme(event.target.value);
    }

    function handleChange(val, event) {
        if (event.isFlush === false) {
            props.updateRoom(val);
            debounceSendData();
        }
    }


    return (
        <div id="editor">
            <Settings
                handleLanguageSelect={handleLanguageSelect}
                handleThemeSelect={handleThemeSelect}
                language={language}
                theme={theme}
                roomName={roomName}
            />
            <Editor
                loading={<div>Loading...</div>}
                onMount={handleEditorDidMount}
                onChange={handleChange}
                onDispose={handleEditorDispose}
                language={language}
                theme={theme}
                value="console.log('Hello World!');"
            ></Editor>
        </div>
    )
}

export default CodeEditor;