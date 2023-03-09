import Editor from '@monaco-editor/react';
import { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { DataContext } from '../Components/DataContext';
import { debounce } from 'lodash';

const CodeEditor = (props) => {
    const editorRef = useRef(null)
    const { user, setUser, currRoom, setCurrRoom } = useContext(DataContext)




    // use effect (ek baar chalega)
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
            editorRef.current.updateOptions({ language: currRoom.language });
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
        editorRef.current.updateOptions({ language: currRoom.language });

        editorRef.current.onDidChangeModelContent((event) => {
            // console.log("editorRef.current.getValue()", editorRef.current.getValue())
            if (!event.isFlush) {
                currRoom.code = editorRef.current.getValue();
                setCurrRoom({ ...currRoom });
                if (currRoom) {
                    props.updateRoom(currRoom);
                }
                debounceSendData();
            }
        });
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
                console.log("response from axios", res)
            })
            .catch((err) => {
                console.log("error from axios", err)
            })
    }


    return (
        <div
            id="editor"
        >
            <Editor
                onMount={handleEditorDidMount}
                loading={<div>Loading...</div>}
                onDispose={handleEditorDispose}
                defaultLanguage={"javascript"}
            ></Editor>
            <div id="input">
                <button>Input</button>
                <Editor defaultLanguage={"javascript"} theme={user.editor.theme} fontSize={user.editor.fontSize} fontFamily={user.editor.fontFamily} ></Editor>
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