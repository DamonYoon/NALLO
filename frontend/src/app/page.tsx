import { redirect } from "next/navigation";

export default function Home() {
  // 사용자 모드 홈으로 리다이렉트 (문서 탐색)
  redirect("/docs");
}
