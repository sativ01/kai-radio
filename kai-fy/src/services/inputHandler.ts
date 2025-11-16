type EventCallback = () => void;

export class InputHandler {
  private listeners: Map<string, EventCallback[]> = new Map();

  constructor() {
    this.setupKeyboardListeners();
    this.setupSoftkeyListeners();
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      let action: string | null = null;

      switch (event.key) {
        case 'ArrowUp':
          action = 'up';
          break;
        case 'ArrowDown':
          action = 'down';
          break;
        case 'ArrowLeft':
          action = 'left';
          break;
        case 'ArrowRight':
          action = 'right';
          break;
        case 'Enter':
          action = 'enter';
          break;
        case 'SoftLeft': // KaiOS specific
          action = 'softkey-left';
          break;
        case 'SoftRight': // KaiOS specific
          action = 'softkey-right';
          break;
      }

      if (action) {
        event.preventDefault();
        this.emit(action);
      }
    });
  }

  private setupSoftkeyListeners(): void {
    const softkeyLeft = document.getElementById('softkey-left');
    const softkeyCenter = document.getElementById('softkey-center');
    const softkeyRight = document.getElementById('softkey-right');

    softkeyLeft?.addEventListener('click', () => {
      this.emit('softkey-left');
    });

    softkeyCenter?.addEventListener('click', () => {
      this.emit('softkey-center');
    });

    softkeyRight?.addEventListener('click', () => {
      this.emit('softkey-right');
    });
  }

  public on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }
}
