import React from "react";
import { useState, useEffect } from "react";
import CameraPlayer from "./liveRender";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

const roomStreams = {
  roomA: "https://overstudiously-burglarproof-sid.ngrok-free.dev/api/cam1/index.m3u8",
  roomB: "https://overstudiously-burglarproof-sid.ngrok-free.dev/api/cam2/index.m3u8",
  roomC: "https://overstudiously-burglarproof-sid.ngrok-free.dev/api/cam3/index.m3u8",
  roomD: "https://overstudiously-burglarproof-sid.ngrok-free.dev/api/cam4/index.m3u8",
  roomG: "https://overstudiously-burglarproof-sid.ngrok-free.dev/api/cam5/index.m3u8",
  roomH: "https://overstudiously-burglarproof-sid.ngrok-free.dev/api/cam6/index.m3u8",
};

const rooms = {
  roomA: { 
    x: "31.5%", 
    y: "24.5%", 
    w: "50%", 
    h: "43%", 
    color: "rgba(255,0,0,0.4)",
    // Electrical panel position relative to room
    panelX: "45%", 
    panelY: "60%"
  },
  roomB: { 
    x: "50.5%", 
    y: "88%", 
    w: "18.5%", 
    h: "19.5%", 
    color: "rgba(0,255,0,0.4)",
    panelX: "40%",
    panelY: "62.5%"
  },
  roomC: { 
    x: "74%", 
    y: "81%", 
    w: "28.5%", 
    h: "31%", 
    color: "rgba(0,0,255,0.4)",
    panelX: "40%",
    panelY: "60%"
  },
  roomD: { 
    x: "75%", 
    y: "28%", 
    w: "17%", 
    h: "28%", 
    color: "rgba(255,255,0,0.4)",
    panelX: "30%",
    panelY: "60%"
  },
  roomG: { 
    x: "22%", 
    y: "58%", 
    w: "8%", 
    h: "80%", 
    color: "rgba(255,0,255,0.4)",
    panelX: "30%",
    panelY: "55%"
  },
  roomH: { 
    x: "52%", 
    y: "10%", 
    w: "75%", 
    h: "16%", 
    color: "rgba(0,255,255,0.4)",
    panelX: "45%",
    panelY: "70%"
  },
};

const Map = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [openElectricalPanel, setOpenElectricalPanel] = useState(null);
  const [offsets, setOffsets] = useState({});
  const [positions, setPositions] = useState({});
  const [roomOffsets, setRoomOffsets] = useState({});
  const [users, setUsers] = useState({});
  const [electricals, setElectricals] = useState(() =>
    Object.keys(rooms).reduce((acc, roomId) => {
      acc[roomId] = {
        lights: 2,
        fans: 1,
        lightsOn: true,
        fansOn: true,
      };
      return acc;
    }, {})
  );

  const updateElectrical = (roomId, field, value) => {
    setElectricals((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setOffsets(() => {
        const newOffsets = {};
        Object.keys(users).forEach((id) => {
          newOffsets[id] = {
            x: Math.floor(Math.random() * 20 - 10),
            y: Math.floor(Math.random() * 20 - 10)
          };
        });
        return newOffsets;
      });
    }, 1000);
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
    const roomGroups = {};
    Object.entries(users).forEach(([id, user]) => {
      if (!roomGroups[user.room]) {
        roomGroups[user.room] = [];
      }
      roomGroups[user.room].push(id);
    });

    Object.entries(roomGroups).forEach(([room, usersInRoom]) => {
      const count = usersInRoom.length;
      const cols = Math.ceil(Math.sqrt(count));
      const spacing = 100;

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

      {/* Render Rooms with Live Buttons and Electrical Panels */}
      {Object.entries(rooms).map(([roomId, room]) => {
        const roomState = electricals[roomId];
        const isPanelOpen = openElectricalPanel === roomId;

        return (
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
            <span style={{ fontSize: 12, color: "#fff", textShadow: "0 0 5px rgba(0,0,0,0.8)" }}>
              {roomId}
            </span>

            {/* Live Button */}
            <button
              onClick={() => setSelectedRoom(roomId)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                borderRadius: "70px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: room.color,
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
                marginLeft: "20px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                transition: "0.3s ease",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 0 12px #fff",
                  animation: "pulse 1s infinite",
                }}
              />
              Live {roomId}
            </button>

            {/* Electrical Panel - Positioned individually */}
            <div 
              style={{ 
                position: "absolute", 
                top: room.panelY || "10%", 
                right: room.panelX || "10%", 
                zIndex: 2 
              }}
            >
              <button
  onClick={() =>
    setOpenElectricalPanel((prev) => (prev === roomId ? null : roomId))
  }
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "50px",
    border: "1px solid rgba(100, 200, 255, 0.3)",
    background: isPanelOpen 
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      : "rgba(255, 255, 255, 0.95)",
    color: isPanelOpen ? "#fff" : "#111",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    boxShadow: isPanelOpen 
      ? "0 8px 32px rgba(102, 126, 234, 0.4)" 
      : "0 4px 12px rgba(0,0,0,0.15)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
    e.currentTarget.style.boxShadow = isPanelOpen 
      ? "0 12px 40px rgba(102, 126, 234, 0.5)" 
      : "0 8px 24px rgba(0,0,0,0.2)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    e.currentTarget.style.boxShadow = isPanelOpen 
      ? "0 8px 32px rgba(102, 126, 234, 0.4)" 
      : "0 4px 12px rgba(0,0,0,0.15)";
  }}
>
  <span style={{ 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: isPanelOpen 
      ? "rgba(255,255,255,0.2)" 
      : "rgba(102, 126, 234, 0.15)",
    transition: "all 0.3s ease",
  }}>
    <span style={{ fontSize: "14px" }}>🔌</span>
  </span>
  {/* <span>Electrics</span> */}
  <span style={{
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: isPanelOpen ? "#22c55e" : "#ef4444",
    boxShadow: isPanelOpen ? "0 0 12px #22c55e" : "none",
    transition: "all 0.3s ease",
    animation: isPanelOpen ? "pulse 1.5s infinite" : "none",
  }} />
</button>

              {isPanelOpen && (
                <div
                  style={{
                    marginTop: "8px",
                    width: "200px",
                    padding: "12px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.95)",
                    color: "#111",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    backdropFilter: "blur(8px)",
                    fontSize: 12,
                    textAlign: "left",
                    border: "1px solid rgba(0,0,0,0.08)",
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    zIndex: 10,
                  }}
                >
                  <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>
                    ⚡ {roomId} Electricals
                  </div>

                  <label style={{ display: "block", marginBottom: "8px" }}>
                    Lights: {roomState.lights}
                    <select
                      value={roomState.lights}
                      onChange={(e) =>
                        updateElectrical(roomId, "lights", Number(e.target.value))
                      }
                      style={{
                        width: "100%",
                        marginTop: "4px",
                        padding: "6px 8px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        background: "#fff",
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "block", marginBottom: "10px" }}>
                    Fans: {roomState.fans}
                    <select
                      value={roomState.fans}
                      onChange={(e) =>
                        updateElectrical(roomId, "fans", Number(e.target.value))
                      }
                      style={{
                        width: "100%",
                        marginTop: "4px",
                        padding: "6px 8px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        background: "#fff",
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div style={{ display: "grid", gap: "8px" }}>
                    <label
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 0",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>💡 Lights</span>
                      <input
                        type="checkbox"
                        checked={roomState.lightsOn}
                        onChange={(e) =>
                          updateElectrical(roomId, "lightsOn", e.target.checked)
                        }
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                    </label>

                    <label
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 0",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>🌀 Fans</span>
                      <input
                        type="checkbox"
                        checked={roomState.fansOn}
                        onChange={(e) =>
                          updateElectrical(roomId, "fansOn", e.target.checked)
                        }
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                    </label>
                  </div>

                  {/* Status Indicators */}
                  <div style={{ 
                    marginTop: "10px", 
                    paddingTop: "10px", 
                    borderTop: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-around",
                    fontSize: "11px",
                  }}>
                    <span style={{ 
                      color: roomState.lightsOn ? "#22c55e" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ 
                        width: "6px", 
                        height: "6px", 
                        borderRadius: "50%", 
                        background: roomState.lightsOn ? "#22c55e" : "#ef4444",
                        display: "inline-block"
                      }} />
                      {roomState.lightsOn ? "ON" : "OFF"}
                    </span>
                    <span style={{ 
                      color: roomState.fansOn ? "#22c55e" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ 
                        width: "6px", 
                        height: "6px", 
                        borderRadius: "50%", 
                        background: roomState.fansOn ? "#22c55e" : "#ef4444",
                        display: "inline-block"
                      }} />
                      {roomState.fansOn ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* User Avatars */}
      {Object.entries(users)
        .filter(([id, user]) => user.confidence > 90)
        .map(([id, user]) => {
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
                zIndex: 999
              }}
            >
              <div style={{ fontSize: 25, fontWeight: "bolder", color: "#fff", textShadow: "0 0 10px rgba(0,0,0,0.8)" }}>
                {id}
              </div>
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${id}`}
                style={{ width: 60 }}
                alt={id}
              />
            </div>
          );
        })}

      {/* Selected Room Modal */}
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
            maxWidth: "900px",
            maxHeight: "85vh",
            overflowY: "auto"
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
              cursor: "pointer",
              borderRadius: "5px"
            }}
          >
            ✖
          </button>

          <h3>{selectedRoom} Live Feed</h3>
          {roomStreams[selectedRoom] ? (
            <CameraPlayer url={roomStreams[selectedRoom]} />
          ) : (
            <div style={{ padding: 20, color: "#333" }}>
              Live stream not available for {selectedRoom}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default Map;