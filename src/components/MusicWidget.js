import React, { useState, useRef } from "react";
import "./MusicWidget.css";

const tracks = {
  relax: "/music/relaxing.mp3",
  focus: "/music/Focus.mp3",
  energetic: "/music/Energetic.mp3",
  uplifting: "/music/Uplifting.mp3",
};

export default function MusicWidget() {
  const [showOptions, setShowOptions] = useState(false);
  const audioRef = useRef(null);

  const playTrack = (type) => {
    if (audioRef.current) {
      audioRef.current.src = tracks[type];
      audioRef.current.play();
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="music-widget">
      <div className="music-icon" onClick={() => setShowOptions(!showOptions)}>
        🎵
      </div>

      {showOptions && (
        <div className="music-options">
          <button
            title="'This Too Shall Pass' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
            onClick={() => playTrack("relax")}
          >
            Relax
          </button>
          <button
            title="'First Snow' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
            onClick={() => playTrack("focus")}
          >
            Focus
          </button>
          <button
            title="'Wonderful' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
            onClick={() => playTrack("energetic")}
          >
            Energetic
          </button>
          <button
            title="'Clear Skies' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
            onClick={() => playTrack("uplifting")}
          >
            Uplifting
          </button>
          <button onClick={stopMusic}>Stop</button>
        </div>
      )}

      <audio ref={audioRef} loop />
    </div>
  );
}
