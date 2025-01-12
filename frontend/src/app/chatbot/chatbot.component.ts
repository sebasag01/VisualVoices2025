import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-chatbot',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isChatOpen = false;

  constructor(private renderer: Renderer2) {}

  toggleChatbot() {
    this.isChatOpen = !this.isChatOpen;

    if (this.isChatOpen) {
      const chatbotContainer = document.getElementById('chatbot');
      if (chatbotContainer && !chatbotContainer.querySelector('df-messenger')) {
        const dfMessenger = this.renderer.createElement('df-messenger');
        this.renderer.setAttribute(dfMessenger, 'intent', 'WELCOME');
        this.renderer.setAttribute(dfMessenger, 'chat-title', 'MANOlo');
        this.renderer.setAttribute(dfMessenger, 'agent-id', '2faf7558-0b47-4132-8b38-a0f11b4e1ac2');
        this.renderer.setAttribute(dfMessenger, 'language-code', 'es');
        this.renderer.appendChild(chatbotContainer, dfMessenger);
      }
    }
  }
}
