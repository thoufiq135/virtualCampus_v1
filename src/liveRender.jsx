import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function CameraPlayer({ url }) {
  const videoRef = useRef();

  useEffect(() => {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoRef.current);

    return () => hls.destroy();
  }, [url]);

  return (
    <video
      ref={videoRef}
      autoPlay
      controls
      muted
      style={{ width: "100%" }}
    />
  );
}