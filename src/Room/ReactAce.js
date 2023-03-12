import React, { useState,useRef } from 'react';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-javascript";

function Ace() {
    const [markers, setMarkers] = useState([]);
    const editorRef = useRef(null);

    const handleValidate = () => {
        const editor = editorRef.current.editor;
        const annotations = editor.getSession().getAnnotations();
        setMarkers(
            annotations.map((annotation) => ({
                startRow: annotation.row,
                startCol: annotation.column,
                endRow: annotation.row,
                endCol: annotation.column + annotation.text.length,
                className: 'error-marker',
                type: 'error'
            }))
        );
    };


    return (
        <div>
            <AceEditor
                mode="javascript"
                theme="monokai"
                width="100%"
                height="400px"
                markers={markers}
                onLoad={(editor) => {
                    editorRef.current = editor;
                    editor.setOptions({
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true
                    });
                    editor.getSession().setUseWorker(true);
                    editor.getSession().on('changeAnnotation', handleValidate);
                }}
            />
        </div>
    );
}

export default Ace;
