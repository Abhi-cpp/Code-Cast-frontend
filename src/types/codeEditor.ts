import { RoomT } from "./room";

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
  roomId: string;
  running: boolean;
};

type CodeEditorProps = {
  updateRoomUsers: (users: any) => void;
  editorCollapsed: boolean;
  currRoom: RoomT | null;
};

export type { SettingsProps, CodeEditorProps };
