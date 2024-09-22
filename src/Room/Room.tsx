import { useContext, useEffect, useState, useRef } from "react";
import { DataContext } from "../Components/DataContext.tsx";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CodeEditor from "./CodeEditor.tsx";
import VideoChat from "./VideoChat.tsx";
import WhiteBoard from "./WhiteBoard.tsx";
import "../Styles/room.css";
import { reArrangeVideos } from "./VideoChat.tsx";

type UserT = {
  id: string;
  name: string;
  avatar: string;
};

const Room = () => {
  const { user, currRoom, socket } = useContext(DataContext);
  const navigate = useNavigate();
  const roomid = currRoom ? currRoom.roomid : "";
  const [inRoomUsers, setInRoomUsers] = useState<Array<UserT>>([]);
  const [userUpdated, setUserUpdated] = useState<UserT | null>(null);
  const requestId = useRef(null);
  const userAdded = useRef(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);

  console.log("inroomUsers", inRoomUsers);
  useEffect(() => {
    if (user === null || currRoom === null) {
      navigate("/");
    }
    socket.on("connect", () => {
      console.log("connected");
      console.log(socket.id);
    });
    socket.on("join permission", ({ user, senderID }) => {
      const permissionBlock = document.querySelector(".room .permission-block");
      permissionBlock?.classList.add("active");
      if (permissionBlock) {
        permissionBlock.children[0].children[1].innerHTML = `<span>${user.name}</span>  wants to join the room`;
        (permissionBlock.children[0].children[0] as HTMLImageElement).src =
          user.avatar;
      }
      requestId.current = senderID;
    });
    window.addEventListener("scroll", stopScroll);

    function stopScroll(e) {
      e.preventDefault();
    }

    return () => {
      socket.off();
      window.removeEventListener("scroll", stopScroll);
    };
  }, []);

  useEffect(() => {
    const resizeBtn = document.querySelector("#resize-editor");
    resizeBtn?.addEventListener("mousedown", (e: MouseEvent) => {
      const startX = e.clientX;
      const initialWidth = (document.querySelector("#editor") as HTMLElement)
        ?.offsetWidth;
      document.body.addEventListener("mousemove", changeWidth);

      document.body.addEventListener("mouseup", () => {
        document.body.removeEventListener("mousemove", changeWidth);
      });

      document.body.addEventListener("mouseleave", () => {
        document.body.removeEventListener("mousemove", changeWidth);
      });

      function changeWidth(e) {
        const videoChat = document.querySelector(".video-chat");
        const editor = document.querySelector("#editor");
        const finalX = e.clientX;
        let editorWidth = initialWidth + finalX - startX;
        let videoWidth = window.innerWidth - editorWidth - 50 - 10;
        if (videoWidth < 200) {
          videoWidth = 0;
          editorWidth = window.innerWidth - 50 - 10;
          setVideoCollapsed(true);
          setEditorCollapsed(false);
        } else if (editorWidth < 200) {
          editorWidth = 0;
          videoWidth = window.innerWidth - 50 - 10;
          setEditorCollapsed(true);
          setVideoCollapsed(false);
        } else {
          setVideoCollapsed(false);
          setEditorCollapsed(false);
        }
        if (editor && editor instanceof HTMLElement)
          editor.style.width = editorWidth + "px";
        if (videoChat && videoChat instanceof HTMLElement)
          videoChat.style.width = videoWidth + "px";
        reArrangeVideos();
      }
    });
  }, [currRoom]);

  useEffect(() => {
    if (socket.connected) {
      socket.on("userJoin", ({ msg, newUser }) => {
        setUserUpdated(newUser);
        userAdded.current = true;
        toast.success(msg, {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
      socket.on("userLeft", ({ msg, userLeft }) => {
        setUserUpdated(userLeft);
        userAdded.current = false;
        toast.error(msg, {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
      socket.on("error", ({ error }) => {
        console.log("error from socket call", error);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (!userUpdated) return;
    if (userAdded.current) {
      console.log("user added");
      setInRoomUsers([...inRoomUsers, userUpdated]);
    } else {
      console.log("user removed");
      console.log(userUpdated, inRoomUsers);
      setInRoomUsers(inRoomUsers.filter((user) => user.id !== userUpdated.id));
    }
  }, [userUpdated]);

  const updateRoomUsers = (users) => {
    setInRoomUsers([...users]);
  };

  async function leaveRoom() {
    socket.emit("leave", { roomid });
    socket.off();
    navigate("/");
    window.location.reload();
  }

  function acceptPermission() {
    const permissionBlock = document.querySelector(".room .permission-block");
    permissionBlock?.classList.remove("active");
    socket.emit("accept permission", { senderID: requestId.current });
  }

  function rejectPermission() {
    const permissionBlock = document.querySelector(".room .permission-block");
    permissionBlock?.classList.remove("active");
    socket.emit("reject permission", { senderID: requestId.current });
  }

  if (currRoom && user) {
    return (
      <div className="room">
        <div className="users-joined">
          <button id="leave-room" className="active" onClick={leaveRoom}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
          {inRoomUsers.map((user) => (
            <div className="user-joined" key={user.id}>
              <img src={user.avatar} alt="" />
              <div className="name">{user.name}</div>
            </div>
          ))}
        </div>
        <div className="core-components">
          <div className="code-editor-video-chat-parent">
            <CodeEditor
              updateRoomUsers={updateRoomUsers}
              editorCollapsed={editorCollapsed}
            />
            <div id="resize-editor">
              <div id="lines-resize"></div>
            </div>
            <VideoChat videoCollapsed={videoCollapsed} />
          </div>
          <WhiteBoard />
        </div>
        <div className="permission-block">
          <div className="user-info">
            <img src="" alt="" />
            <div className="user-name"></div>
          </div>
          <div className="buttons">
            <button className="accept" onClick={acceptPermission}>
              Accept
            </button>
            <button className="reject" onClick={rejectPermission}>
              Reject
            </button>
          </div>
        </div>
        <ToastContainer autoClose={2000} />
      </div>
    );
  } else return null;
};
export default Room;
