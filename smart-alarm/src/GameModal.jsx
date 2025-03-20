import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader"; // Import QR Reader
import "./GameModal.css";

const wordList = ["JAVASCRIPT", "REACT", "ALGORITHM", "PUZZLE", "SMART", "CODING", "CHALLENGE", "BRAIN", "SNOOZE", "ALARM"];
const colors = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE"];

export default function GameModal({ mode, onResult, onClose, snoozeCount }) {
  const [currentGame, setCurrentGame] = useState(""); // 'scrambled', 'memory', 'qr'

  // Scrambled Word Game
  const [originalWord, setOriginalWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userGuess, setUserGuess] = useState("");

  // Color Memory Game
  const [colorSequence, setColorSequence] = useState([]);
  const [userColorInput, setUserColorInput] = useState("");
  const [showSequence, setShowSequence] = useState(true);

  // QR Game
  const [qrResult, setQrResult] = useState("");

  useEffect(() => {
    const random = Math.random();
    let selectedGame;
    if (random < 0.33) selectedGame = "scrambled";
    else if (random < 0.66) selectedGame = "memory";
    else selectedGame = "qr";
    setCurrentGame(selectedGame);

    if (selectedGame === "scrambled") {
      generateScrambledWord();
    } else if (selectedGame === "memory") {
      generateColorSequence();
    }
  }, []);

  // --- SCRAMBLED WORD GAME ---

  const shuffle = (word) => {
    const array = word.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  };

  const generateScrambledWord = () => {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    let scrambled = shuffle(word);
    while (scrambled === word) {
      scrambled = shuffle(word);
    }
    setOriginalWord(word);
    setScrambledWord(scrambled);
    setUserGuess("");
  };

  const checkScrambledGuess = () => {
    if (userGuess.toUpperCase() === originalWord) {
      onResult("win");
    } else {
      alert("Incorrect! Try again!");
      setUserGuess("");
    }
  };

  // --- COLOR MEMORY GAME ---

  const generateColorSequence = () => {
    const length = 3 + snoozeCount;
    let sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    setColorSequence(sequence);
    setUserColorInput("");
    setShowSequence(true);

    setTimeout(() => {
      setShowSequence(false);
    }, 3000);
  };

  const checkColorSequence = () => {
    if (userColorInput.toUpperCase().trim() === colorSequence.join(" ")) {
      onResult("win");
    } else {
      alert(`Incorrect! Correct Sequence: ${colorSequence.join(" ")}`);
      setUserColorInput("");
    }
  };

  // --- QR SCANNER GAME ---

  const handleQrScan = (result, error) => {
    if (!!result) {
      setQrResult(result?.text);
      // You can check for specific QR content here if needed
      onResult("win");
    }
    if (!!error) {
      console.log(error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content game-modal">
        <h2>{mode === "stop" ? "Stop Alarm Challenge" : "Snooze Challenge"}</h2>

        {currentGame === "scrambled" && (
          <>
            <p className="game-instruction">Unscramble the word:</p>
            <h1 className="scrambled-word">{scrambledWord}</h1>
            <input
              type="text"
              placeholder="Your Guess"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={checkScrambledGuess}>Submit</button>
              <button onClick={generateScrambledWord}>New Word</button>
            </div>
          </>
        )}

        {currentGame === "memory" && (
          <>
            <p className="game-instruction">Memorize & type the color sequence:</p>
            <div className="color-sequence">
              {showSequence ? (
                colorSequence.map((color, idx) => (
                  <span key={idx} style={{ color: color.toLowerCase(), marginRight: "10px" }}>
                    {color}
                  </span>
                ))
              ) : (
                <span style={{ fontStyle: "italic", color: "#888" }}>Sequence hidden, enter it!</span>
              )}
            </div>
            <input
              type="text"
              placeholder="Type sequence (e.g., RED BLUE GREEN)"
              value={userColorInput}
              onChange={(e) => setUserColorInput(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={checkColorSequence}>Submit</button>
              <button onClick={generateColorSequence}>New Sequence</button>
            </div>
          </>
        )}

        {currentGame === "qr" && (
          <>
            <p className="game-instruction">Scan the QR Code to proceed:</p>
            <div style={{ width: "250px", margin: "auto" }}>
              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={handleQrScan}
                style={{ width: "100%" }}
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "#555" }}>
              Align the QR code in the frame.
            </p>
            <p>Scanned: {qrResult}</p>
          </>
        )}

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
