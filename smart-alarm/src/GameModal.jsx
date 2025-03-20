import { useState, useEffect } from "react";
import "./GameModal.css";

const wordList = ["JAVASCRIPT", "REACT", "ALGORITHM", "PUZZLE", "SMART", "CODING", "CHALLENGE", "BRAIN", "SNOOZE", "ALARM"];
const colors = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE"];

export default function GameModal({ mode, onResult, onClose, snoozeCount }) {
  const [currentGame, setCurrentGame] = useState(""); // 'scrambled' or 'memory'

  // Scrambled Word Game
  const [originalWord, setOriginalWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userGuess, setUserGuess] = useState("");

  // Color Memory Game
  const [colorSequence, setColorSequence] = useState([]);
  const [userColorInput, setUserColorInput] = useState("");
  const [showSequence, setShowSequence] = useState(true); // control visibility

  useEffect(() => {
    const randomGame = Math.random() < 0.5 ? "scrambled" : "memory";
    setCurrentGame(randomGame);

    if (randomGame === "scrambled") {
      generateScrambledWord();
    } else {
      generateColorSequence();
    }
  }, []);

  // --- SCRAMBLED WORD GAME FUNCTIONS ---

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

  // --- COLOR MEMORY GAME FUNCTIONS ---

  const generateColorSequence = () => {
    const length = 3 + snoozeCount; // Increase difficulty
    let sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    setColorSequence(sequence);
    setUserColorInput("");
    setShowSequence(true);

    // Hide after 3 seconds
    setTimeout(() => {
      setShowSequence(false);
    }, 3000); // Change time as desired (3000ms = 3 sec)
  };

  const checkColorSequence = () => {
    if (userColorInput.toUpperCase().trim() === colorSequence.join(" ")) {
      onResult("win");
    } else {
      alert(`Incorrect! Correct Sequence: ${colorSequence.join(" ")}`);
      setUserColorInput("");
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

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
