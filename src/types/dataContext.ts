import { UserT } from "./user";

type DataContextProviderProps = {
  children: React.ReactNode;
};

type DataContextType = {
  user: UserT | null;
  currRoom: any;
  setUser: (user: UserT | null) => void;
  setCurrRoom: (room: any) => void;
  socket: any;
};

export type { DataContextType, DataContextProviderProps };
