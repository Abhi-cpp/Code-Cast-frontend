import React, { useState, useContext, useEffect } from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
    AppBar, Toolbar, IconButton, Typography,
    FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { DataContext } from "../Components/DataContext";

const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'Cpp' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
    { value: 'csharp', label: 'C#' },
];

const themeOptions = [
    { value: 'vs', label: 'Visual Studio' },
    { value: 'vs-dark', label: 'Visual Studio Dark' },
    { value: 'hc-black', label: 'High Contrast' },
    // { value: 'monokai', label: 'Monokai' },
];


const Settings = (props) => {

    const { currRoom, user } = useContext(DataContext)
    const [selectedTheme, setSelectedTheme] = useState(user.editor.theme);

    const { handleLanguageSelect, handleThemeSelect, language } = props;

    const theme = (event) => {
        setSelectedTheme(event.target.value);
        handleThemeSelect(event);
    };

    const onRunClick = () => {
        console.log("Run Clicked");
    }

    return (
        <div className="editor-settings">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        {currRoom.roomName}
                    </Typography>
                    <FormControl style={{ minWidth: 120, marginRight: "16px" }}>
                        <InputLabel id="language-selector-label">Language</InputLabel>
                        <Select
                            labelId="language-selector-label"
                            id="language-selector"
                            value={language}
                            onChange={handleLanguageSelect}
                        >
                            {languageOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl style={{ minWidth: 120 }}>
                        <InputLabel id="theme-selector-label">Theme</InputLabel>
                        <Select
                            labelId="theme-selector-label"
                            id="theme-selector"
                            value={selectedTheme}
                            onChange={theme}
                        >
                            {themeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <IconButton color="inherit" onClick={onRunClick}>
                        <PlayArrowIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

        </div>
    )

}

export default Settings;