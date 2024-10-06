import Peer from "simple-peer";
import { RoomT } from "./room";

type VideoChatT = {
  videoCollapsed: boolean;
  currRoom: RoomT | null;
};

type PeerType = {
  peer: Peer.Instance;
  userId: string;
  name: string;
  avatar: string;
  videoIsActive: boolean;
  audioIsActive: boolean;
};

type VideoPropsType = {
  peer: Peer.Instance;
};

export type { VideoChatT, PeerType, VideoPropsType };
