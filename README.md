# CallNotes — Transcription et analyse IA de vos appels commerciaux

> Chaque appel transcrit, résumé et analysé. Plus jamais "j'aurais dû noter ça".

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![Whisper](https://img.shields.io/badge/Whisper-large--v3-yellow?style=flat)](https://openai.com/research/whisper)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.1_70B-FF6B35?style=flat)](https://groq.com)

---

## Vue d'ensemble

CallNotes transcrit les appels commerciaux et de support via Whisper large-v3, extrait automatiquement les éléments clés (résumé, actions suivantes, objections, signaux acheteur), et s'intègre au CRM pour mettre à jour les opportunités après chaque appel. Les managers analysent les patterns de conversion avec des analytics sur les meilleurs appels.

**Domaine :** Sales Productivity / Conversation Intelligence  
**Port VM :** 3011 | **Sous-domaine :** callnotes.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS | Upload audio, notes, analytics appels |
| Backend | FastAPI (Python 3.11), Uvicorn | API transcription, extraction, analytics |
| Transcription | **Whisper large-v3** (via faster-whisper) | STT multilingue |
| LLM | Groq (llama-3.1-70b-versatile) | Extraction structurée + résumé |
| NLP | spaCy | NER : personnes, entreprises, dates, montants |
| Base de données | PostgreSQL 16 | Appels, transcriptions, notes |
| Storage | Minio (S3-compatible) | Stockage fichiers audio |
| Queue | Celery + Redis | Transcription asynchrone |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3011) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
faster-whisper==1.0.1
groq==0.9.0
spacy==3.7.4
celery==5.4.0
redis==5.0.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
pydantic==2.7.1
python-multipart==0.0.9
boto3==1.34.0
```

---

## Architecture mono-repo

```
callnotes/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Liste appels + dashboard
│   │   ├── calls/upload/         # Upload audio
│   │   ├── calls/[id]/           # Transcription + notes extraites
│   │   └── analytics/            # Win/loss analysis, keyword freq
│   └── src/components/
│       ├── AudioUploader.tsx     # Drag-and-drop audio upload
│       ├── TranscriptViewer.tsx  # Transcription avec speaker diarization
│       ├── ExtractedNotes.tsx    # Actions, objections, next steps
│       ├── KeywordCloud.tsx      # Mots-clés fréquents par outcome
│       └── WinLossInsights.tsx   # Patterns appels gagnés vs perdus
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── calls.py          # Upload + CRUD
│   │   │   ├── transcription.py  # POST /transcribe (async)
│   │   │   └── analytics.py      # GET /analytics/patterns
│   │   ├── services/
│   │   │   ├── whisper_engine.py # faster-whisper inference
│   │   │   ├── extractor.py      # Groq extraction structurée
│   │   │   ├── ner.py            # spaCy NER
│   │   │   └── analytics.py      # Patterns win/loss
│   │   └── models/
│   │       ├── call.py
│   │       └── transcript.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#a855f7', 'primaryTextColor': '#fff', 'primaryBorderColor': '#9333ea', 'lineColor': '#374151', 'secondaryColor': '#faf5ff'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3011)"]
        NEXT["Next.js 14\nCall Intelligence"]
        API["FastAPI"]
        CELERY["Celery Worker\nTranscription async"]

        subgraph NLP["🎙️ NLP Pipeline"]
            WHISPER["Whisper large-v3\nSTT + diarization"]
            GROQ["Groq LLM\nExtraction structurée"]
            SPACY["spaCy NER\nEntités nommées"]
        end

        PG[("PostgreSQL\nCalls + Transcripts")]
        MINIO[("Minio S3\nAudio files")]
        REDIS[("Redis\nCelery queue")]
    end

    COMMERCIAL["Commercial"] --> NEXT
    NEXT -- "upload audio" --> MINIO
    MINIO --> CELERY
```

### Séquence — Transcription et extraction d'un appel

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#a855f7', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant USER as Commercial
    participant API as FastAPI
    participant MINIO as Minio S3
    participant CELERY as Celery
    participant WHISPER as Whisper
    participant GROQ as Groq LLM
    participant SPACY as spaCy

    USER->>API: POST /calls/upload (audio.mp3, call_type=demo)
    API->>MINIO: store(audio.mp3)
    MINIO-->>API: s3_key=calls/2024/call_xyz.mp3
    API->>CELERY: enqueue_transcription(call_id, s3_key)
    API-->>USER: {call_id: "c_xyz", status: "processing"}

    CELERY->>WHISPER: transcribe(audio, language=fr, diarize=true)
    WHISPER-->>CELERY: {text, segments, speakers: {SPEAKER_00, SPEAKER_01}}

    CELERY->>GROQ: extract(transcript, schema={summary, actions, objections, signals})
    GROQ-->>CELERY: {summary: "...", next_actions: ["Envoyer démo"], objections: ["Budget"], buyer_signals: ["Intéressé par intégration"]}

    CELERY->>SPACY: ner(transcript)
    SPACY-->>CELERY: {persons: ["Marie Dupont"], companies: ["Acme Corp"], amounts: ["50k€"]}

    CELERY->>API: update_call(call_id, transcript, extracted_notes)
    API-->>USER: WebSocket: {status: "ready", call_id: "c_xyz"}
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#a855f7', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    CALL {
        uuid id PK
        string title
        string call_type
        string s3_key
        int duration_seconds
        string status
        string outcome
        timestamp occurred_at
    }
    TRANSCRIPT {
        uuid id PK
        uuid call_id FK
        text full_text
        jsonb segments
        string language
        float word_error_rate
    }
    EXTRACTED_NOTES {
        uuid id PK
        uuid call_id FK
        text summary
        string[] next_actions
        string[] objections
        string[] buyer_signals
        string[] entities_persons
        string[] entities_companies
        jsonb amounts_mentioned
    }

    CALL ||--o| TRANSCRIPT : "has"
    CALL ||--o| EXTRACTED_NOTES : "analyzed_in"
```

---

## PRD

### Problème
Les commerciaux oublient 40% des détails d'un appel après 24h. Les notes CRM sont incomplètes. Les managers ne peuvent pas identifier ce qui distingue les appels gagnants des perdants sans écouter des heures de contenu.

### Solution
CallNotes transcrit automatiquement chaque appel, extrait les actions suivantes, objections, et signaux d'achat, et alimente le CRM sans effort pour le commercial. Les analytics identifient les patterns linguistiques des appels convertis.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| Commercial | Transcription + résumé automatique, notes CRM sans saisie manuelle |
| Sales Manager | Analytics : quels mots, objections, durée corrèlent avec le closing |
| Enablement | Identifier les meilleurs appels pour la formation |

### OKRs
- 100% des appels transcrits dans les 10 minutes
- Temps de saisie CRM post-appel : -90%
- Identification des patterns gagnants en < 20 appels

---

## User Stories

```
US-01 [Commercial] En tant que commercial,
      je veux uploader l'enregistrement de ma démo
      et recevoir en 5 minutes un résumé + les 3 actions à faire
      afin de ne pas perdre de temps à prendre des notes.

US-02 [Manager] En tant que Sales Manager,
      je veux voir les mots et phrases les plus fréquents dans les appels gagnés vs perdus
      afin d'entraîner mon équipe sur les bons messages.

US-03 [Commercial] En tant que commercial,
      je veux que les objections détectées dans l'appel soient listées
      (prix, timing, concurrent)
      afin de préparer mon follow-up.

US-04 [Enablement] En tant que Sales Enablement,
      je veux identifier les 10 meilleurs appels de l'équipe
      pour en faire des exemples de formation.

US-05 [Commercial] En tant que commercial,
      je veux voir le transcript avec les deux interlocuteurs identifiés
      (moi vs client) séparément
      afin de voir le ratio temps de parole.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Transcription auto | Whisper large-v3 → STT < 5 min pour appel 30 min | ✅ Progress bar |
| R2 | Diarization | 2 locuteurs max identifiés (SPEAKER_00 = vendeur, SPEAKER_01 = client) | ✅ Dual transcript |
| R3 | Extraction LLM | Groq : summary, next_actions (max 5), objections, buyer_signals | ✅ Notes card |
| R4 | Ratio parole | Vendeur doit parler < 50% du temps (bonne pratique) | ✅ Pie chart |
| R5 | Signaux acheteur | "intéressé", "budget disponible", "décision ce trimestre" → flag HIGH | ✅ Signal badges |
| R6 | Rétention audio | Fichiers audio supprimés après 90 jours (RGPD) | ✅ Retention badge |
| R7 | Confidentialité | Transcription anonymisée si client=confidentiel | ✅ Anon toggle |
| R8 | Win/loss link | Appel lié à un deal → outcome mis à jour | ✅ Deal link |
| R9 | Keyword alerts | Mention concurrent connu → alerte manager | ✅ Alert demo |
| R10 | Multi-langue | FR, EN, ES supportés (Whisper multilingual) | ✅ Language badge |

---

## Spécification API

**Base URL :** `http://callnotes.wikolabs.com/api/v1`

### POST /calls/upload
```
Content-Type: multipart/form-data
file: audio.mp3, call_type: demo, deal_id: d_xyz
// Response: {"call_id": "c_xyz", "status": "processing", "eta_seconds": 180}
```

### GET /calls/{id}/notes
```json
// Response: {
//   "summary": "Démo produit pour Acme Corp...",
//   "next_actions": ["Envoyer démo vidéo", "Appel de suivi jeudi"],
//   "objections": ["Budget limité à 30k€"],
//   "buyer_signals": ["Besoin urgent avant Q3"],
//   "talk_ratio": {"seller": 0.42, "buyer": 0.58}
// }
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Audio Uploader** | Drag-and-drop mp3/wav avec barre de progression transcription |
| **Dual Transcript** | Transcription avec colonnes SPEAKER_00 / SPEAKER_01 |
| **Notes Card** | Résumé + actions + objections extraits automatiquement |
| **Talk Ratio Pie** | Pie chart temps de parole vendeur vs client |
| **Win Pattern Cloud** | Nuage de mots : fréquence des termes dans les appels gagnés |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: callnotes, POSTGRES_USER: cn_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  minio:
    image: minio/minio
    command: server /data
    environment: {MINIO_ROOT_USER: "${MINIO_USER}", MINIO_ROOT_PASSWORD: "${MINIO_PASSWORD}"}
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://cn_user:${POSTGRES_PASSWORD}@postgres/callnotes
      GROQ_API_KEY: "${GROQ_API_KEY}"
      MINIO_URL: "http://minio:9000"
    depends_on: [postgres, redis, minio]
    expose: ["8000"]
  worker:
    build: ./backend
    command: celery -A app.worker worker --loglevel=info
    depends_on: [redis]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3011:80"]
volumes:
  pg_data:
  minio_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] Upload audio + transcription Whisper
- [ ] Extraction résumé + actions (Groq)
- [ ] Dashboard appels

### Phase 2 — Intelligence
- [ ] Diarization speaker (SPEAKER_00 / SPEAKER_01)
- [ ] Analytics win/loss patterns
- [ ] CRM sync (NexusCRM)

### Phase 3 — Coaching
- [ ] Score d'appel automatique (best practices)
- [ ] Clips "moments clés" identifiés
- [ ] Coaching suggestions AI par appel

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
