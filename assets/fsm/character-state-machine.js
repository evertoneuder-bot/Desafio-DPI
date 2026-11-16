/** Máquina de estados dos mascotes. Independente do DOM, áudio e renderizador. */
export const STATES = Object.freeze({
  IDLE_QUIZ: 'IDLE_QUIZ', THINKING: 'THINKING',
  CORRECT_ANSWER: 'CORRECT_ANSWER', INCORRECT_ANSWER: 'INCORRECT_ANSWER',
  MINIGAME_START: 'MINIGAME_START', MINIGAME_CHEERING: 'MINIGAME_CHEERING',
});
export const TRIGGERS = Object.freeze({
  NEW_QUESTION: 'NEW_QUESTION', CORRECT: 'CORRECT', INCORRECT: 'INCORRECT',
  START_MINIGAME: 'START_MINIGAME', END_MINIGAME: 'END_MINIGAME',
});
const RESULTS = new Set([STATES.CORRECT_ANSWER, STATES.INCORRECT_ANSWER]);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export class CharacterStateMachine {
  constructor({ persona, random = Math.random, thinkingAfter = 10,
    reactionDuration = 2, minigameIntroDuration = 1.2, blendDuration = .14 } = {}) {
    if (!['Tom', 'Fernanda'].includes(persona)) throw new Error('Personagem inválido.');
    for (const value of [thinkingAfter, reactionDuration, minigameIntroDuration, blendDuration]) {
      if (!Number.isFinite(value) || value <= 0) throw new Error('Duração inválida.');
    }
    this.persona = persona;
    this.random = random;
    this.config = { thinkingAfter, reactionDuration, minigameIntroDuration, blendDuration };
    this.parameters = { quizActive: false, minigameActive: false, paused: false, speaking: false };
    this.state = STATES.IDLE_QUIZ;
    this.elapsed = 0;
    this.questionElapsed = 0;
    this.questionId = null;
    this.answered = false;
    this.transition = null;
    this.blinkElapsed = 0;
    this.nextBlink = this.randomBlinkInterval();
    this.blinkRemaining = 0;
    this.listeners = new Set();
  }
  randomBlinkInterval() { return 4 + clamp(this.random(), 0, 1) * 2; }
  onTransition(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  setBoolean(name, value) {
    // Os dois modos são mutuamente exclusivos; altere-os pelos triggers.
    if (!['paused', 'speaking'].includes(name)) throw new Error('Boolean não alterável: ' + name);
    this.parameters[name] = Boolean(value);
  }
  enter(next) {
    if (this.state === next) return;
    const previous = this.state;
    this.transition = { from: previous, fromTime: this.elapsed, elapsed: 0 };
    this.state = next;
    this.elapsed = 0;
    this.blinkRemaining = 0;
    for (const listener of this.listeners) listener({ persona: this.persona, from: previous, to: next });
  }
  trigger(name, { questionId = null } = {}) {
    switch (name) {
      case TRIGGERS.NEW_QUESTION:
        // Repetir o mesmo evento não reinicia o relógio da questão.
        if (questionId !== null && questionId === this.questionId) return false;
        this.questionId = questionId;
        Object.assign(this.parameters, { quizActive: true, minigameActive: false });
        this.questionElapsed = 0;
        this.answered = false;
        // Preserve a reação já iniciada mesmo se a próxima pergunta chegar cedo.
        if (!RESULTS.has(this.state)) this.enter(STATES.IDLE_QUIZ);
        return true;
      case TRIGGERS.CORRECT:
      case TRIGGERS.INCORRECT:
        if (RESULTS.has(this.state)) return false;
        if (!this.parameters.minigameActive && (!this.parameters.quizActive || this.answered)) return false;
        this.answered = true;
        this.enter(name === TRIGGERS.CORRECT ? STATES.CORRECT_ANSWER : STATES.INCORRECT_ANSWER);
        return true;
      case TRIGGERS.START_MINIGAME:
        if (this.parameters.minigameActive) return false;
        Object.assign(this.parameters, { quizActive: false, minigameActive: true });
        this.enter(STATES.MINIGAME_START);
        return true;
      case TRIGGERS.END_MINIGAME:
        Object.assign(this.parameters, { quizActive: false, minigameActive: false });
        this.enter(STATES.IDLE_QUIZ);
        return true;
      default: throw new Error('Trigger desconhecido: ' + name);
    }
  }
  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) throw new Error('Delta inválido.');
    if (this.parameters.paused) return this.snapshot();
    // Limite de atualização: voltar de uma aba oculta não faz a animação saltar.
    const dt = Math.min(deltaSeconds, .1);
    this.elapsed += dt;
    if (this.transition) {
      this.transition.elapsed += dt;
      if (this.transition.elapsed >= this.config.blendDuration) this.transition = null;
    }
    if (this.parameters.quizActive && !this.answered && !this.parameters.speaking) this.questionElapsed += dt;
    if (RESULTS.has(this.state) && this.elapsed >= this.config.reactionDuration) {
      this.enter(this.parameters.minigameActive ? STATES.MINIGAME_CHEERING : STATES.IDLE_QUIZ);
    } else if (this.state === STATES.MINIGAME_START && this.elapsed >= this.config.minigameIntroDuration) {
      this.enter(STATES.MINIGAME_CHEERING);
    } else if (this.state === STATES.IDLE_QUIZ && this.parameters.quizActive &&
      !this.answered && this.questionElapsed >= this.config.thinkingAfter) {
      this.enter(STATES.THINKING);
    }
    if (this.state === STATES.IDLE_QUIZ) {
      if (this.blinkRemaining > 0) this.blinkRemaining = Math.max(0, this.blinkRemaining - dt);
      else {
        this.blinkElapsed += dt;
        if (this.blinkElapsed >= this.nextBlink) {
          this.blinkRemaining = .12;
          this.blinkElapsed = 0;
          this.nextBlink = this.randomBlinkInterval();
        }
      }
    }
    return this.snapshot();
  }
  snapshot() {
    const t = this.transition;
    const progress = t ? clamp(t.elapsed / this.config.blendDuration, 0, 1) : 1;
    // Smoothstep: aceleração e desaceleração suaves na mistura de estados.
    const weight = progress * progress * (3 - 2 * progress);
    return {
      persona: this.persona, state: this.state, time: this.elapsed,
      blink: this.blinkRemaining > 0, speaking: this.parameters.speaking,
      previous: t ? { state: t.from, time: t.fromTime + t.elapsed, weight: 1 - weight } : null,
      weight,
    };
  }
}

/** Uma mesma decisão do quiz dispara os dois mascotes; os sprites são diferentes. */
export class MascotDirector {
  constructor(options = {}) {
    this.characters = ['Tom', 'Fernanda'].map(persona => new CharacterStateMachine({ ...options, persona }));
  }
  trigger(name, payload) { return this.characters.map(actor => actor.trigger(name, payload)); }
  setBoolean(name, value) { this.characters.forEach(actor => actor.setBoolean(name, value)); }
  update(dt) { return this.characters.map(actor => actor.update(dt)); }
}
