import React, { createContext, useState, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import { UserT } from "../types/user";
import {
  DataContextProviderProps,
  DataContextType,
} from "../types/dataContext";

const defaultContextValue: DataContextType = {
  user: null,
  currRoom: null,
  setUser: () => {},
  setCurrRoom: () => {},
  socket: null,
};

export const DataContext = createContext<DataContextType>(defaultContextValue);

const DataContextProvider = ({ children }: DataContextProviderProps) => {
  const [user, setUser] = useState<UserT | null>(null);
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
