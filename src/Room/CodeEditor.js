// import Editor from '@monaco-editor/react';
// import { useEffect, useState, useRef, useContext } from 'react';
// import axios from 'axios';
// import { io } from 'socket.io-client';


// const CodeEditor = () => {
//     const editorRef = useRef(null)
//     const docRef = useRef(null)
//     const socketRef = useRef(null)



//     // use effect (ek baar chalega)
//     useEffect(() => {
//         socketRef.current = io("localhost:3001");
//         socketRef.current.on("connect", () => {
//             console.log("connected");
//         });

//         const timer = setInterval(() => {
//             senddata();
//         }, 2000)

//         const buttons = document.querySelectorAll(" #editor button");

//         buttons.forEach((button) => {
//             button.addEventListener("click", () => {
//                 buttons.forEach((button) => {
//                     button.parentElement.classList.toggle("active");
//                 });
//             })
//         });

//         return () => {
//             console.log("disconnected");
//             socketRef.current.disconnect();
//             clearInterval(timer)
//         };

//     }, [])


//     function handleEditorDispose() {
//         docRef.current.removeEventListener("keyup", () => {
//             // iss point pe save kardo code data for last time
//         })
//     }

//     //default yaha se ayega
//     function handleEditorDidMount(editor) {
//         socketRef.current.on('code-update', (data) => {
//             editorRef.current.setValue(data)
//         });

//         editorRef.current = editor
//         docRef.current = document.getElementById("editor")
//         docRef.current.addEventListener("keyup", () => {
//             socketRef.current.emit('code-update', editorRef.current.getValue())
//         })

//     }

//     function senddata() {
//         axios
//             .post("https://code-editor-backend-o1fg.onrender.com/code", {
//                 body: {
//                     "code": editorRef.current.getValue(),
//                 }
//             })
//             .then((res) => {
//                 console.log("response from axios", res)
//             })
//             .catch((err) => {
//                 console.log("error from axios", err)
//             })
//     }


//     return (
//         <div
//             id="editor"
//         >
//             <Editor
//                 onMount={handleEditorDidMount}
//                 defaultLanguage={"javascript"}
//                 defaultValue="// type your code..."
//                 theme={"vs-dark"}
//                 loading={<div>Loading...</div>}
//                 onDispose={handleEditorDispose}
//             ></Editor>
//             <div id="input">
//                 <button>Input</button>
//                 <Editor defaultLanguage={"javascript"} defaultValue="//Type Input for checking" theme={"vs-dark"} ></Editor>
//             </div>
//             <div id="output">
//                 <button>Output</button>
//                 <div id="output-box">
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default CodeEditor;