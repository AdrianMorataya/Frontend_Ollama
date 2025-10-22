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


  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
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
