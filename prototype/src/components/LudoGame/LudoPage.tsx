import { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useSettings } from '../../hooks/useSettings';
import { useLudoGame } from '../../games/ludo/useLudoGame';
import { absoluteSquare, describeToken, isSafeSquare, legalTokenIds, type LudoPlayer } from '../../games/ludo/ludo';
import LudoVoiceCompanion from './LudoVoiceCompanion';

function LudoBoard({ state }: { state: ReturnType<typeof useLudoGame>['state'] }) {
  const occupied = useMemo(() => {
    const cells = new Map<number, string[]>();
    for (const player of ['human', 'computer'] as const) {
      for (const token of state.tokens[player]) {
        const square = absoluteSquare(player, token.progress);
        if (square != null) cells.set(square, [...(cells.get(square) ?? []), `${player === 'human' ? 'red' : 'yellow'} token ${token.id}`]);
      }
    }
    return cells;
  }, [state]);
  return <div className="ludo-board" role="grid" aria-label="Ludo track with 52 squares">
    {Array.from({ length: 52 }, (_, index) => <div key={index} role="gridcell" aria-label={`Track square ${index}${isSafeSquare(index) ? ', safe' : ''}${occupied.has(index) ? `, ${occupied.get(index)!.join(' and ')}` : ', empty'}`} className={`ludo-cell${isSafeSquare(index) ? ' ludo-safe' : ''}`}><span>{index}</span>{occupied.get(index)?.map((label) => <i key={label} className={label.startsWith('red') ? 'ludo-token-red' : 'ludo-token-yellow'} aria-hidden="true" />)}</div>)}
  </div>;
}

function TokenList({ player, state, legal, onChoose }: { player: LudoPlayer; state: ReturnType<typeof useLudoGame>['state']; legal: number[]; onChoose: (id: number) => void }) {
  return <div className={`ludo-token-list ${player === 'human' ? 'ludo-human' : 'ludo-computer'}`}><h3>{player === 'human' ? 'Your tokens' : 'Computer tokens'}</h3>{state.tokens[player].map((token) => <button key={token.id} type="button" className="ludo-token-row" disabled={player !== 'human' || !legal.includes(token.id)} onClick={() => onChoose(token.id)} aria-label={`${player === 'human' ? 'Your' : 'Computer'} token ${token.id}, ${describeToken(state, player, token.id)}${legal.includes(token.id) ? ', available to move' : ''}`}><span className="token-number">{token.id}</span><span>{describeToken(state, player, token.id)}</span>{legal.includes(token.id) && <strong>Available</strong>}</button>)}</div>;
}

export default function LudoPage() {
  const { settings, setConfirmMoves, setScreenReaderMode } = useSettings();
  const game = useLudoGame();
  const [newGamePrompt, setNewGamePrompt] = useState(false);
  const legal = legalTokenIds(game.state, 'human');

  function choose(id: number) {
    const result = game.proposeToken(id);
    if (result.ok && !settings.confirmMoves) game.confirmToken();
  }

  return <div className="app ludo-app"><a href="#ludo-main" className="skip-link">Skip to main content</a><header className="app-header"><button className="library-link" onClick={() => { window.location.href = '/'; }}>Game library</button><h1>Voice Ludo</h1><span className="game-badge">Ludo</span></header><main id="ludo-main" className="ludo-main">
    <LudoVoiceCompanion state={game.state} paused={game.paused} pendingToken={game.pendingToken} confirmMoves={settings.confirmMoves} screenReaderMode={settings.screenReaderMode} rollDice={game.rollDice} proposeToken={game.proposeToken} confirmToken={game.confirmToken} cancelToken={game.cancelToken} correct={game.correct} continueGame={game.continueGame} newGame={game.newGame} pauseGame={game.pauseGame} resumeGame={game.resumeGame} />
    <div className="ludo-layout"><aside className="ludo-side"><Card><p className="panel-title">Turn and die</p><p className="ludo-status" aria-live="polite">{game.status}</p><p>Current roll: <strong>{game.state.currentRoll ?? 'none'}</strong></p><p>Sixes in this turn: <strong>{game.state.sixStreak}</strong></p><div className="ludo-actions"><Button onClick={() => setNewGamePrompt(true)} className="secondary-button">New game</Button><Button onClick={game.paused ? game.resumeGame : game.pauseGame}>{game.paused ? 'Resume game' : 'Pause game'}</Button>{game.state.phase === 'awaiting-roll' && game.state.activePlayer === 'human' && <Button onClick={game.rollDice}>Roll die</Button>}{game.state.phase === 'awaiting-continue' && <Button onClick={game.continueGame}>Continue</Button>}{game.state.correction && <Button onClick={game.correct} className="secondary-button">Correct last move</Button>}</div></Card><TokenList player="human" state={game.state} legal={legal} onChoose={choose}/><TokenList player="computer" state={game.state} legal={[]}/><Card><label><input type="checkbox" checked={settings.confirmMoves} onChange={(event) => setConfirmMoves(event.target.checked)} /> Confirm token moves</label><label><input type="checkbox" checked={settings.screenReaderMode} onChange={(event) => setScreenReaderMode(event.target.checked)} /> Screen-reader narration</label></Card></aside><section className="ludo-board-section" aria-label="Ludo board"><LudoBoard state={game.state}/><p className="ludo-board-help">Red is you. Yellow is the computer. Numbered token descriptions are available in the token lists and through voice.</p></section></div>
    {game.pendingToken != null && <div className="ludo-confirm" role="group" aria-label="Ludo token confirmation"><p>Move token {game.pendingToken}?</p><Button onClick={() => { const result = game.confirmToken(); if (!result.ok) setNewGamePrompt(false); }}>Confirm move</Button><Button className="secondary-button" onClick={game.cancelToken}>Cancel</Button></div>}
    {newGamePrompt && <div className="ludo-confirm" role="alertdialog" aria-label="Start new Ludo game"><p>Start a new Ludo game and clear this saved position?</p><Button onClick={() => { game.newGame(); setNewGamePrompt(false); }}>Start new game</Button><Button className="secondary-button" onClick={() => setNewGamePrompt(false)}>Cancel</Button></div>}
    {game.state.result && <div className="ludo-finished" role="dialog" aria-label="Ludo game result"><h2>{game.state.result === 'human' ? 'You win!' : 'Computer wins'}</h2><p>All four tokens have reached home.</p><Button onClick={game.newGame}>Play again</Button></div>}
  </main></div>;
}
