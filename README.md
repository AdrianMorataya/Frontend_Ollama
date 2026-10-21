# AI Platform — Frontend

A modern, customizable AI platform built with Angular, providing an interactive conversational experience powered by Ollama models.

<p align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Ollama-262626?style=flat-square&logo=ollama&logoColor=white" alt="Ollama" />
  <img src="https://img.shields.io/badge/License-MIT-6B7280?style=flat-square" alt="MIT License" />
</p>

---

## Overview

**AI Platform** is the frontend of an AI-powered application designed to make interacting with artificial intelligence models intuitive and accessible.

Developed with Angular and TypeScript, the application provides a customizable interface for AI conversations, user account management and personalized experiences.

It communicates with a dedicated backend API that handles authentication, email verification, conversation history and AI-related operations through Ollama.

## Features

- **User authentication:** Registration and login.
- **Email verification:** Account verification using codes sent by email.
- **AI chat interface:** Interact with AI models through a conversational UI.
- **Conversation history:** Access previous messages and conversations.
- **Image AI functionality:** Support for image-related AI features through the backend.
- **Customizable interface:** Personalize the application's appearance.
- **User-specific experience:** Connect interface preferences and account data.
- **REST API integration:** Communicate with backend services.
- **Responsive design:** Support different screen sizes.

## Tech Stack

| Technology | Purpose |
|---|---|
| Angular | Frontend framework |
| TypeScript | Application logic and type safety |
| HTML5 | Interface structure |
| CSS3 | Styling and visual presentation |
| REST API | Communication with backend services |
| Ollama | AI model integration through the backend |

## Architecture

The application follows a client-server architecture that separates the user interface from backend operations and AI inference.

```text
┌─────────────────────────────────┐
│        Angular Frontend         │
│                                 │
│  Chat · Accounts · Preferences  │
└────────────────┬────────────────┘
                 │
                 │ HTTP Requests
                 ▼
┌─────────────────────────────────┐
│         ASP.NET Core API        │
│                                 │
│ Authentication · User Data      │
│ Conversations · AI Requests     │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│             Ollama              │
│                                 │
│       AI Model Inference        │
└─────────────────────────────────┘
```

### Related Backend

The frontend is designed to work with the following backend repository:

[API_Ollama — Backend Repository](https://github.com/AdrianMorataya/API_Ollama)

## Getting Started

### Prerequisites

Before running the application, make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [Angular CLI](https://angular.dev/tools/cli)
- A running instance of the backend API

### Installation

Clone the repository:

```bash
git clone https://github.com/AdrianMorataya/Frontend_Ollama.git
```

Navigate to the project directory:

```bash
cd Frontend_Ollama
```

Install the dependencies:

```bash
npm install
```

### Configuration

Configure the backend API URL in the appropriate Angular environment or service configuration.

Make sure the backend is running and accessible from the frontend. If the API uses a different host or port, update the corresponding configuration before starting the application.

Avoid including credentials, private tokens or other sensitive information in committed configuration files.

### Run the Development Server

Start the Angular development server:

```bash
ng serve
```

Open the application in your browser:

[http://localhost:4200](http://localhost:4200)

The development server automatically reloads when source files change.

## AI Integration

The frontend communicates with the backend API to access AI-powered functionality.

The backend is responsible for processing requests and communicating with Ollama, while the frontend presents the resulting responses and provides the user interaction layer.

To learn more about available models and configuration, visit the [official Ollama documentation](https://docs.ollama.com/).

## Project Goals

This project demonstrates practical experience in:

- Frontend development with Angular and TypeScript
- REST API integration
- Authentication and account verification workflows
- Building conversational AI interfaces
- Managing user-specific experiences
- Integrating frontend applications with AI-powered backend services
- Developing modular and maintainable web applications

## Developer

**Steven Adrian Soto Morataya**

Computer Science and Systems Engineering Student | Junior Developer

[GitHub Profile](https://github.com/AdrianMorataya)

---

<p align="center">
  <sub>Built with Angular, TypeScript and AI-powered backend services.</sub>
</p>
