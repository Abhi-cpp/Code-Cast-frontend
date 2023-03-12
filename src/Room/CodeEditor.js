import Editor from '@monaco-editor/react';
import { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { DataContext } from '../Components/DataContext';
import { debounce } from 'lodash';
import Settings from './EditorSettings.js';
import './io.css'
const CodeEditor = (props) => {
    const editorRef = useRef(null)
    const { user, setUser, currRoom, setCurrRoom } = useContext(DataContext)
    const [language, setLanguage] = useState(currRoom ? currRoom.language : "javascript");


    useEffect(() => {
        const buttons = document.querySelectorAll(" #editor button");

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                buttons.forEach((button) => {
                    button.parentElement.classList.toggle("active");
                });
            })
        });
    }, [])

    useEffect(() => {

        if (editorRef.current) {
            const pos = editorRef.current.getPosition();
            editorRef.current.setValue(currRoom.code);
            setLanguage(currRoom.language);
            editorRef.current.updateOptions(user.editor);
            editorRef.current.setPosition(pos);
        }
    }, [currRoom])


    function handleEditorDispose() {
        senddata();
    }

    //default yaha se ayega
    function handleEditorDidMount(editor) {
        editorRef.current = editor
        editorRef.current.setValue(currRoom.code);
        editorRef.current.updateOptions(user.editor)
        setLanguage(currRoom.language);
    }

    function handleChange(val, event) {
        if (event.isFlush === false) {
            currRoom.code = val
            setCurrRoom({ ...currRoom });
            if (currRoom) {
                props.updateRoom(currRoom);
            }
            debounceSendData();
        }
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
                'room': currRoom,
            }
        })
            .then((res) => {
            })
            .catch((err) => {
                console.log("error from axios", err)
            })
    }

    function handleLanguageSelect(event) {
        currRoom.language = event.target.value;
        setCurrRoom({ ...currRoom });
        props.updateRoom(currRoom);
        debounceSendData();
    }

    function handleThemeSelect(event) {
        user.editor.theme = event.target.value;
        setUser({ ...user });
        if (editorRef.current) {
            editorRef.current.updateOptions(user.editor);
        }
    }

    return (
        <div id="editor">
            <Settings
                handleLanguageSelect={handleLanguageSelect}
                handleThemeSelect={handleThemeSelect}
                language={language}
            />
            <Editor
                onMount={handleEditorDidMount}
                loading={<div>Loading...</div>}
                onChange={handleChange}
                onDispose={handleEditorDispose}
                language={language}
            ></Editor>

            <div id="input">
                <button>Input</button>
                <Editor defaultValue=""   ></Editor>
            </div>
            <div id="output">
                <button>Output</button>
                <div id="output-box">
                </div>
            </div>
        </div>
    )
}

export default CodeEditor;