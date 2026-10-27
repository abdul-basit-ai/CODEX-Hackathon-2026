import { describe, expect, it } from "vitest";
import { chooseComputerToken, chooseToken, continueTurn, createLudoState, legalTokenIds, roll } from "../src/games/ludo/ludo";
import { applyTicTacToeMove, availableMoves, chooseComputerMove, createTicTacToeState } from "../src/games/tic-tac-toe/ticTacToe";
import { InterceptGame } from "../src/games/intercept/intercept";

describe("complete final-game playthroughs", () => {
  it("finishes 100 seeded Ludo games with legal computer rolls and choices", () => {
    for (let seed=1;seed<=100;seed++) {
      let random=seed;
      const die={nextDie:()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return 1+(random%6)}};
      const state=createLudoState();
      let steps=0;
      while(!state.result&&steps++<10000) {
        if(state.phase==="awaiting-token") {
          const token=state.activePlayer==="computer"?chooseComputerToken(state):legalTokenIds(state)[0];
          expect(token).not.toBeNull();expect(chooseToken(state,token!).ok).toBe(true);
        } else if(state.phase==="awaiting-continue") expect(continueTurn(state).ok).toBe(true);
        else expect(roll(state,die).ok).toBe(true);
      }
      expect(state.result).not.toBeNull();expect(steps).toBeLessThan(10000);
      expect(state.tokens[state.result!].every(t=>t.progress===57)).toBe(true);
    }
  });
  it("hard Tic-Tac-Toe never loses against any legal human continuation", () => {
    const walk=(state:ReturnType<typeof createTicTacToeState>)=>{
      if(state.status!=="playing"){expect(state.winner).not.toBe("X");return;}
      if(state.turn==="O") {
        const next=structuredClone(state),index=chooseComputerMove(next);expect(index).not.toBeNull();
        expect(applyTicTacToeMove(next,index!).ok).toBe(true);walk(next);
      } else for(const index of availableMoves(state.board)) {
        const next=structuredClone(state);expect(applyTicTacToeMove(next,index).ok).toBe(true);walk(next);
      }
    };
    walk(createTicTacToeState("hard"));
  });
  it("20 authored-story paths reach endings without losing their choices or text",()=>{
    for(let seed=1;seed<=20;seed++) {
      const game=new InterceptGame(null);let random=seed,steps=0;
      while(game.state.status!=="finished"&&steps++<300) {
        expect(game.state.choices.length).toBeGreaterThan(0);
        random=(Math.imul(random,1664525)+1013904223)>>>0;
        expect(game.chooseNumber(1+random%game.state.choices.length).ok).toBe(true);
      }
      expect(game.state.status).toBe("finished");expect(game.state.transcript.length).toBeGreaterThan(0);game.dispose();
    }
  });
});
