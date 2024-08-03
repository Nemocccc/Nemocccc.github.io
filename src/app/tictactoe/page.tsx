"use client";
import { useState } from "react";
import Link from "next/link";

function Square({ value, handleClick} : {value : string, handleClick : () => void}) {
    return (<button className="square" onClick={handleClick}>{ value }</button>)
}

function calculateWinner(squares : string[]) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }

export default function Board() {
    const [xIsNext, setNext] = useState(true);
    const [valueB, setValue] = useState(Array(9).fill(null));

    function handleClick(i : number) {
        if (valueB[i] || calculateWinner(valueB)) {
            return ;
        }
        const valueBCopy = valueB.slice();
        if (xIsNext) {
            valueBCopy[i] = "X";
        }
        else {
            valueBCopy[i] = "O";
        }
        setValue(valueBCopy);
        setNext(!xIsNext);
    }

    const winner = calculateWinner(valueB);
    let status;
    if (winner) {
        status = "Winner: " + winner;
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    return (
      <>
        <div className="board-row">
          <Square value={valueB[0]} handleClick={() => handleClick(0)}/>
          <Square value={valueB[1]} handleClick={() => handleClick(1)} />
          <Square value={valueB[2]} handleClick={() => handleClick(2)} />
        </div>
        <div className="board-row">
          <Square value={valueB[3]} handleClick={() => handleClick(3)} />
          <Square value={valueB[4]} handleClick={() => handleClick(4)} />
          <Square value={valueB[5]} handleClick={() => handleClick(5)} />
        </div>
        <div className="board-row">
          <Square value={valueB[6]} handleClick={() => handleClick(6)} />
          <Square value={valueB[7]} handleClick={() => handleClick(7)} />
          <Square value={valueB[8]} handleClick={() => handleClick(8)} />
        </div>

        <div>
          <Link href="/">
            back to home
          </Link>
        </div>
      </>
    );
  }
  