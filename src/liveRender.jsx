import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

export default function CameraPlayer({ url }) {
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !url) return;

    let hls;

    setLoading(true);
    setError(false);

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
        // Every request hls.js makes (playlist + segments) goes through the
        // ngrok tunnel. Free-tier ngrok serves an HTML "you're about to
        // visit..." interstitial instead of the real file unless this
        // header is present — hls.js was getting that HTML page back and
        // failing to parse it as a manifest, which is what caused the
        // endless "Camera Stream Unavailable" / retry loop.
        xhrSetup: (xhr) => {
          xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
        },
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.log(data);

        if (data.fatal) {
          setError(true);
          setLoading(false);

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;

            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;

      video.addEventListener("loadedmetadata", () => {
        video.play();
        setLoading(false);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        background: "#000",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)",
      }}
    >
      {/* Live Badge */}
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0,0,0,.65)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 30,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#ff2d55",
            animation: "pulse 1s infinite",
          }}
        />
        LIVE
      </div>

      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,.55)",
            color: "#fff",
            fontSize: 18,
            zIndex: 5,
          }}
        >
          Connecting to Camera...
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#111",
            color: "red",
            fontSize: 18,
            zIndex: 5,
          }}
        >
          Camera Stream Unavailable
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        muted
        controls
        playsInline
        crossOrigin="anonymous"
        style={{
          width: "100%",
          display: "block",
        }}
      />

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.5);
              opacity: .5;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}