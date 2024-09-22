import React, { createContext, useState, useMemo, useEffect } from "react";
import { io } from "socket.io-client";

type userT = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  rooms?: roomT[];
};

type roomT = {
  _id: string;
  name: string;
  roomid: string;
  language: string;
  updatedAt: string;
};

type DataContextProviderProps = {
  children: React.ReactNode;
};

type DataContextType = {
  user: userT | null;
  currRoom: any;
  setUser: (user: userT | null) => void;
  setCurrRoom: (room: any) => void;
  socket: any;
};

const defaultContextValue: DataContextType = {
  user: null,
  currRoom: null,
  setUser: () => {},
  setCurrRoom: () => {},
  socket: null,
};

export const DataContext = createContext<DataContextType>(defaultContextValue);

const DataContextProvider = ({ children }: DataContextProviderProps) => {
  const [user, setUser] = useState<userT | null>(null);
  const [currRoom, setCurrRoom] = useState(null);
  const socket = useMemo(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("REACT_APP_BACKEND_URL is not defined");
    }
    return io(backendUrl);
  }, []);

  socket.on("connect", () => {
    console.log("Connected to socket server", socket.id);
  });

  useEffect(() => {
    if (user) {
      socket.emit("map socket", { userID: user._id });
    }
  }, [user]);

  return (
    <DataContext.Provider
      value={{ user, currRoom, setUser, setCurrRoom, socket }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContextProvider;
