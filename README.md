# ✈️ Spontany - 감성 기반 즉흥 여행 매칭 서비스

**Spontany**는 감정, 예산, 출발지를 기반으로 나와 잘 맞는 여행 메이트를 매칭해주는 즉흥 여행 웹서비스입니다.  
GPT 기반의 감성 문장, 도시 추천, 프리미엄 매칭 기능까지 탑재된 1인 풀스택 프로젝트입니다.

---

## 🌟 주요 기능

- 🎭 **감정 기반 여행 추천** (GPT 연동)
- 🌍 **Pexels 이미지 API로 도시 이미지 실시간 제공**
- 🧳 **출발지 / 예산 / 동행자 정보 입력**
- ⚡ **랜덤 매칭 및 대기열 기반 자동 매칭 시스템**
- 💬 **매칭 시 채팅방 자동 생성 (예정)**
- 🛡️ **NextAuth 기반 인증 시스템 (예정)**
- 💳 **Toss Payments API 통한 프리미엄 결제 기능**
- 🧠 **MongoDB Atlas 기반 데이터 관리**

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 15 (Pages Router), React, Styled-components |
| 백엔드 API | Vercel Serverless Functions (`/pages/api/*.js`) |
| DB | MongoDB Atlas |
| 인증 | NextAuth (JWT, 예정) |
| 결제 | Toss Payments API |
| AI | OpenAI GPT API |
| 기타 API | Pexels, Tequila(Kiwi.com) 등 |
| 배포 | Vercel |