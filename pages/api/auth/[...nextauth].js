import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import mongoose from "mongoose";
import User from "@/models/User";

// DB 연결 함수 (에러 방지용 패턴)
async function connectToDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.response.id,
          name: profile.response.nickname || profile.response.name || "네이버 사용자",
          email: profile.response.email ?? `${profile.response.id}@naver.com`,
          image: profile.response.profile_image ?? null,
        };
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.kakao_account?.profile?.nickname || "카카오 사용자",
          email: profile.kakao_account?.email ?? `${profile.id}@kakao.com`,
          image: profile.kakao_account?.profile?.profile_image_url ?? null,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // 최초 로그인시만 user DB 저장
      if (account && profile) {
        token.id = profile.id;
        token.email = profile.email ?? `${profile.id}@${account.provider}.com`;
        token.name = profile.name ?? `${account.provider} 사용자`;
        token.picture = profile.image ?? null;
        token.provider = account.provider;

        await connectToDB();
        const exists = await User.findOne({ email: token.email });
        if (!exists) {
          await User.create({
            email: token.email,
            name: token.name,
            image: token.picture,
            provider: token.provider,
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id; // <== token.sub 대신 항상 token.id 사용 (provider마다 다름)
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      return session;
    },
  },
  pages: {
    signIn: "/auth/custom-signin", // 커스텀 로그인 모달
  },
});