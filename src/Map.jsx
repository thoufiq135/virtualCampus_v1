import React from "react";
import { useState,useEffect } from "react";
import CameraPlayer from "./liveRender";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
const roomStreams = {
  roomA: "http://100.117.158.50:8888/cam1/index.m3u8",
  roomB: "http://100.117.158.50:8888/cam1/index.m3u8",
  roomC: "http://100.117.158.50:8888/cam1/index.m3u8",
  roomD: "http://100.117.158.50:8888/cam1/index.m3u8",
};

const rooms = {
  roomA: { x: "47.5%", y: "42.5%", w: "50%", h: "43%", color: "rgba(255,0,0,0.4)" },
  //  roomB: { x: "41%", y: "72%", w: "36.5%", h: "12.5%", color: "rgba(0,255,0,0.4)" },
    roomB: { x: "50.5%", y: "88%", w: "18.5%", h: "19.5%", color: "rgba(0,255,0,0.4)" },
   
  roomC: { x: "74%", y: "81%", w: "28.5%", h: "31%", color: "rgba(0,0,255,0.4)" },
  roomD: { x: "81%", y: "35%", w: "17%", h: "28%", color: "rgba(255,255,0,0.4)" },

  roomE: { x: "81%", y: "57%", w: "16%", h: "16%", color: "rgba(255,0,255,0.4)" },
  roomF: { x: "32%", y: "88%", w: "18%", h: "17.5%", color: "rgba(0,255,255,0.4)" },
    roomG: { x: "18%", y: "58%", w: "8%", h: "80%", color: "rgba(255,0,255,0.4)" },
  roomH: { x: "52%", y: "11%", w: "75%", h: "16%", color: "rgba(0,255,255,0.4)" },

};

const Map = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
    const [offsets, setOffsets] = useState({});
    const [positions, setPositions] = useState({});
    const [roomOffsets, setRoomOffsets] = useState({});
    const [users, setUsers] = useState({});
    useEffect(() => {
  const interval = setInterval(() => {
    setOffsets(() => {
      const newOffsets = {};

      Object.keys(users).forEach((id) => {
        newOffsets[id] = {
          x: Math.floor(Math.random() * 20 - 10), // -10 to +10 px
          y: Math.floor(Math.random() * 20 - 10)
        };
      });

      return newOffsets;
    });
  }, 1000); // every 10 sec

  return () => clearInterval(interval);
}, [users]);
useEffect(() => {
  const newPositions = {};

  Object.entries(users).forEach(([id, user]) => {
    const room = rooms[user.room];
 
    if (!room) return;

    newPositions[id] = {
      x: room.x,
      y: room.y
    };
  });

  setPositions(newPositions);
}, [users]);
useEffect(() => {
  const updated = {};

  // group users by room
  const roomGroups = {};

  Object.entries(users).forEach(([id, user]) => {
    if (!roomGroups[user.room]) {
      roomGroups[user.room] = [];
    }
    roomGroups[user.room].push(id);
  });

  // assign positions in grid
  Object.entries(roomGroups).forEach(([room, usersInRoom]) => {
    const count = usersInRoom.length;

    const cols = Math.ceil(Math.sqrt(count)); // grid columns
    const spacing = 100; // px spacing

    usersInRoom.forEach((id, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      updated[`${id}_${room}`] = {
        x: (col - (cols - 1) / 2) * spacing,
        y: (row - (cols - 1) / 2) * spacing
      };
    });
  });

  setRoomOffsets(updated);
}, [users]);
useEffect(() => {
  const usersRef = ref(db, "presence");

  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
   
    if (data) {

      setUsers(data);
    }
  });
}, []);
  return (
    <>
{Object.entries(rooms).map(([roomId, room]) => (
  <div
    key={roomId}
    style={{
      position: "absolute",
      left: room.x,
      top: room.y,
      width: room.w,
      height: room.h,
      transform: "translate(-50%, -50%)",
      zIndex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    }}
  >
    <span style={{ fontSize: 12 }}>{roomId}</span>

    <button
      onClick={() => setSelectedRoom(roomId)}
      style={{
        padding: "4px 8px",
        background: "red",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        zIndex: 1000
      }}
    >
      🔴 Live
    </button>
  </div>
))}
{Object.entries(users)
.filter(([id, user]) => user.confidence > 90)
.map(([id, user], index) => {
  const pos = positions[id];
  if (!pos) return null;
const offset = offsets[id] || { x: 0, y: 0 };
const offsetKey = `${id}_${user.room}`;
const roomOffset = roomOffsets[offsetKey] || { x: 0, y: 0 };
  return (
    <div
      key={id}
      style={{
        position: "absolute",
     
left: `calc(${pos.x} + ${roomOffset.x}px + ${offset.x}px)`,
top: `calc(${pos.y} + ${roomOffset.y}px + ${offset.y}px)`,
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        transition: "all 1s ease-in-out",
        zIndex:999
      }}
    >
      <div style={{ fontSize: 25,fontWeight:"bolder" }}>{id}</div>

      <img
        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${id}`}
        style={{ width: 60 }}
      />
    </div>
  );
})}
    <div style={{
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden"
  }}>
      {/* Map Image */}
     <img
  src="/map.png"
  alt="map"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain"
  }}
/>
    </div>
    {selectedRoom && (
  <div
    style={{
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "white",
  padding: 20,
  borderRadius: 10,
  zIndex: 9999,
  boxShadow: "0 0 20px rgba(0,0,0,0.5)",
  width: "70vw",
  maxWidth: "900px"
}}
  >
    <button
      onClick={() => setSelectedRoom(null)}
      style={{
        float: "right",
        background: "red",
        color: "white",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer"
      }}
    >
      ✖
    </button>

    <h3>{selectedRoom} Live Feed</h3>

     
    <CameraPlayer url={roomStreams[selectedRoom]} />
  </div>
)}
    </>
  );
};

export default Map;