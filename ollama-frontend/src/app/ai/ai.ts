import { Component, AfterViewChecked, ElementRef, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface PromptHistory {
  id: number;
  prompt: string;
  response: string;
  createdAt: string;
  showMenu?: boolean;
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
  showConfirm = false;
  pendingDeleteId?: number;
  sidebarVisible = false;


  private apiUrl = 'http://localhost:5024/api/ollama';
  @ViewChild('responsesContainer') private responsesContainer!: ElementRef;

  constructor(private http: HttpClient) {}

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

  askQuestion() {
    if (!this.prompt.trim()) return;
    this.loading = true;
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.responses.push({ text: this.prompt.split('\n'), sender: 'user' });

    this.http.post<{ response: string }>(`${this.apiUrl}/ask`, { prompt: this.prompt }, { headers })
      .subscribe({
        next: res => {
          this.responses.push({ text: res.response.split('\n'), sender: 'ai' });
          this.prompt = '';
          this.loading = false;
          this.loadHistory();
        },
        error: err => {
          this.errorMessage = err.error || 'Error al consultar la IA';
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
}
