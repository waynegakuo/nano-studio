import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {PromptHistoryItem} from '../../models/prompt.model';
import {AiService} from '../../services/ai/ai.service';



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

  base64Image= signal<string | null>(null);

  // Generation state
  readonly loading = signal<boolean>(false);
  readonly resultUrl = signal<string | null>(null);

  // History
  readonly history = signal<PromptHistoryItem[]>([]);

  readonly canGenerate = computed(() => !!this.base64Image() && this.prompt().trim().length > 0 && !this.loading());
  readonly hasResult = computed(() => this.resultUrl() !== null);

  aiService = inject(AiService);

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
    const file = fileList && fileList.length ? fileList.item(0) : null;
    if (!file) {
      this.clearFile();
      return;
    }
    const type = file.type.toLowerCase();
    const isValid = type === 'image/jpeg' || type === 'image/png' || type === 'image/jpg';
    if (!isValid) {
      this.clearFile();
      alert('Please upload a JPG or PNG image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Extract the base64 data part (after 'data:image/jpeg;base64,')
      const dataPart = base64.split(',')[1];
      this.base64Image.set(dataPart)
    }

    reader.readAsDataURL(file);

    // Create preview URL (SSR-safe)
    if (typeof window !== 'undefined' && 'URL' in window) {
      const url = URL.createObjectURL(file);
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

    this.aiService.generateContent(this.prompt(), this.base64Image()!)
      .then(res => {
        this.resultUrl.set(res);
        this.loading.set(false);

        // Update history (prepend)
        const item: PromptHistoryItem = {
          prompt: currentPrompt,
          timestamp: Date.now(),
          resultUrl: res ?? undefined,
        };
        this.history.update((list) => [item, ...list].slice(0, 20));
      })
  }

  downloadResult(anchor: HTMLAnchorElement): void {
    const url = this.resultUrl();
    if (!url) return;
    // Let the native anchor handle download via [href] + [download]
    // No extra logic required; this method exists for potential analytics hooks.
  }
}
