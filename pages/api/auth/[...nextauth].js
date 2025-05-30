import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.kakao_account?.profile?.nickname ?? "카카오 사용자",
          email: profile.kakao_account?.email ?? `${profile.id}@kakao.com`,
          image: profile.kakao_account?.profile?.profile_image_url ?? null,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.id;
        token.email = profile.email ?? `${profile.id}@kakao.com`;
        token.name = profile.name ?? "카카오 사용자";
        token.picture = profile.image ?? null;
      }
      return token;
    },
  },
});
