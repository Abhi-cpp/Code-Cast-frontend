import React, { useContext, useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PacmanLoader from "react-spinners/PacmanLoader";
import { DataContext } from "./DataContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const override = {
    display: 'block',
    margin: '0 auto',
    borderColor: 'red',
};

const RoomData = () => {
    const { user, setCurrRoom, setUser } = useContext(DataContext);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    function loadingStart() {
        setIsLoading(true);
    }
    function loadingStop() {
        setIsLoading(false);
    }

    useEffect(() => {

        toast.success(`Welcome to CodeCast ${user.name}`, {
            position: toast.POSITION.TOP_RIGHT
        });

    }, [])


    const getData = async (item) => {
        loadingStart();
        await axios.get(`${process.env.REACT_APP_ROOMS_FETCH}?id=${item.roomid}`
            , {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('user')}`
                }
            }).then((response) => {
                setCurrRoom(response.data);
                loadingStop();
                navigate('/room');
            })
            .catch((error) => {
                loadingStop();
                toast.error('Error Fetching Room', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    const createRoom = async () => {
        let roomName = document.getElementById('roomName').value;
        loadingStart();
        axios({
            method: 'post',
            url: process.env.REACT_APP_BACKEND_URL + 'rooms/create',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`
            },
            data: {
                name: roomName
            }

        })
            .then((response) => {
                setCurrRoom(response.data);
                loadingStop();
                navigate('/room');
            })
            .catch((error) => {
                loadingStop();
                toast.error('Error Creating Room', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    const joinRoom = async () => {
        let roomID = document.getElementById('roomID').value;
        loadingStart();
        axios({
            method: 'get',
            url: process.env.REACT_APP_BACKEND_URL + `rooms/fetch?id=${roomID}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`

            }
        })
            .then((response) => {
                setCurrRoom(response.data);
                loadingStop();
                navigate('/room');
            })
            .catch((error) => {
                loadingStop();
                toast.error('Room not found', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const deleteData = (item) => async () => {
        loadingStart();
        axios({
            method: 'delete',
            url: process.env.REACT_APP_BACKEND_URL + `rooms/delete`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`
            },
            data: {
                id: item._id
            }
        })
            .then((response) => {
                user.rooms = user.rooms.filter((item) => item._id !== response.data._id);
                loadingStop();
                toast.success('Room Deleted', {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
            .catch((error) => {
                loadingStop();
                toast.error('Error Deleting Room', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    return (
        <div> {isLoading === true ? (<PacmanLoader color="#36D7B7"
            size={150}
            cssOverride={override}
        />) :
            (<div className="room-data">
                <button onClick={logout} className="logOut">Logout</button>
                <div className="userData">
                    <img src={user.avatar} alt='user profile' />
                    <h1>Welcome {user.name}</h1>
                </div>
                <div className="join-room">
                    <input id="roomName" placeholder="Enter Room Name" />
                    <button onClick={createRoom} >Create Room</button>
                    <input id="roomID" placeholder="Enter Room ID to join" />
                    <button onClick={joinRoom} >Join Room</button>
                </div>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Room ID</TableCell>
                                <TableCell align="right">Language</TableCell>
                                <TableCell align="right">Last Used</TableCell>
                                <TableCell align="right">Join Room</TableCell>
                                <TableCell align="right">Delete Room</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {user.rooms.map((item, index) => (
                                <TableRow
                                    key={index}
                                >
                                    <TableCell component="th" scope="row">{item.name}</TableCell>
                                    <TableCell align="right">{item.roomid}</TableCell>
                                    <TableCell align="right">{item.language}</TableCell>
                                    <TableCell align="right">{item.updatedAt}</TableCell>
                                    <TableCell align="right">
                                        <Button size="20px" variant="outlined" onClick={() => getData(item)}>Join Room</Button>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button variant="outlined" onClick={deleteData(item)}>Delete Room</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <ToastContainer />
            </div>
            )}
        </div>
    )
}


export default RoomData;