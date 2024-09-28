// hooks/useRoom.ts
import { useState, useEffect } from "react";
import { fetchRoomDetails } from "../services/roomService";
import { RoomT } from "../types/room";
export const useRoom = (roomId: string) => {
  const [currRoom, setCurrRoom] = useState<RoomT | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getRoomDetails = async () => {
    try {
      const roomDetails = await fetchRoomDetails(roomId);
      setCurrRoom(roomDetails);
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    getRoomDetails();
  }, [roomId]);

  return { currRoom, error };
};
