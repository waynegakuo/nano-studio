import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingMessagesService {
  private readonly messages = [
    "🎨 Sprinkling some digital magic...",
    "🤖 Teaching pixels to dance...",
    "✨ Transforming imagination into reality...",
    "🎭 Arranging photons for the perfect shot...",
    "🔮 Consulting the AI crystal ball...",
    "🎪 Orchestrating a visual masterpiece...",
    "🌟 Brewing up some pixel perfection...",
    "🎬 Directing your product's debut...",
    "🎨 Mixing colors in the digital palette...",
    "🚀 Launching creativity into orbit...",
    "⚡ Charging up the imagination engine...",
    "🎯 Aiming for visual excellence...",
    "🔥 Igniting creative sparks...",
    "💫 Weaving light and shadow...",
    "🎪 Setting up the visual stage..."
  ];

  private readonly currentMessageIndex = signal<number>(0);
  private cyclingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Gets a random loading message
   */
  getRandomMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.messages.length);
    this.currentMessageIndex.set(randomIndex);
    return this.messages[randomIndex];
  }

  /**
   * Gets the current message (reactive)
   */
  readonly currentMessage = computed(() => this.messages[this.currentMessageIndex()]);

  /**
   * Sets a specific message by index (useful for testing or specific scenarios)
   */
  setMessageByIndex(index: number): void {
    if (index >= 0 && index < this.messages.length) {
      this.currentMessageIndex.set(index);
    }
  }

  /**
   * Gets the total number of available messages
   */
  get messageCount(): number {
    return this.messages.length;
  }

  /**
   * Starts cycling through messages every second
   */
  startCycling(): void {
    // Stop any existing cycling first
    this.stopCycling();

    // Set initial random message
    const randomIndex = Math.floor(Math.random() * this.messages.length);
    this.currentMessageIndex.set(randomIndex);

    // Start cycling every second
    this.cyclingInterval = setInterval(() => {
      const nextRandomIndex = Math.floor(Math.random() * this.messages.length);
      this.currentMessageIndex.set(nextRandomIndex);
    }, 3000);
  }

  /**
   * Stops the message cycling
   */
  stopCycling(): void {
    if (this.cyclingInterval !== null) {
      clearInterval(this.cyclingInterval);
      this.cyclingInterval = null;
    }
  }
}
