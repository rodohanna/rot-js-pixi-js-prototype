import React from "react";
import { Game } from "./game";
function GameContainer(): React.ReactElement {
  React.useEffect(() => {
    const game = new Game();
    game.init();
  }, []);
  return <div id="game-root"></div>;
}

export default GameContainer;
