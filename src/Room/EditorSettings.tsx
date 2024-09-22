import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  FONTFAMILY_OPTIONS,
  FONTSIZE_OPTIONS,
} from "../utils/settingsOptions.ts";
import { useRef } from "react";

type SettingsProps = {
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  setFontFamily: (fontFamily: string) => void;
  language: string;
  theme: string;
  fontSize: number;
  fontFamily: string;
  roomName: string;
  sendCode: (code: string) => void;
  run: () => void;
  handleLangChange: (lang: string) => void;
  roomid: string;
  running: boolean;
};
const Settings = ({
  setLanguage,
  setTheme,
  setFontSize,
  setFontFamily,
  language,
  theme,
  fontSize,
  fontFamily,
  roomName,
  sendCode,
  run,
  handleLangChange,
  roomid,
  running,
}: SettingsProps) => {
  const optionStyle = useRef({ height: 40, minWidth: 80 });

  return (
    <div className="editor-settings">
      <h3
        className="room-name-id"
        onClick={() => {
          navigator.clipboard.writeText(roomid);
          toast.success("Room ID copied to clipboard");
        }}
      >
        {roomName} - {roomid}
      </h3>
      <div className="settings-options">
        <FormControl>
          <InputLabel id="language-selector-label" className="option-label">
            Language
          </InputLabel>
          <Select
            labelId="language-selector-label"
            id="language-selector"
            value={language}
            label="Language"
            onChange={(e) => handleLangChange(e.target.value)}
            style={optionStyle.current}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="theme-selector-label" className="option-label">
            Theme
          </InputLabel>
          <Select
            labelId="theme-selector-label"
            id="theme-selector"
            value={theme}
            label="Theme"
            onChange={(e) => setTheme(e.target.value)}
            style={optionStyle.current}
          >
            {THEME_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="font-family-selector-label" className="option-label">
            Font Family
          </InputLabel>
          <Select
            labelId="font-family-selector-label"
            id="font-family-selector"
            value={fontFamily}
            label="Font Family"
            onChange={(e) => setFontFamily(e.target.value)}
            style={optionStyle.current}
          >
            {FONTFAMILY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="font-size-selector-label" className="option-label">
            Font Size
          </InputLabel>
          <Select
            labelId="font-size-selector-label"
            id="font-size-selector"
            label="Font Size"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value.toString()))}
            style={optionStyle.current}
          >
            {FONTSIZE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <IconButton
        {...{ disabled: running }}
        style={{ marginLeft: "10px", maxHeight: 40 }}
        onClick={run}
      >
        <PlayArrowIcon />
      </IconButton>
    </div>
  );
};

export default Settings;
