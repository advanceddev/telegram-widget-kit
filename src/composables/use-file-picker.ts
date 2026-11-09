/**
 * Hidden `<input type="file">` orchestration: the component owns the input
 * element; the composable reads the selected file, streams its text to the
 * consumer and resets the input so picking the same file twice still fires
 * a change event.
 */

export interface FilePickerOptions {
  onFile(text: string, filename: string): void;
  onError(message: string): void;
}

export interface FilePickerBinding {
  onChange(event: Event): void;
}

export function useFilePicker(options: FilePickerOptions): FilePickerBinding {
  async function handleChange(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (!file) {
      return;
    }
    try {
      options.onFile(await file.text(), file.name);
    } catch (error) {
      options.onError(error instanceof Error ? error.message : String(error));
    }
    element.value = '';
  }

  return {
    onChange: (event) => void handleChange(event),
  };
}
