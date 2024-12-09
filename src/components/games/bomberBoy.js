import React, { useState, useEffect } from "react";
import Button from "../atoms/button";
import Modal from "../atoms/modal";
import CurrentPlayerPreview from "../organisms/currentPlayerPreview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGamepad,
  faForward,
  faWhiskeyGlass,
  faRotateRight,
  faCircleRight,
  faEyeSlash,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

function BomberBoy({ onNextGame, updateSips }) {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerOneTurn, setIsPlayerOneTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loser, setLoser] = useState(null);
  const [bombIndex, setBombIndex] = useState(null);
  const [drinksMessage, setDrinksMessage] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);

  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem("players")) || [];
    const activePlayers = storedPlayers.filter((player) => player.activePlayer);

    if (activePlayers.length >= 2) {
      setPlayer1(activePlayers[0]);
      setPlayer2(activePlayers[1]);
    } else {
      const shuffledPlayers = [...storedPlayers].sort(
        () => Math.random() - 0.5
      );
      setPlayer1(shuffledPlayers[0]);
      setPlayer2(shuffledPlayers[1]);

      const updatedPlayers = storedPlayers.map((player) => ({
        ...player,
        activePlayer:
          player === shuffledPlayers[0] || player === shuffledPlayers[1],
      }));

      localStorage.setItem("players", JSON.stringify(updatedPlayers));
    }
  }, []);

  const handleChooseCard = (index) => {
    if (winner) return;
    const newBoard = board.slice();

    if (!isPlayerOneTurn) {
      if (newBoard[index] === "chosen") return;

      if (index === bombIndex) {
        const remainingCards =
          newBoard.filter((card) => card === null).length + 1;
        const saveCardAmount = 9 - remainingCards;
        updateSips(player2.username, remainingCards);
        updateSips(player1.username, saveCardAmount);
        setDrinksMessage(
          `${player1.username} drinks ${saveCardAmount}, ${player2.username} drinks ${remainingCards}!`
        );
        setLoser(player2.username);
        setWinner(player1.username);
        setIsDrinkModalOpen(true);
      } else {
        newBoard[index] = "chosen";
        setBoard(newBoard);

        const remainingCards = newBoard.filter((card) => card === null).length;
        if (remainingCards === 1) {
          updateSips(player1.username, 9);
          setDrinksMessage(`${player1.username} drinks all 9!`);
          setIsDrinkModalOpen(true);
          setLoser(player1.username);
          setWinner(player2.username);
        }
      }
      setIsPlayerOneTurn(true);
    }
  };

  const handleSetBomb = (index) => {
    if (winner) return;
    const newBoard = board.slice();

    if (bombIndex !== null) {
      newBoard[bombIndex] = null;
    }

    newBoard[index] = "bomb";
    setBoard(newBoard);
    setBombIndex(index);
  };

  const handleNextPlayer = () => {
    setIsPlayerOneTurn(!isPlayerOneTurn);
  };

  const resetGame = () => {
    const storedPlayers = JSON.parse(localStorage.getItem("players")) || [];
    const shuffledPlayers = [...storedPlayers].sort(() => Math.random() - 0.5);

    // Update the `activePlayer` property
    const updatedPlayers = storedPlayers.map((player) => ({
      ...player,
      activePlayer:
        player.id === shuffledPlayers[0].id ||
        player.id === shuffledPlayers[1].id,
    }));

    // Save the updated players back to localStorage
    localStorage.setItem("players", JSON.stringify(updatedPlayers));

    // Update state with the shuffled players
    setPlayer1(shuffledPlayers[0]);
    setPlayer2(shuffledPlayers[1]);

    setBoard(Array(9).fill(null));
    setIsPlayerOneTurn(true);
    setWinner(null);
    setLoser(null);
    setBombIndex(null);
    setDrinksMessage(null);
  };

  return (
    <div className="bomber-boy-container">
      <button className="hint" onClick={() => setIsInfoModalOpen(true)}>
        <FontAwesomeIcon icon={faQuestionCircle} />
      </button>
      <h1>Bomber Boy</h1>
      <CurrentPlayerPreview isPlayerOneTurn={isPlayerOneTurn} />
      <div className="board">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell ${
              cell === "bomb" ? "bomb" : cell === "chosen" ? "chosen" : ""
            }`}
            onClick={() => {
              if (isPlayerOneTurn) {
                if (cell === null) handleSetBomb(index);
              } else {
                handleChooseCard(index);
              }
            }}
          >
            {cell === "bomb" && isPlayerOneTurn && "💣"}
          </div>
        ))}
      </div>

      {winner && (
        <div className="button-wrapper">
          <Button
            icon={faRotateRight}
            variant="secondary"
            onClick={resetGame}
            text="Play again"
          />
          <Button
            icon={faCircleRight}
            variant="primary"
            onClick={onNextGame}
            text="Next Game"
          />
        </div>
      )}
      {isPlayerOneTurn && bombIndex !== null && !winner && (
        <Button
          icon={faEyeSlash}
          variant="primary"
          onClick={handleNextPlayer}
          text="Hide bomb"
        />
      )}

      {isDrinkModalOpen && (
        <Modal
          title={`Drink up`}
          description={drinksMessage}
          buttons={[
            {
              icon: faWhiskeyGlass,
              text: "Drink",
              variant: "primary",
            },
          ]}
          onClose={() => setIsDrinkModalOpen(false)}
        />
      )}

      {isInfoModalOpen && (
        <Modal
          title="How to Bomber Boy"
          description={`${player1.username} hides the bomb in one of the tiles. ${player2.username} then chooses a tile. If it's the bomb ${player2.username} drinks the same amount of sips as cards on the table. If the card is save, ${player1.username} drinks one sip and can choose where to put the bomb next.`}
          buttons={[
            {
              icon: faForward,
              text: "Skip",
              variant: "secondary",
              onClick: onNextGame,
            },
            {
              icon: faGamepad,
              text: "Got it!",
              variant: "primary",
              onClick: () => setIsInfoModalOpen(false), // Close modal on button click
            },
          ]}
          onClose={() => setIsInfoModalOpen(false)} // Close modal when overlay or close button is clicked
        />
      )}
    </div>
  );
}

export default BomberBoy;
