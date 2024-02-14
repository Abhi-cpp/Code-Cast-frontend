import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
    AppBar, Toolbar, IconButton, Typography,
    FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import getColor from './themeColors';
import { useState } from 'react';

const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'c_cpp', label: 'C/C++' },
    { value: 'golang', label: 'Go' },
    { value: 'csharp', label: 'C#' },
    { value: 'rust', label: 'Rust' }
];

const themeOptions = [
    { value: 'github', label: 'Github', },
    { value: 'cobalt', label: 'Cobalt' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'xcode', label: 'Xcode' },
    { value: 'terminal', label: 'Terminal' },
    { value: 'tomorrow_night', label: 'Tomorrow Night' },
    { value: 'solarized_dark', label: 'Solarized Dark' },
    { value: 'vibrant_ink', label: 'Vibrant Ink' },
    { value: 'one_dark', label: 'One Dark' }
];

const fontFamilyOptions = [
    { value: 'monospace', label: 'Monospace' },
    { value: 'Ubuntu Mono', label: 'Ubuntu Mono' },
    { value: 'Fira Code', label: 'Fira Code' },
    { value: 'Roboto Mono', label: 'Roboto Mono' },
    { value: 'Cascadia Code', label: 'Cascadia Code' },
    { value: 'Consolas', label: 'Consolas' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Lucida Console', label: 'Lucida Console' },
    { value: 'Lucida Sans Typewriter', label: 'Lucida Sans Typewriter' },
    { value: 'Lucida Typewriter', label: 'Lucida Typewriter' },
];

const fontSizeOptions = [14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];


const Settings = ({
    setTheme,
    setFontSize,
    setFontFamily,
    language,
    theme,
    fontSize,
    fontFamily,
    roomName,
    run,
    handleLangChange,
    roomid,
    running

}) => {

    // I need to choose a color everytime the theme changes
    // should I use usestate or useRef

    const { backColor, fontColor } = getColor(theme);
    return (
        <div className="editor-settings" style={{ backgroundColor: backColor, color: fontColor }}>
            <div>
                <h3>{roomName} - {roomid}</h3>
                <Select
                    labelId="language-selector-label"
                    id="language-selector"
                    value={language}
                    onChange={(e) => handleLangChange(e.target.value)}
                    style={{ color: fontColor }}
                >
                    {languageOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value} >
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    labelId="theme-selector-label"
                    id="theme-selector"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    style={{ color: fontColor }}
                >
                    {themeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    labelId="font-family-selector-label"
                    id="font-family-selector"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{ color: fontColor }}
                >
                    {fontFamilyOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    labelId="font-size-selector-label"
                    id="font-size-selector"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    style={{ color: fontColor }}
                >
                    {fontSizeOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
                <IconButton
                    {...{ disabled: running }}
                    style={{ marginL: '10px', maxHeight: 40, color: fontColor }} onClick={run}>
                    <PlayArrowIcon />
                </IconButton>
            </div>
        </div >
    )

}

export default Settings;