# BriefAI

> AI-powered marketing assistant for Indian small businesses.

**BriefAI** helps small-business owners turn simple product or business information into ready-to-use marketing content for Instagram and WhatsApp, including AI-generated promotional images.

**Live Demo:** https://brief-ai-three.vercel.app

---
## Demo

[Watch the BriefAI MVP Demo](https://lnkd.in/p/gRvdyP6j)

The demo shows the complete campaign-generation flow, from entering product information to receiving AI-generated marketing content and visuals.

## Overview

Small businesses often know their products well but may not have the time, marketing expertise, or design resources to consistently create promotional content.

BriefAI simplifies this process.

Instead of learning prompt engineering, copywriting, design tools, or marketing workflows, a business owner provides basic information about their product.

BriefAI processes that information through an AI workflow and generates:

* Instagram captions
* WhatsApp marketing copy
* AI-generated product visuals
* Campaign records and history
* Optional Instagram publishing

The product is designed as a **mobile-first, multilingual AI marketing assistant for Indian small businesses**.

---

## Product Flow

```text
Business Owner
      │
      │ Product / Business Information
      ▼
Next.js Frontend
      │
      │ HTTP API
      ▼
FastAPI Backend
      │
      ▼
LangGraph Workflow
      │
      ├── Input Parser
      │
      ├── Strategy Planner
      │
      ├── Copy Writer
      │
      ├── Image Prompt Builder
      │
      ├── Quality Checker
      │
      └── Response Compiler
              │
       ┌──────┴────────┐
       ▼               ▼
   AI Provider     Image Generation
   Abstraction          │
       │                │
       ▼                ▼
 Hugging Face       Hugging Face
   Qwen3-14B       FLUX.1-schnell
       │                │
       └───────┬────────┘
               ▼
            Supabase
       ┌───────┴────────┐
       │                │
 PostgreSQL         Storage
       │                │
       └───────┬────────┘
               ▼
       Campaign Result
               │
       ┌───────┴────────┐
       ▼                ▼
   WhatsApp         Instagram
   Content           Content
                         │
                         ▼
                Optional Publishing
```

---

# Core Features

## AI Campaign Generation

BriefAI transforms structured business information into a complete marketing campaign using a LangGraph-based workflow.

The workflow handles:

1. Input understanding
2. Marketing strategy generation
3. Copy generation
4. Image prompt generation
5. Quality checking
6. Campaign compilation and persistence

---

## AI Copy Generation

BriefAI uses a provider abstraction so the application is not permanently coupled to a single AI vendor.

Current architecture:

```text
AIProvider
    │
    ├── HuggingFaceProvider
    │
    └── MistralProvider
```

The active provider is selected through environment configuration.

Current MVP configuration:

```env
AI_PROVIDER=huggingface
HF_PROVIDER=auto
HF_MODEL=Qwen/Qwen3-14B
```

This allows the application to use Hugging Face as the primary text-generation provider while keeping the provider layer extensible.

---

## Instagram Marketing

BriefAI generates Instagram-ready captions based on:

* product
* unique selling proposition
* price
* offer
* target buyer
* location
* occasion
* campaign goal
* requested output language

The application also contains Instagram Graph API integration for optional direct publishing.

Instagram is an **optional capability** and should not block the core campaign-generation workflow.

---

## WhatsApp Marketing

BriefAI generates marketing messages suitable for sharing through WhatsApp.

The output is generated according to the user's selected WhatsApp language and campaign context.

---

## AI Product Images

BriefAI uses Hugging Face for image generation with:

```text
FLUX.1-schnell
```

The image-generation flow is separate from the text-generation provider.

```text
Image Prompt
     │
     ▼
Hugging Face
     │
     ▼
FLUX.1-schnell
     │
     ▼
Image Bytes
     │
     ▼
Supabase Storage
     │
     ▼
Permanent Image URL
```

---

## Campaign History

Generated campaigns are stored in Supabase PostgreSQL.

Campaign records include information such as:

* product
* USP
* price
* offer
* goal
* occasion
* buyer
* location
* output languages
* WhatsApp copy
* Instagram caption
* image URL
* image prompt
* creation timestamp

Users can retrieve their previous campaigns through the backend history API.

---

## Multilingual Experience

BriefAI is designed for Indian users and supports multiple interface languages.

Current UI language architecture includes:

```text
English   → en
Hindi     → hi
Kannada   → kn
Tamil     → ta
Telugu    → te
Marathi   → mr
```

The product keeps three language concepts separate:

```text
appLanguage
whatsappLanguage
instagramLanguage
```

This allows a user to have, for example:

```text
App       → Kannada
WhatsApp  → Kannada
Instagram → English
```

The frontend uses i18next/react-i18next for interface translation.

AI-generated campaign content is generated in the requested output language by the backend rather than being translated by the frontend.

---

# Architecture

BriefAI is structured as a monorepo containing a Next.js frontend and FastAPI backend.

```text
BriefAI/
│
├── frontend/
│   │
│   ├── Next.js
│   ├── TypeScript
│   ├── Zustand
│   ├── TanStack Query
│   └── i18next
│
└── backend/
    │
    ├── FastAPI
    ├── LangGraph
    ├── AI Provider Layer
    │   ├── Hugging Face
    │   └── Mistral adapter
    ├── Hugging Face FLUX
    ├── Supabase
    └── Instagram Graph API
```

---

# Backend Architecture

The backend follows a layered architecture.

```text
FastAPI
   │
   ├── API Routes
   │
   ├── Request / Response Models
   │
   ├── LangGraph Agent
   │
   ├── AI Provider Abstraction
   │
   ├── Application Services
   │
   └── External Integrations
```

## API Layer

FastAPI exposes the application endpoints.

Core endpoints include:

```text
GET  /api/health
POST /api/generate
GET  /api/campaigns/{user_id}
```

Additional authentication and Instagram routes are also included in the backend.

---

## LangGraph Agent

The AI workflow is implemented using LangGraph.

Current workflow:

```text
Input Parser
     │
     ▼
Strategy Planner
     │
     ▼
Copy Writer
     │
     ▼
Image Prompt Builder
     │
     ▼
Quality Checker
     │
     ├── Retry
     │
     └── Pass
           │
           ▼
    Response Compiler
```

The Quality Checker can route failed generations back to the copy-generation stage with a limited retry count.

---

# AI Provider Architecture

One of the important architectural improvements in the current backend is the provider abstraction.

Instead of LangGraph nodes directly depending on a specific AI company, they depend on the common interface:

```text
AIProvider
```

Current implementations:

```text
services/ai/
│
├── base.py
├── factory.py
├── errors.py
├── types.py
│
└── providers/
    ├── huggingface.py
    └── mistral.py
```

Provider selection:

```text
AI_PROVIDER
      │
      ├── huggingface
      │       │
      │       ▼
      │   Qwen3-14B
      │
      └── mistral
              │
              ▼
          Mistral API
```

This makes it possible to change the text-generation provider without rewriting the LangGraph workflow.

### Current MVP

The intended current provider is:

```text
Provider: Hugging Face
Model: Qwen/Qwen3-14B
Provider routing: auto
```

Mistral remains available as another provider implementation but is not the primary MVP configuration.

---

# Image Generation Architecture

Text generation and image generation are deliberately separated.

```text
                    BriefAI
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
       Text Generation      Image Generation
             │                   │
             ▼                   ▼
       AI Provider Layer    Hugging Face
             │                   │
             ▼                   ▼
         Qwen3-14B          FLUX.1-schnell
             │                   │
             └─────────┬─────────┘
                       ▼
                    Campaign
```

This separation allows the text and image models to evolve independently.

---

# Data Architecture

Supabase provides the primary persistence layer.

```text
BriefAI Backend
      │
      ▼
   Supabase
   ┌──────┴──────────┐
   │                 │
   ▼                 ▼
PostgreSQL         Storage
   │                 │
   ▼                 ▼
Campaigns        Campaign Images
Users            Generated Assets
Instagram
Connections
```

PostgreSQL stores structured application data.

Supabase Storage stores generated campaign images.

---

# Instagram Integration

BriefAI uses the **Instagram Graph API** for optional publishing.

High-level flow:

```text
BriefAI
   │
   ▼
Instagram Connection
   │
   ▼
Meta / Instagram Graph API
   │
   ▼
Connected Instagram Account
```

Instagram integration includes backend routes for authentication/connection and posting.

The core campaign-generation experience does not depend on Instagram being connected.

---

# Frontend Architecture

The frontend uses:

```text
Next.js
TypeScript
App Router
Zustand
TanStack Query
i18next
```

The main product journey is:

```text
/
│
├── /language
├── /demo
├── /dashboard
├── /campaign/new
├── /generating
├── /campaign/[id]
├── /history
├── /settings
└── /connect-instagram
```

The frontend follows a feature-oriented architecture.

```text
frontend/
│
├── app/
├── components/
├── features/
├── lib/
├── stores/
├── types/
├── locales/
└── public/
```

### State Management

Frontend state is separated by responsibility.

```text
Local React State
        │
        ├── temporary UI state
        ├── modal state
        └── interaction state
               
Zustand
        │
        ├── campaign workflow
        └── application state

TanStack Query
        │
        ├── campaign history
        ├── server data
        └── Instagram connection state
```

---

# Tech Stack

| Area                 | Technology                            |
| -------------------- | ------------------------------------- |
| Frontend             | Next.js                               |
| Language             | TypeScript                            |
| Frontend State       | Zustand                               |
| Server State         | TanStack Query                        |
| Internationalization | i18next / react-i18next               |
| Backend              | FastAPI                               |
| AI Workflow          | LangGraph 0.2.34                      |
| AI Provider Layer    | Custom provider abstraction           |
| Primary Text Model   | Qwen/Qwen3-14B                        |
| Text AI Provider     | Hugging Face                          |
| Image Model          | FLUX.1-schnell                        |
| Image Provider       | Hugging Face                          |
| Database             | Supabase PostgreSQL                   |
| File Storage         | Supabase Storage                      |
| Authentication       | Supabase Auth / application auth flow |
| Social Integration   | Instagram Graph API                   |
| Frontend Deployment  | Vercel                                |
| Backend Deployment   | Render                                |
| Python               | 3.11.x                                |

---

# Repository Structure

```text
BriefAI/
│
├── backend/
│   │
│   ├── agent/
│   │   ├── graph.py
│   │   ├── state.py
│   │   ├── utils.py
│   │   ├── validators.py
│   │   └── nodes/
│   │       ├── input_parser.py
│   │       ├── strategy_planner.py
│   │       ├── copy_writer.py
│   │       ├── image_prompt_builder.py
│   │       ├── quality_checker.py
│   │       └── response_compiler.py
│   │
│   ├── api/
│   │   ├── generate.py
│   │   ├── campaigns.py
│   │   ├── auth.py
│   │   └── instagram.py
│   │
│   ├── models/
│   │   ├── request.py
│   │   └── response.py
│   │
│   ├── prompts/
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── base.py
│   │   │   ├── factory.py
│   │   │   ├── errors.py
│   │   │   └── providers/
│   │   │       ├── huggingface.py
│   │   │       └── mistral.py
│   │   │
│   │   ├── campaign_service.py
│   │   ├── flux.py
│   │   ├── image_storage.py
│   │   ├── instagram_poster.py
│   │   └── supabase_client.py
│   │
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── stores/
│   ├── types/
│   ├── locales/
│   └── public/
│
├── .gitignore
└── README.md
```

---

# API

## Health Check

```http
GET /api/health
```

Used to verify that the backend service is running.

---

## Generate Campaign

```http
POST /api/generate
```

Generates a complete marketing campaign.

The request includes business/product information and language preferences.

The response contains:

```text
campaign_id
whatsapp_copy
instagram_caption
image_url
tone
campaign_angle
```

---

## Campaign History

```http
GET /api/campaigns/{user_id}
```

Returns campaigns associated with the requested user identifier.

---

## API Documentation

When running locally, FastAPI provides interactive API documentation:

```text
http://localhost:8000/docs
```

---

# Environment Configuration

Never commit real API keys or secrets to GitHub.

The backend uses environment variables for external services.

Example:

```env
APP_NAME=BriefAI
ENVIRONMENT=development
DEBUG=false

AI_PROVIDER=huggingface

HUGGINGFACE_API_TOKEN=your_token_here
HF_PROVIDER=auto
HF_MODEL=Qwen/Qwen3-14B

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_STORAGE_BUCKET=your_bucket

META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
INSTAGRAM_USER_ID=your_instagram_user_id
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
META_REDIRECT_URI=your_redirect_uri

FRONTEND_URL=http://localhost:3000
```

The exact environment variables should be kept synchronized with the backend configuration.

Secrets must never be committed.

---

# Local Development

## Prerequisites

Install:

* Python 3.11+
* Node.js
* npm
* Git
* Supabase project
* Hugging Face account/API token
* Meta developer configuration if Instagram integration is required

---

## Clone

```bash
git clone https://github.com/Balraj-ai-automations/BriefAI.git
cd BriefAI
```

---

## Backend

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables.

Start FastAPI:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

for local development.

---

# MVP Status

## Core Product

* [x] Next.js frontend
* [x] FastAPI backend
* [x] LangGraph workflow
* [x] AI provider abstraction
* [x] Hugging Face text-generation provider
* [x] Qwen3-14B model configuration
* [x] Mistral provider adapter
* [x] AI campaign strategy generation
* [x] Instagram caption generation
* [x] WhatsApp copy generation
* [x] Hugging Face FLUX image generation
* [x] Supabase PostgreSQL persistence
* [x] Supabase Storage integration
* [x] Campaign history API
* [x] Instagram Graph API integration
* [x] Multilingual frontend architecture
* [x] Mobile-first frontend architecture

## Reliability / Production Hardening

* [ ] Final end-to-end production testing
* [ ] Automated CI pipeline
* [ ] Complete API contract documentation
* [ ] Production security review
* [ ] Improved observability
* [ ] Production analytics
* [ ] Complete authentication/user ownership verification
* [ ] Final Instagram production verification

---

# Current MVP Scope

The MVP focuses on one core workflow:

```text
Describe Product
       ↓
Generate Campaign
       ↓
Get Marketing Copy
       +
Get AI Product Image
       ↓
Save Campaign
       ↓
Copy / Use Content
       ↓
Optional Instagram Publishing
```

The MVP intentionally does not attempt to be a complete marketing automation platform.

---

# Known Limitations

BriefAI depends on external AI and platform services.

Generation can be affected by:

* provider availability
* model availability
* rate limits
* network failures
* third-party API changes
* image-generation failures
* Instagram/Meta API restrictions

Instagram publishing additionally requires the correct Meta application configuration, permissions, account setup, and access tokens.

The current project is an MVP and is still undergoing production hardening.

---

# Roadmap

## Next

* Production authentication hardening
* Automated CI
* Better error handling and recovery
* Observability and logging
* API documentation
* Improved campaign history
* Production Instagram verification

## Future

### Marketing Automation

* Campaign scheduling
* Recurring campaigns
* Marketing calendar
* Campaign analytics

### Social Platforms

* Facebook
* LinkedIn
* Additional publishing integrations

### AI

* Multiple model providers
* Model fallback
* Campaign regeneration
* Better campaign personalization
* Business-specific AI memory

### Business Intelligence

* Campaign performance analytics
* Engagement tracking
* Content recommendations
* Business insights

---

# Design Principles

BriefAI follows these product principles:

### 1. Simple Input

Business owners should not need marketing or AI expertise.

### 2. Actionable Output

Generated content should be immediately usable.

### 3. Mobile First

The primary experience is designed around mobile users.

### 4. Multilingual by Design

Indian language support is part of the product architecture rather than an afterthought.

### 5. Provider Independence

The application should not be tightly coupled to one AI provider.

### 6. AI Behind the Scenes

Users should benefit from AI without needing to understand models, prompts, or infrastructure.

### 7. Graceful Failure

A failure in an optional integration such as Instagram should not unnecessarily prevent campaign generation.

### 8. Maintainable Architecture

AI-generated code must still follow clear separation of:

```text
UI
↓
Features
↓
API Layer
↓
Backend
↓
AI / External Services
```

---

# Security Principles

BriefAI follows basic security practices for an MVP:

* API keys are stored in environment variables
* Secrets are not committed to source control
* Frontend should never contain private backend credentials
* Instagram credentials are handled through backend integration
* Supabase credentials are separated between client and server responsibilities
* External AI providers are accessed through backend services
* User/campaign ownership requires further production verification before the system is considered fully hardened

---

# Project Status

BriefAI is an actively developed MVP.

The current system demonstrates an end-to-end AI marketing workflow:

```text
User
 ↓
Frontend
 ↓
FastAPI
 ↓
LangGraph
 ↓
AI Provider
 ↓
Qwen3-14B
 ↓
Marketing Content

and

LangGraph
 ↓
Image Prompt
 ↓
Hugging Face
 ↓
FLUX.1-schnell
 ↓
Supabase Storage
 ↓
Campaign Image
```

The project is currently focused on completing the final production-hardening work required to turn the MVP into a more reliable production application.

---

# Author

**Balraj Srinivas**

AI Developer focused on:

* Generative AI
* AI automation
* Agentic AI
* AI SaaS products
* AI-powered applications

GitHub: https://github.com/Balraj-ai-automations

LinkedIn: https://www.linkedin.com/in/balraj-s-ai/

---

# License

License terms have not yet been finalized.
