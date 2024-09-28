import { useContext, useEffect, useState, useRef } from "react";
import { DataContext } from "../Components/DataContext.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CodeEditor from "./CodeEditor.tsx";
import VideoChat from "./VideoChat.tsx";
import WhiteBoard from "./WhiteBoard.tsx";
import "../Styles/room.css";
import { reArrangeVideos } from "./VideoChat.tsx";
import { loginWithToken } from "../services/authService.ts";
import { useRoom } from "../hooks/useRoom.ts";
import Loader from "../Components/Loader.tsx";

type UserT = {
  id: string;
  name: string;
  avatar: string;
};

const Room = () => {
  const { user, socket, setUser } = useContext(DataContext);
  const { roomId } = useParams();
  const { currRoom, error } = useRoom(roomId || "");
  const navigate = useNavigate();
  const [inRoomUsers, setInRoomUsers] = useState<Array<UserT>>([]);
  const [userUpdated, setUserUpdated] = useState<UserT | null>(null);
  const requestId = useRef(null);
  const userAdded = useRef(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      const token = localStorage.getItem("user");
      if (token) {
        loginWithToken(token).then((response) => {
          if (response.status === "success") {
            setUser(response.data);
          } else {
            setUser(null);
            navigate("/");
          }
        });
      } else {
        navigate("/");
      }
    }
    socket.on("connect", () => {
      console.log("connected");
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
    if (currRoom && user && !roomJoined && !requestSent) {
      if (currRoom.owner === user._id) {
        setRequestSent(true);
        setRoomJoined(true);
      } else {
        socket.emit("join permission", { room: currRoom, user });
        setRequestSent(true);
        socket.on("permission accepted", () => {
          setRoomJoined(true);
        });
        socket.on("permission rejected", () => {
          toast.error("Permission Rejected", {
            position: toast.POSITION.TOP_RIGHT,
          });
          navigate("/");
        });
      }
    }
  }, [currRoom, user]);

  useEffect(() => {
    if (roomJoined) {
      setIsLoading(false);
    }
  }, [roomJoined]);

  useEffect(() => {
    if (!isLoading) {
      const resizeBtn = document.querySelector("#resize-editor");
      console.log(resizeBtn);
      resizeBtn?.addEventListener("mousedown", (e: MouseEvent) => {
        console.log("mouse down");
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
    }
  }, [isLoading]);

  useEffect(() => {
    if (!userUpdated) return;
    if (userAdded.current) {
      setInRoomUsers([...inRoomUsers, userUpdated]);
    } else {
      setInRoomUsers(inRoomUsers.filter((user) => user.id !== userUpdated.id));
    }
  }, [userUpdated]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
      navigate("/");
    }
  }, [error]);

  const updateRoomUsers = (users) => {
    setInRoomUsers([...users]);
  };

  async function leaveRoom() {
    socket.emit("leave", { roomId });
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

  if (isLoading) return <Loader />;
  else
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
              currRoom={currRoom}
            />
            <div id="resize-editor">
              <div id="lines-resize"></div>
            </div>
            <VideoChat videoCollapsed={videoCollapsed} currRoom={currRoom} />
          </div>
          <WhiteBoard currRoom={currRoom} />
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
};
export default Room;
