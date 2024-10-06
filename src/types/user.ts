import { RoomT } from "./room";

type UserT = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  rooms?: RoomT[];
};

export type { UserT };
