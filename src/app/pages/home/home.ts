import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {PromptHistoryItem} from '../../models/prompt.model';



@Component({
  selector: 'app-home',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  // Preset prompts (could be externalized to a service later)
  readonly presets = signal<{ id: number; title: string; description: string }[]>([
    {
      id: 1,
      title: 'Studio',
      description: 'Studio lighting, high contrast product shot, reflective surface'
    },
    {
      id: 2,
      title: 'Soft',
      description: 'Soft pastel background, minimal shadows, lifestyle vibe'
    },
    {
      id: 3,
      title: 'Noir',
      description: 'Moody noir lighting, dramatic shadows, premium feel'
    },
    {
      id: 4,
      title: 'Vibrant',
      description: 'Bright gradient backdrop, playful, vibrant retail look'
    },
  ]);

  readonly selectedPreset = signal<string | null>(null);

  // User input state
  readonly prompt = signal<string>('');
  readonly file = signal<File | null>(null);
  readonly filePreviewUrl = signal<string | null>(null);

  // Generation state
  readonly loading = signal<boolean>(false);
  readonly resultUrl = signal<string | null>(null);

  // History
  readonly history = signal<PromptHistoryItem[]>([]);

  readonly canGenerate = computed(() => !!this.file() && this.prompt().trim().length > 0 && !this.loading());
  readonly hasResult = computed(() => this.resultUrl() !== null);

  onSelectPreset(preset: { id: number; title: string; description: string }): void {
    // Mark the selected preset by title and prefill the prompt with its description
    this.selectedPreset.set(preset.title);
    this.prompt.set(preset.description);
  }

  onPromptInput(value: string): void {
    this.prompt.set(value);
    // If user edits the prompt so it no longer matches the description of the selected preset, clear selection
    const selectedTitle = this.selectedPreset();
    if (selectedTitle) {
      const match = this.presets().find(p => p.title === selectedTitle);
      if (!match || match.description !== value) {
        this.selectedPreset.set(null);
      }
    }
  }

  onFileChange(fileList: FileList | null): void {
    const next = fileList && fileList.length ? fileList.item(0) : null;
    if (!next) {
      this.clearFile();
      return;
    }
    const type = next.type.toLowerCase();
    const isValid = type === 'image/jpeg' || type === 'image/png' || type === 'image/jpg';
    if (!isValid) {
      this.clearFile();
      alert('Please upload a JPG or PNG image.');
      return;
    }
    this.file.set(next);
    // Create preview URL (SSR-safe)
    if (typeof window !== 'undefined' && 'URL' in window) {
      const url = URL.createObjectURL(next);
      this.filePreviewUrl.set(url);
    }
  }

  private clearFile(): void {
    // Revoke previous URL
    const current = this.filePreviewUrl();
    if (typeof window !== 'undefined' && current) {
      try { URL.revokeObjectURL(current); } catch { /* noop */ }
    }
    this.file.set(null);
    this.filePreviewUrl.set(null);
  }

  async generate(): Promise<void> {
    if (!this.canGenerate()) return;
    this.loading.set(true);
    this.resultUrl.set(null);

    const currentPrompt = this.prompt().trim();
    const currentFile = this.file();

    try {
      // Mock async call to Gemini image generation; replace with actual service integration
      // For demo, we use the uploaded image as the "generated" output after a short delay
      await new Promise((res) => setTimeout(res, 1000));

      let outputUrl: string | null = null;
      if (currentFile) {
        if (typeof window !== 'undefined' && 'URL' in window) {
          outputUrl = URL.createObjectURL(currentFile);
        } else {
          outputUrl = null;
        }
      }

      this.resultUrl.set(outputUrl);

      // Update history (prepend)
      const item: PromptHistoryItem = {
        prompt: currentPrompt,
        timestamp: Date.now(),
        resultUrl: outputUrl ?? undefined,
      };
      this.history.update((list) => [item, ...list].slice(0, 20));
    } finally {
      this.loading.set(false);
    }
  }

  downloadResult(anchor: HTMLAnchorElement): void {
    const url = this.resultUrl();
    if (!url) return;
    // Let the native anchor handle download via [href] + [download]
    // No extra logic required; this method exists for potential analytics hooks.
  }
}
