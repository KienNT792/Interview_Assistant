# 🎯 AI Interviewer Pro - Refactored Architecture

## 📁 Cấu trúc Dự án Mới

```
Interview_Assistant/
├── components/
│   ├── common/                    # Shared components
│   │   ├── Button.tsx            # Reusable button with variants
│   │   └── LoadingSpinner.tsx    # Loading spinner component
│   │
│   ├── SetupPhase/               # Setup phase components
│   │   └── index.tsx             # Main setup component
│   │
│   ├── LiveInterview/            # Live interview components
│   │   ├── index.tsx             # Main orchestrator (110 lines)
│   │   ├── InterviewHeader.tsx   # Header with status
│   │   ├── AIAvatar.tsx          # Avatar with visualizer
│   │   ├── TranscriptPanel.tsx   # Transcript sidebar
│   │   └── InterviewControls.tsx # Mic controls
│   │
│   └── ReportPhase/              # Report phase components
│       ├── index.tsx             # Main report component (80 lines)
│       ├── ScoreCard.tsx         # Score display
│       ├── StrengthsWeaknesses.tsx # Strengths/weaknesses
│       └── DetailedAnalysis.tsx  # Detailed analysis
│
├── hooks/                        # Custom React hooks
│   ├── useTranscript.ts         # Transcript management
│   ├── useAudioRecording.ts     # Audio input logic
│   ├── useAudioPlayback.ts      # Audio output logic
│   └── useGeminiLive.ts         # Gemini Live API
│
├── constants/                    # Constants and config
│   └── sampleData.ts            # Sample JD/CV data
│
├── services/                     # API services
│   └── gemini-service.ts        # Gemini API calls
│
├── utils/                        # Utility functions
│   └── audio-utils.ts           # Audio processing
│
├── types.ts                      # TypeScript types
├── App.tsx                       # Main app component
├── index.tsx                     # Entry point
├── vite-env.d.ts                # Vite type declarations
└── vite.config.ts               # Vite configuration

```

## 🎨 Cải tiến So với Trước

### Before Refactoring:

- ❌ **LiveInterview.tsx**: 375 dòng (quá dài, khó maintain)
- ❌ **ReportPhase.tsx**: 162 dòng (chứa cả logic lẫn UI)
- ❌ **SetupPhase.tsx**: 105 dòng (tương đối OK)
- ❌ Logic và UI lẫn lộn trong cùng file
- ❌ Khó test từng phần riêng biệt
- ❌ Duplicate code (loading spinner, button styles)

### After Refactoring:

- ✅ **LiveInterview/index.tsx**: ~110 dòng (giảm 70%)
- ✅ **ReportPhase/index.tsx**: ~80 dòng (giảm 50%)
- ✅ **SetupPhase/index.tsx**: ~85 dòng (giảm 20%)
- ✅ Logic tách riêng vào custom hooks
- ✅ UI components nhỏ, dễ test
- ✅ Reusable components (Button, LoadingSpinner)
- ✅ Dễ dàng thêm features mới

## 🔧 Custom Hooks

### 1. `useTranscript`

Quản lý transcript của cuộc phỏng vấn

```typescript
const {
  transcript,
  addInputText,
  addOutputText,
  commitTranscriptions,
  clearCurrentTranscriptions,
} = useTranscript();
```

### 2. `useAudioRecording`

Xử lý audio input từ microphone

```typescript
const {
  volume,
  isMicOn,
  initializeMicrophone,
  setupAudioProcessing,
  toggleMic,
  cleanup,
} = useAudioRecording();
```

### 3. `useAudioPlayback`

Xử lý audio output từ AI

```typescript
const { playAudio, clearQueue, cleanup } = useAudioPlayback();
```

### 4. `useGeminiLive`

Kết nối và giao tiếp với Gemini Live API

```typescript
const { isConnected, connect, sendAudioData, disconnect } = useGeminiLive({
  analysis,
  onInputTranscription,
  onOutputTranscription,
  onTurnComplete,
  onInterruption,
  onAudioData,
});
```

## 📦 Reusable Components

### Button Component

```tsx
<Button
  variant="primary" // primary | secondary | danger
  size="lg" // sm | md | lg
  isLoading={false}
  onClick={handleClick}
>
  Click Me
</Button>
```

### LoadingSpinner Component

```tsx
<LoadingSpinner size="md" message="Loading..." submessage="Please wait" />
```

## 🚀 Lợi ích của Cấu trúc Mới

### 1. **Maintainability** (Dễ bảo trì)

- Mỗi file có trách nhiệm rõ ràng
- Dễ tìm và sửa bugs
- Code ngắn gọn, dễ đọc

### 2. **Testability** (Dễ test)

- Hooks có thể test riêng biệt
- Components nhỏ, dễ viết unit tests
- Mock dependencies dễ dàng

### 3. **Reusability** (Tái sử dụng)

- Common components dùng chung
- Hooks có thể dùng ở nhiều nơi
- Constants tập trung

### 4. **Scalability** (Mở rộng)

- Dễ thêm features mới
- Không ảnh hưởng code cũ
- Tách biệt concerns

### 5. **Developer Experience**

- TypeScript types đầy đủ
- Auto-complete tốt hơn
- Dễ onboard developers mới

## 🔄 Migration Guide

Nếu bạn đang sử dụng code cũ, đây là cách migrate:

### Old Import:

```typescript
import { SetupPhase } from "./components/SetupPhase";
import { LiveInterview } from "./components/LiveInterview";
import { ReportPhase } from "./components/ReportPhase";
```

### New Import (Giống nhau!):

```typescript
import { SetupPhase } from "./components/SetupPhase";
import { LiveInterview } from "./components/LiveInterview";
import { ReportPhase } from "./components/ReportPhase";
```

**Không cần thay đổi code trong App.tsx!** Chỉ cần thay thế files cũ bằng files mới.

## 🔐 Environment Variables

### Old (.env):

```
GEMINI_API_KEY='your-key-here'
```

### New (.env):

```
VITE_GEMINI_API_KEY='your-key-here'
```

**Lưu ý:** Phải có prefix `VITE_` để Vite expose biến môi trường ra client.

### Usage:

```typescript
// Old
const API_KEY = process.env.API_KEY;

// New
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

## 📝 Best Practices

1. **Component Organization**

   - Mỗi component trong folder riêng
   - File `index.tsx` là entry point
   - Sub-components trong cùng folder

2. **Hook Organization**

   - Mỗi hook một file riêng
   - Tên hook bắt đầu với `use`
   - Return object với named exports

3. **Type Safety**

   - Luôn define interfaces cho props
   - Sử dụng TypeScript strict mode
   - Export types từ `types.ts`

4. **File Naming**
   - Components: PascalCase (Button.tsx)
   - Hooks: camelCase (useTranscript.ts)
   - Utils: camelCase (audio-utils.ts)
   - Constants: camelCase (sampleData.ts)

## 🐛 Debugging

### Check Component Hierarchy:

```
App
├── SetupPhase
├── LiveInterview
│   ├── InterviewHeader
│   ├── AIAvatar
│   ├── TranscriptPanel
│   └── InterviewControls
└── ReportPhase
    ├── ScoreCard
    ├── StrengthsWeaknesses
    └── DetailedAnalysis
```

### Check Hook Dependencies:

```
LiveInterview
├── useTranscript
├── useAudioRecording
├── useAudioPlayback
└── useGeminiLive
```

## 📚 Next Steps

### Recommended Improvements:

1. ✅ Add unit tests (Jest/Vitest)
2. ✅ Add error boundaries
3. ✅ Add logging service
4. ✅ Add analytics
5. ✅ Add i18n support
6. ✅ Add accessibility (ARIA labels)
7. ✅ Add Storybook for components
8. ✅ Add E2E tests (Playwright)

## 🤝 Contributing

Khi thêm features mới:

1. Tạo component mới trong folder phù hợp
2. Tạo hook nếu cần logic phức tạp
3. Update types.ts nếu cần types mới
4. Update README.md

## 📄 License

MIT

---

**Refactored by:** Antigravity AI  
**Date:** 2025-11-28  
**Version:** 2.0.0
