import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "./DataContext.tsx";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader.tsx";
import { generateFromString } from "generate-avatar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  createRoomMutation,
  deleteRoomMutation,
} from "../services/roomService.ts";

const RoomData = () => {
  const { user, setUser } = useContext(DataContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  function loadingStart() {
    setIsLoading(true);
  }
  function loadingStop() {
    setIsLoading(false);
  }

  useEffect(() => {
    toast.success(`Welcome to CodeCast ${user?.name}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  }, []);

  const createRoom = async () => {
    const roomName = (document.getElementById("roomName") as HTMLInputElement)
      ?.value;
    loadingStart();
    try {
      const room = await createRoomMutation(roomName);
      navigate("/room/" + room.roomid);
    } catch (error) {
      loadingStop();
      toast.error("Error Creating Room", {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }
  };

  const joinRoom = async (roomId) => {
    navigate("/room/" + roomId);
  };

  const deleteRoom = (item) => async () => {
    loadingStart();
    try {
      const deletedItem = await deleteRoomMutation(item._id);
      if (user)
        user.rooms = user?.rooms?.filter(
          (item) => item._id !== deletedItem._id,
        );
      loadingStop();
      toast.success("Room Deleted", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      loadingStop();
      toast.error("Error Deleting Room", {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const copyRoomId = (e) => {
    const id = e.target.parentElement.innerText;
    navigator.clipboard.writeText(id);
    toast.success("Room ID Copied ", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  useEffect(() => {
    if (user && !user?.rooms?.every((room) => !room.updatedAt.includes("T"))) {
      user?.rooms?.forEach((item) => {
        const temp = item.updatedAt.replace("T", " ").split(":");
        temp.pop();
        item.updatedAt = temp.join(":");
      });
      user?.rooms?.sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      setUser({ ...user });
    }

    if (user) {
      document.querySelectorAll(".join-room input").forEach((input) => {
        input.addEventListener("keydown", (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            const button = (e.target as HTMLElement)
              ?.nextElementSibling as HTMLButtonElement;
            button.click();
          }
        });
      });
    }
  }, [user]);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="room-data">
      <button onClick={logout} className="logOut">
        Logout
      </button>
      <div className="userData">
        {user?.avatar ? (
          <img src={user?.avatar} height={100} alt="user profile" />
        ) : (
          <img
            height={100}
            src={`data:image/svg+xml;utf8,${generateFromString(user?.email + "" + user?.name)}`}
            alt="user profile"
          />
        )}
        <h1>Welcome {user?.name}</h1>
      </div>
      <div className="join-room">
        <input id="roomName" placeholder="Enter Room Name" />
        <button onClick={createRoom}>Create Room</button>
        <input id="room-id" placeholder="Enter Room ID to join" />
        <button
          onClick={() => {
            const roomId = (
              document.getElementById("room-id") as HTMLInputElement
            )?.value;
            joinRoom(roomId);
          }}
        >
          Join Room
        </button>
      </div>
      <table aria-label="simple table">
        <thead>
          <tr>
            <th>Name</th>
            <th align="right">Room ID</th>
            <th align="right">Language</th>
            <th align="right">Last Used</th>
            <th align="right">Join Room</th>
            <th align="right">Delete Room</th>
          </tr>
        </thead>
        <tbody>
          {user?.rooms?.map((item, index) => (
            <tr key={index}>
              <td scope="row">{item.name}</td>
              <td align="right">
                {item.roomid}
                <ContentCopyIcon
                  onClick={copyRoomId}
                  style={{ cursor: "pointer", marginLeft: "10px" }}
                  fontSize="small"
                />
              </td>
              <td align="right">
                {item.language.slice(0, 1).toUpperCase() +
                  item.language.slice(1)}
              </td>
              <td align="right">{item.updatedAt}</td>
              <td align="right">
                <button
                  className="join-btn"
                  onClick={() => {
                    joinRoom(item.roomid);
                  }}
                >
                  Join Room
                </button>
              </td>
              <td align="right">
                <button className="delete-btn" onClick={deleteRoom(item)}>
                  Delete Room
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomData;
