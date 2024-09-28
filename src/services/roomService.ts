import axios from "axios";

const fetchRoomDetails = async (roomId: string) => {
  try {
    const response = await axios({
      method: "get",
      url: process.env.REACT_APP_BACKEND_URL + `rooms/fetch?id=${roomId}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user")}`,
      },
    });
    return response.data.room;
  } catch (error) {
    console.error("Error fetching room details:", error);
    throw error;
  }
};

const deleteRoomMutation = async (_id: string) => {
  try {
    const response = await axios({
      method: "delete",
      url: process.env.REACT_APP_BACKEND_URL + `rooms/delete`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user")}`,
      },
      data: {
        id: _id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};

const createRoomMutation = async (roomName: string) => {
  try {
    const response = await axios({
      method: "post",
      url: process.env.REACT_APP_BACKEND_URL + "rooms/create",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user")}`,
      },
      data: {
        name: roomName,
      },
    });
    return response.data.room;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

export { deleteRoomMutation, fetchRoomDetails, createRoomMutation };
