import { Component, AfterViewChecked, ElementRef, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface PromptHistory {
  id: number;
  prompt: string;
  response: string;
  createdAt: string;
  showMenu?: boolean;
}

interface Model {
  name: string;
  value: string;
  premium?: boolean;
}


@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai.html',
  styleUrls: ['./ai.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AiPage implements AfterViewChecked, OnInit {
  prompt = '';
  responses: { text: string[], sender: 'user' | 'ai' }[] = [];
  history: PromptHistory[] = [];
  selectedChat?: PromptHistory;
  loading = false;
  errorMessage = '';
  selectedImageFile: File | null = null;
  selectedImagePreview: string | ArrayBuffer | null = null;
  showConfirm = false;
  pendingDeleteId?: number;
  sidebarVisible = false;
  models: Model[] = [
    { name: 'Llama 3', value: 'llama3', premium: false },
      { name: 'Gemma 3', value: 'gemma3', premium: false },
      { name: 'Code Llama 🔒', value: 'codellama:13b', premium: true }
  ]

  selectedModel = this.models[0].value;

  themes = [
  { name: 'azul', preview: 'linear-gradient(135deg, #4b6cb7, #182848)', colors: ['#4b6cb7', '#182848'] },
  { name: 'dark mode', preview: 'linear-gradient(135deg, #313131ff, #1a1a1aff)', colors: ['#3a3a3aff', '#1d1d1dff'] },
  { name: 'morado', preview: 'linear-gradient(135deg, #8e2de2, #4a00e0)', colors: ['#8e2de2', '#31015eff'] },
  { name: 'cromo', preview: 'linear-gradient(135deg, #ff512f, #dd2476)', colors: ['#bb0da4ff', '#8b174bff'] },
  { name: 'light mode', preview: 'linear-gradient(135deg, #8d8d8dff, #888888ff)', colors: ['#727272ff', '#727272ff'] },
  { name: 'personalizado', preview: 'linear-gradient(135deg, #ff0000ff, #ffd900ff, #00ff40ff, #0066ffff, #ff00f2ff)', colors: ['#ffffff', '#000000'] },
];

customColor1: string = '#ffffff';
customColor2: string = '#000000';

selectedTheme = 'azul';

showThemes = false;

toggleThemes() {
  this.showThemes = !this.showThemes;
}

changeTheme(theme: any) {
  const root = document.documentElement;

  const oldColor1 = this.parseColor(getComputedStyle(root).getPropertyValue('--color1').trim());
  const oldColor2 = this.parseColor(getComputedStyle(root).getPropertyValue('--color2').trim());

  let newColor1: number[], newColor2: number[];

  if (theme.name === 'personalizado') {
    newColor1 = this.parseColor(this.customColor1);
    newColor2 = this.parseColor(this.customColor2);
  } else {
    newColor1 = this.parseColor(theme.colors[0]);
    newColor2 = this.parseColor(theme.colors[1]);
  }

  const duration = 800;
  let start = performance.now();

  const step = (timestamp: number) => {
    const t = Math.min((timestamp - start) / duration, 1);

    const color1 = this.rgbToString(this.interpolateRGB(oldColor1, newColor1, t));
    const color2 = this.rgbToString(this.interpolateRGB(oldColor2, newColor2, t));

    root.style.setProperty('--color1', color1);
    root.style.setProperty('--color2', color2);

    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);

  this.selectedTheme = theme.name;
  localStorage.setItem('selectedTheme', this.selectedTheme);
  if (theme.name === 'personalizado') {
    localStorage.setItem('customColor1', this.customColor1);
    localStorage.setItem('customColor2', this.customColor2);
  }
}

parseColor(color: string): number[] {
  color = color.replace(/\s+/g,'');
  if (color.startsWith('#')) {
    return [
      parseInt(color.slice(1,3),16),
      parseInt(color.slice(3,5),16),
      parseInt(color.slice(5,7),16)
    ];
  } else if (color.startsWith('rgb')) {
    const nums = color.match(/\d+/g)!.map(Number);
    return nums;
  } else return [255,255,255];
}

interpolateRGB(a: number[], b: number[], t: number): number[] {
  return a.map((v,i) => Math.round(v + (b[i]-v)*t));
}

rgbToString(rgb: number[]): string {
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}


updateCustomTheme() {
  document.documentElement.style.setProperty('--color1', this.customColor1);
  document.documentElement.style.setProperty('--color2', this.customColor2);

  localStorage.setItem('customColor1', this.customColor1);
  localStorage.setItem('customColor2', this.customColor2);
  localStorage.setItem('selectedTheme', 'personalizado');
}

  onModelChange() {
    const model = this.models.find(m => m.value === this.selectedModel);
    if (model?.premium) {
      this.router.navigate(['/payment']);
    }
  }

  private apiUrl = 'http://localhost:5024/api/ollama';
  @ViewChild('responsesContainer') private responsesContainer!: ElementRef;

  constructor(private http: HttpClient, private router: Router) {}

ngOnInit() {
  this.loadHistory();

  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    this.selectedTheme = savedTheme;

    if (savedTheme === 'personalizado') {
      this.customColor1 = localStorage.getItem('customColor1') || '#ffffff';
      this.customColor2 = localStorage.getItem('customColor2') || '#000000';
      document.documentElement.style.setProperty('--color1', this.customColor1);
      document.documentElement.style.setProperty('--color2', this.customColor2);
    } else {
      const theme = this.themes.find(t => t.name === savedTheme);
      if (theme) {
        document.documentElement.style.setProperty('--color1', theme.colors[0]);
        document.documentElement.style.setProperty('--color2', theme.colors[1]);
      }
    }
  } else {
    const defaultTheme = this.themes.find(t => t.name === this.selectedTheme);
    if (defaultTheme) {
      document.documentElement.style.setProperty('--color1', defaultTheme.colors[0]);
      document.documentElement.style.setProperty('--color2', defaultTheme.colors[1]);
    }
  }
}



  loadHistory() {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<PromptHistory[]>(`${this.apiUrl}/history`, { headers })
      .subscribe({
        next: res => {
          this.history = res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        error: () => this.errorMessage = 'No se pudo cargar el historial'
      });
  }

  loadChat(chat: PromptHistory) {
    this.selectedChat = chat;
    this.responses = [
      { text: chat.prompt.split('\n'), sender: 'user' },
      { text: chat.response.split('\n'), sender: 'ai' }
    ];
  }

  askVision() {
  if (!this.prompt.trim() || !this.selectedImageFile) return;

  this.loading = true;
  const token = localStorage.getItem('token') || '';
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.responses.push({ 
    text: [this.prompt.split('\n').join(' '), '(Imagen Adjunta)'], 
    sender: 'user' 
  });

  const formData = new FormData();
  formData.append('prompt', this.prompt);
  formData.append('image', this.selectedImageFile, this.selectedImageFile.name);
  formData.append('model', this.selectedModel);


  this.http.post<{ response: string }>(
    `${this.apiUrl}/ask-vision`,
    formData,
    { headers }
  )
  .subscribe({
    next: res => {
      this.responses.push({ text: res.response.split('\n'), sender: 'ai' });
      this.prompt = '';
      this.loading = false;
      this.removeImage();
      this.loadHistory();
    },
    error: err => {
      this.errorMessage = err.error?.response || 'Error al consultar la IA de visión';
      this.loading = false;
    }
  });
}

  askQuestion() {
  if (!this.prompt.trim()) return;
  if (this.selectedImageFile && this.selectedModel.includes('gemma3')) {
      this.askVision();
      return;
  }
  this.loading = true;
  const token = localStorage.getItem('token') || '';
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.responses.push({ text: this.prompt.split('\n'), sender: 'user' });

  let fullPrompt = this.prompt;

if (this.responses.length > 0) {
  const historyContext = this.responses
    .map(r => `${r.sender === 'user' ? 'Usuario' : 'AI'}: ${r.text.join('\n')}`)
    .join('\n');

  fullPrompt = historyContext + `\nUsuario: ${this.prompt}\nAI:`;
}


  this.http.post<{ response: string }>(
    `${this.apiUrl}/ask`,
    { prompt: fullPrompt, model: this.selectedModel },
    { headers }
  )
  .subscribe({
    next: res => {
      this.responses.push({ text: res.response.split('\n'), sender: 'ai' });
      this.prompt = '';
      this.loading = false;
      this.loadHistory();
    },
    error: err => {
      this.errorMessage = err.error?.response || 'Error al consultar la IA';
      this.loading = false;
    }
  });
}



  newChat() {
  this.responses = [];
  this.selectedChat = undefined;
}

showLogoutAnimation = false;
showConfirmModal = false;

confirmLogout() {
  this.showConfirmModal = true;
}

cancelLogout() {
  this.showConfirmModal = false;
}

logout() {
  this.showConfirmModal = false;
  this.showLogoutAnimation = true;

  setTimeout(() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, 1000);
}


  ngAfterViewChecked() { this.scrollToBottom(); }

  private scrollToBottom(): void {
    try { this.responsesContainer.nativeElement.scrollTop = this.responsesContainer.nativeElement.scrollHeight; } 
    catch {}
  }

  toggleMenu(item: PromptHistory, event: MouseEvent) {
  event.stopPropagation();
  this.history = this.history.map(h => {
    h.showMenu = h.id === item.id ? !h.showMenu : false;
    return h;
  });
}

toggleDelete(id: number) {
  this.pendingDeleteId = id;
  this.showConfirm = true;
}

cancelDelete() {
  this.pendingDeleteId = undefined;
  this.showConfirm = false;
}

confirmDelete() {
  if (!this.pendingDeleteId) return;

  const token = localStorage.getItem('token') || '';
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.delete(`${this.apiUrl}/history/${this.pendingDeleteId}`, { headers })
    .subscribe({
      next: () => {
        this.history = this.history.filter(h => h.id !== this.pendingDeleteId);
        if (this.selectedChat?.id === this.pendingDeleteId) this.newChat();
        this.cancelDelete();
      },
      error: () => {
        alert('No se pudo eliminar el historial');
        this.cancelDelete();
      }
    });
}

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.selectedImageFile = file;
    
    const reader = new FileReader();
    reader.onload = e => {
      this.selectedImagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    this.removeImage();
  }
}

removeImage() {
  this.selectedImageFile = null;
  this.selectedImagePreview = null;
}

}

