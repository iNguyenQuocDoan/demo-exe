import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Calculator,
  CheckCircle2,
  Clock,
  Code2,
  FlaskConical,
  GraduationCap,
  Languages,
  Landmark,
  Leaf,
  Search,
  Shield,
  Star,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HomeAnimations } from "@/components/home/HomeAnimations";
import Aurora from "@/components/Aurora";
import LightRays from "@/components/LightRays";
import Magnet from "@/components/Magnet";
import ShinyText from "@/components/ShinyText";
import SpotlightCard from "@/components/SpotlightCard";
import Particles from "@/components/Particles";
import ClickSpark from "@/components/ClickSpark";
import AnimatedBlobs from "@/components/AnimatedBlobs";
import TiltedCard from "@/components/TiltedCard";
import HeroHeadline from "@/components/home/HeroHeadline";
import SubjectsCarousel from "@/components/home/SubjectsCarousel";
import { StaggerGroup, RevealItem, RevealOnView, fadeLeft } from "@/components/motion/ScrollReveal";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  // Trang chủ tự trỏ canonical về gốc; tiêu đề dùng mặc định ở root layout.
  alternates: { canonical: "/" },
};

/* ─── Static data ──────────────────────────────────────────────────────────── */
/* Hero decorative floating dots — animated by GSAP via .ha-floating-shape selector */
const FLOATING_SHAPES: { top: string; left: string; size: number; color: string }[] = [
  { top: "20%", left: "8%",  size: 6, color: "oklch(0.85 0.18 70 / 0.45)" },
  { top: "70%", left: "12%", size: 4, color: "oklch(0.92 0.05 250 / 0.5)" },
  { top: "35%", left: "55%", size: 5, color: "oklch(0.85 0.18 70 / 0.4)" },
  { top: "80%", left: "48%", size: 3, color: "oklch(0.92 0.05 250 / 0.55)" },
  { top: "15%", left: "75%", size: 4, color: "oklch(0.85 0.18 70 / 0.45)" },
];

/* Giá trị cốt lõi (định tính — không phải số liệu live) */
const HIGHLIGHTS = [
  { title: "Gia sư đã xác minh", desc: "Hồ sơ, bằng cấp và kinh nghiệm được kiểm duyệt trước khi lên sàn.", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  { title: "Lịch trống thực tế", desc: "Xem đúng khung giờ gia sư còn rảnh và đặt buổi học phù hợp.", icon: Clock, color: "text-success", bg: "bg-success/10" },
  { title: "Thanh toán bảo chứng", desc: "Tiền giữ trong ví, chỉ chuyển cho gia sư sau khi buổi học hoàn thành.", icon: Shield, color: "text-warning", bg: "bg-warning/10" },
  { title: "Đánh giá minh bạch", desc: "Phản hồi từ phụ huynh gắn với buổi học thật, không chỉnh sửa.", icon: Star, color: "text-accent", bg: "bg-accent/10" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tìm gia sư phù hợp",
    desc: "Lọc theo quận, môn học, mức phí và hình thức dạy online/offline.",
    icon: Search,
    color: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/15",
    image: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&q=80&auto=format&fit=crop",
  },
  {
    step: "02",
    title: "Xem lịch trống",
    desc: "Chọn slot còn trống theo tuần để khớp thời gian của gia đình bạn.",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/8",
    border: "border-amber-400/20",
    image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80&auto=format&fit=crop",
  },
  {
    step: "03",
    title: "Đặt buổi học nhanh",
    desc: "Đặt buổi học trả phí và bắt đầu ngay với lịch định kỳ linh hoạt.",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/8",
    border: "border-emerald-400/20",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80&auto=format&fit=crop",
  },
];

const SUBJECTS: { id: string; label: string; icon: LucideIcon; color: string; bg: string; image: string }[] = [
  { id: "math", label: "Toán học", icon: Calculator, color: "text-primary", bg: "bg-primary/8",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80&auto=format&fit=crop" },
  { id: "english", label: "Tiếng Anh", icon: Languages, color: "text-sky-500", bg: "bg-sky-500/8",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80&auto=format&fit=crop" },
  { id: "physics", label: "Vật lý", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/8",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&q=80&auto=format&fit=crop" },
  { id: "chem", label: "Hóa học", icon: FlaskConical, color: "text-purple-500", bg: "bg-purple-500/8",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80&auto=format&fit=crop" },
  { id: "bio", label: "Sinh học", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/8",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80&auto=format&fit=crop" },
  { id: "lit", label: "Ngữ văn", icon: BookMarked, color: "text-rose-500", bg: "bg-rose-500/8",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80&auto=format&fit=crop" },
  { id: "hist", label: "Lịch sử", icon: Landmark, color: "text-orange-500", bg: "bg-orange-500/8",
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=600&q=80&auto=format&fit=crop" },
  { id: "it", label: "Lập trình", icon: Code2, color: "text-indigo-500", bg: "bg-indigo-500/8",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&auto=format&fit=crop" },
];

const PLATFORM_FEATURES = [
  {
    title: "Ví bảo đảm thanh toán",
    desc: "Tiền giữ trong ví LIFLOW, chỉ chuyển cho gia sư sau buổi học hoàn thành. Huỷ lịch được hoàn tiền tự động.",
    icon: Shield,
    bg: "bg-primary/8",
    iconColor: "text-primary",
    border: "border-primary/12",
    image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&q=80&auto=format&fit=crop",
  },
  {
    title: "Lịch trống thời gian thực",
    desc: "Xem chính xác khi nào gia sư rảnh. Chọn slot, xác nhận chi phí và bắt đầu trong vài phút.",
    icon: Clock,
    bg: "bg-amber-500/8",
    iconColor: "text-amber-500",
    border: "border-amber-400/15",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80&auto=format&fit=crop",
  },
  {
    title: "Gia sư kiểm duyệt nghiêm ngặt",
    desc: "Mọi gia sư đều qua quy trình xét hồ sơ, xác minh bằng cấp và đánh giá thực tế trước khi được chấp thuận.",
    icon: GraduationCap,
    bg: "bg-emerald-500/8",
    iconColor: "text-emerald-500",
    border: "border-emerald-400/15",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&auto=format&fit=crop",
  },
];

/* Cam kết nền tảng (định tính — không phải lời chứng thực bịa) */
const COMMITMENTS = [
  {
    icon: GraduationCap,
    title: "Kiểm duyệt gia sư nghiêm ngặt",
    desc: "Mọi gia sư phải qua xét duyệt hồ sơ và xác minh bằng cấp trước khi được nhận học viên trên LIFLOW.",
  },
  {
    icon: Shield,
    title: "Thanh toán được bảo vệ",
    desc: "Học phí giữ trong ví LIFLOW và chỉ chuyển cho gia sư sau khi buổi học hoàn thành. Huỷ lịch được hoàn tiền tự động.",
  },
  {
    icon: Star,
    title: "Đánh giá minh bạch",
    desc: "Đánh giá chỉ đến từ phụ huynh đã hoàn thành buổi học thật, gắn với hồ sơ gia sư và không bị chỉnh sửa.",
  },
];

const FAQ = [
  { q: "LIFLOW có bảo đảm chất lượng gia sư không?", a: "Có. Mọi gia sư trải qua quy trình duyệt hồ sơ, xác minh bằng cấp và thử nghiệm trực tuyến trước khi được chấp thuận. Hồ sơ hiển thị rating & số buổi thực tế." },
  { q: "LIFLOW có buổi học thử miễn phí không?", a: "Không. LIFLOW chỉ hỗ trợ các buổi học trả phí để đảm bảo cam kết từ cả hai phía và chất lượng buổi học." },
  { q: "Thanh toán được bảo vệ như thế nào?", a: "Tiền được giữ trong ví LIFLOW và chỉ chuyển cho gia sư sau khi buổi học hoàn thành. Nếu gia sư huỷ, tiền hoàn tự động về ví của bạn." },
  { q: "Làm sao để biết slot nào còn trống?", a: "Trang chi tiết gia sư hiển thị lịch trống theo ngày/tuần cập nhật liên tục — chỉ cần chọn slot phù hợp và xác nhận." },
  { q: "Tôi có thể đặt lịch định kỳ hàng tuần không?", a: "Có. Bạn có thể đặt series định kỳ (vd: Thứ 2 & 4, 19h–20h30) với thanh toán gộp hoặc từng buổi." },
  { q: "Gia sư muốn đăng ký thì làm thế nào?", a: "Nhấp 'Đăng ký làm gia sư', điền hồ sơ, tải lên bằng cấp và chờ đội kiểm duyệt phê duyệt (thường 1-2 ngày làm việc)." },
];

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="bg-(--bg-app)">
      <JsonLd data={faqJsonLd(FAQ)} />
      <div id="scroll-progress" />
      <HomeAnimations />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — compact, content-first, image hugs right
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-mesh-hero noise-overlay text-white">
        <div className="absolute inset-0 pointer-events-none opacity-55">
          <Aurora
            colorStops={["#0EA5E9", "#F59E0B", "#60A5FA"]}
            amplitude={1.18}
            blend={0.5}
            speed={0.75}
          />
        </div>
        <LightRays className="opacity-90" intensity="strong" />

        <Particles
          color="oklch(0.95 0.04 70 / 0.9)"
          size={1.8}
          maxOpacity={0.75}
          speed={22}
        />

        <div className="hero-ambient-light" />

        <div
          className="ha-hero-parallax absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            opacity: 0.22,
          }}
        />

        <div className="ha-floating-shapes absolute inset-0 pointer-events-none overflow-hidden hidden md:block" aria-hidden="true">
          {FLOATING_SHAPES.map((s, i) => (
            <span
              key={i}
              className="ha-floating-shape absolute rounded-full"
              style={{
                top: s.top,
                left: s.left,
                width: `${s.size}px`,
                height: `${s.size}px`,
                background: s.color,
                boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
              }}
            />
          ))}
        </div>

        <div className="site-container relative z-10 grid max-w-[1280px] grid-cols-1 items-center gap-7 py-8 sm:py-10 lg:grid-cols-12 lg:gap-10 lg:py-12 xl:py-14">

          {/* ── Left: Content (col-span-7) ── */}
          <div className="ha-hero flex flex-col gap-4 lg:col-span-7 xl:gap-5">

            <HeroHeadline />

            {/* Descriptive */}
            <p
              className="max-w-2xl text-white/76 leading-relaxed"
              style={{
                fontSize: "clamp(1rem, 0.32vw + 0.94rem, 1.14rem)",
              }}
            >
              Lọc theo môn học, khu vực và lịch rảnh thực tế. Xem hồ sơ đã xác minh,
              đặt buổi học và theo dõi tiến độ trong một luồng rõ ràng.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <ClickSpark sparkColor="oklch(0.85 0.18 70)" sparkCount={12}>
                <Magnet>
                  <Link
                    href="/tutors"
                    className="btn-primary-cta group inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold text-white select-none transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                  >
                    <Search className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
                    Tìm gia sư ngay
                  </Link>
                </Magnet>
              </ClickSpark>
              <ClickSpark sparkColor="oklch(0.92 0.05 250)" sparkCount={10}>
                <Magnet strength={0.12} maxOffset={8}>
                  <Link
                    href="/apply-tutor"
                    className="btn-ghost-hero inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-white/92 select-none transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                  >
                    <GraduationCap className="h-5 w-5 shrink-0" />
                    Trở thành gia sư
                  </Link>
                </Magnet>
              </ClickSpark>
            </div>

            {/* Trust signals */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm text-white/58"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-amber-300/80" />
                Ví bảo đảm
              </span>
              <span className="inline-block w-px h-3 bg-white/15" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-300/80" />
                Gia sư xác thực
              </span>
              <span className="inline-block w-px h-3 bg-white/15" />
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-300/80" />
                Đặt lịch nhanh
              </span>
            </div>
          </div>

          {/* ── Right: Hero image (col-span-5, ngang 4/3) ── */}
          <div className="ha-hero-card lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto lg:mr-0">
              {/* Frame chứa ảnh (overflow:hidden — chỉ ảnh + overlays) */}
              <div className="hero-image-frame aspect-[3/2]">
                <Image
                  src="/landing.jpg"
                  alt="Gia sư dạy học cùng học sinh"
                  fill
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/72 via-slate-950/10 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-amber-400/16" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-y border-primary/10 bg-linear-to-b from-white to-secondary/45">
        <AnimatedBlobs />
        <Particles
          color="oklch(0.5 0.15 250 / 0.55)"
          size={1.4}
          maxOpacity={0.45}
          speed={14}
        />
        <div className="site-container relative max-w-[1280px] py-7 lg:py-8" style={{ zIndex: 1 }}>
          <StaggerGroup className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {HIGHLIGHTS.map(({ title, desc, icon: Icon, color, bg }) => (
              <RevealItem key={title}>
                <TiltedCard
                  maxTilt={6}
                  scale={1.03}
                  className="group h-full rounded-2xl border border-border/70 bg-card/90 p-4 text-left shadow-sm shadow-slate-950/3 hover:border-primary/30 hover:shadow-lg hover:bg-card cursor-default"
                >
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className={`${color} transition-transform duration-300`} style={{ width: "1.125rem", height: "1.125rem" }} />
                  </div>
                  <div className="text-sm font-bold leading-tight text-foreground">{title}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{desc}</p>
                </TiltedCard>
              </RevealItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════════════════ */}
      <Section id="how-it-works" className="bg-muted/25">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Bắt đầu chỉ với{" "}
            <span className="text-gradient-primary">3 bước</span>
          </h2>
          <p className="text-muted-foreground max-w-[50ch] mx-auto text-sm sm:text-base leading-relaxed">
            Từ tìm kiếm đến buổi học đầu tiên chỉ mất vài phút.
          </p>
        </div>
        <StaggerGroup
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
          amount={0.05}
        >
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color, bg, border, image }) => (
            <RevealItem key={step}>
              <div
                className={`h-full rounded-2xl border bg-card text-card-foreground shadow-sm ${border} overflow-hidden`}
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, oklch(0.18 0.02 250 / 0.65) 0%, transparent 50%)",
                    }}
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} border ${border} backdrop-blur-md bg-white/90`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <span className="rounded-md bg-black/40 backdrop-blur-md px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-white/90">
                      Bước {step}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5 pt-4">
                  <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </CardContent>
              </div>
            </RevealItem>
          ))}
        </StaggerGroup>
        <div className="text-center mt-8">
          <Button size="default" variant="outline" className="gap-2 btn-shimmer hover:border-primary/50 transition-all duration-300" asChild>
            <Link href="/tutors">
              Bắt đầu tìm gia sư <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          SUBJECTS — infinite marquee
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="overflow-hidden bg-card border-y border-border section-space">
        {/* Header inside container */}
        <div className="site-container">
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Tìm gia sư theo{" "}
                <span className="text-gradient-primary">môn học</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Di chuột để dừng — click để xem gia sư từng môn
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary hidden sm:flex text-sm" asChild>
              <Link href="/tutors">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden py-2">
          <SubjectsCarousel
            subjects={SUBJECTS.map((s) => ({
              id: s.id,
              label: s.label,
              image: s.image,
            }))}
          />
        </div>

        <div className="site-container mt-6 text-center sm:hidden">
          <Button variant="ghost" size="sm" className="gap-1 text-primary text-sm" asChild>
            <Link href="/tutors">Xem tất cả môn <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PLATFORM FEATURES
          ══════════════════════════════════════════════════════════════════════ */}
      <Section className="relative overflow-hidden">
        <AnimatedBlobs
          blobs={[
            { top: "10%", left: "82%", size: 420, color: "oklch(0.78 0.16 245 / 0.16)", duration: 20 },
            { top: "60%", left: "-5%", size: 380, color: "oklch(0.82 0.14 70 / 0.14)",  duration: 24, delay: 5 },
          ]}
        />
        <div className="space-y-10 relative" style={{ zIndex: 1 }}>
          <RevealOnView variant={fadeLeft} className="max-w-xl space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Thanh toán an toàn.{" "}
              <span className="text-gradient-primary">Gia sư uy tín.</span>
              <br className="hidden sm:block" />
              Lịch học linh hoạt.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[58ch]">
              LIFLOW xây dựng hệ thống đặt gia sư với quy trình kiểm duyệt nghiêm
              ngặt và ví bảo đảm — tiền chỉ rời ví khi buổi học hoàn thành.
            </p>
          </RevealOnView>

          <StaggerGroup className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLATFORM_FEATURES.map((feature) => (
              <RevealItem key={feature.title}>
                <SpotlightCard
                  spotlightColor="oklch(0.74 0.18 70 / 0.16)"
                  className={`h-full rounded-2xl border bg-card text-card-foreground shadow-sm ${feature.border} card-lift group overflow-hidden p-0 transition-all duration-300 hover:shadow-xl hover:border-primary/30`}
                >
                {/* Image banner */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Tint overlay using feature accent color */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, oklch(0.18 0.02 250 / 0.25) 0%, oklch(0.18 0.02 250 / 0.55) 100%)" }}
                  />
                  {/* Floating icon top-left */}
                  <div className={`absolute top-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} backdrop-blur-md bg-white/95 border ${feature.border} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <feature.icon className={`${feature.iconColor}`} style={{ width: "1.125rem", height: "1.125rem" }} />
                  </div>
                </div>
                <CardContent className="p-5 space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </SpotlightCard>
              </RevealItem>
            ))}
          </StaggerGroup>

          {/* Bento metrics — with decorative imagery */}
          <StaggerGroup className="grid grid-cols-1 gap-4 lg:grid-cols-12">

            {/* ── Payment-protection card ── */}
            <RevealItem className="lg:col-span-7 relative rounded-2xl border border-primary/15 bg-linear-to-br from-primary/8 via-primary/3 to-transparent p-8 min-h-56 card-lift overflow-hidden group">
              {/* Decorative image — right side, heavily masked + tinted to stay subtle */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block pointer-events-none overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop"
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-cover opacity-30 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-40"
                  style={{
                    maskImage: "linear-gradient(to right, transparent 0%, black 55%, black 90%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 55%, black 90%, transparent 100%)",
                  }}
                />
                {/* Color tint — primary blue wash to bond with card */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to right, oklch(0.95 0.04 250 / 0.55) 0%, oklch(0.85 0.1 250 / 0.18) 60%, transparent 100%)",
                  }}
                />
              </div>

              {/* Floating decorative shapes */}
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary/40 animate-pulse hidden md:block" />
              <div className="absolute bottom-12 right-1/3 h-1.5 w-1.5 rounded-full bg-amber-400/50 animate-pulse hidden md:block" style={{ animationDelay: "0.8s" }} />

              {/* Content */}
              <div className="relative space-y-3 max-w-[26rem]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  Thanh toán chỉ chuyển khi buổi học hoàn thành
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[40ch]">
                  Tiền của bạn được giữ an toàn trong ví LIFLOW. Nếu gia sư huỷ lịch, hệ thống
                  hoàn tiền tự động — bạn không phải lo mất phí.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Ví giữ tiền</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Hoàn tiền khi huỷ</span>
                </div>
                <Button variant="outline" size="sm" className="w-fit gap-1.5 btn-shimmer mt-3" asChild>
                  <Link href="/tutors">Tìm gia sư ngay <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </RevealItem>

            {/* ── Tutor-vetting card ── */}
            <RevealItem className="lg:col-span-5 relative rounded-2xl border border-amber-400/25 bg-linear-to-br from-amber-400/10 via-amber-400/4 to-transparent p-8 min-h-56 card-lift overflow-hidden group">
              {/* Decorative cluster — abstract amber glow + verified badge motif */}
              <div className="absolute -top-10 -right-10 w-48 h-48 hidden md:block pointer-events-none">
                <div className="absolute inset-0 rounded-full bg-amber-400/18 blur-3xl" />
                <div className="absolute inset-6 rounded-full bg-amber-300/14 blur-2xl" />
                <div className="absolute top-12 right-12 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-white/85 shadow-lg shadow-amber-500/15 backdrop-blur-md transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-105">
                  <GraduationCap className="h-7 w-7 text-amber-500" strokeWidth={2.25} />
                </div>
                <span className="absolute top-9 right-7 h-1.5 w-1.5 rounded-full bg-amber-400/70 animate-pulse" />
                <span className="absolute top-20 right-28 h-1 w-1 rounded-full bg-amber-300/80 animate-pulse" style={{ animationDelay: "0.6s" }} />
              </div>

              {/* Bottom decoration — abstract circles */}
              <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-amber-400/8 blur-2xl pointer-events-none" />
              <div className="absolute top-1/3 left-1/2 h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-pulse" style={{ animationDelay: "0.4s" }} />

              {/* Content */}
              <div className="relative space-y-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15">
                  <GraduationCap className="h-7 w-7 text-amber-500" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  Gia sư qua kiểm duyệt kỹ lưỡng
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[34ch]">
                  Mỗi hồ sơ được xét duyệt bằng cấp và kinh nghiệm trước khi nhận học viên.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Xác minh hồ sơ</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Đánh giá thực tế</span>
                </div>
                <Button variant="outline" size="sm" className="w-fit gap-1.5 btn-shimmer mt-3" asChild>
                  <Link href="/apply-tutor">Trở thành gia sư <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </RevealItem>
          </StaggerGroup>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-muted/25 border-t border-border section-space">
        <AnimatedBlobs
          blobs={[
            { top: "-10%", left: "5%",  size: 460, color: "oklch(0.78 0.16 245 / 0.14)", duration: 22 },
            { top: "60%",  left: "70%", size: 420, color: "oklch(0.82 0.14 70 / 0.13)",  duration: 26, delay: 6 },
          ]}
        />
        <div className="site-container relative" style={{ zIndex: 1 }}>
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              LIFLOW bảo vệ{" "}
              <span className="text-gradient-primary">trải nghiệm học</span> của bạn
            </h2>
            <p className="text-muted-foreground text-sm max-w-[52ch] mx-auto leading-relaxed">
              Ba nguyên tắc nền tảng giúp phụ huynh yên tâm khi tìm và đặt gia sư.
            </p>
          </div>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            {COMMITMENTS.map(({ icon: Icon, title, desc }) => (
              <RevealItem key={title}>
                <TiltedCard
                  maxTilt={7}
                  scale={1.025}
                  className="relative h-full rounded-2xl border border-border bg-card p-6 group hover:shadow-xl hover:border-primary/20"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </TiltedCard>
              </RevealItem>
            ))}
          </StaggerGroup>

          {/* Trust strip — định tính, không số liệu */}
          <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground font-medium">Gia sư được kiểm duyệt</span>
            </div>
            <span className="hidden sm:inline-block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground font-medium">Thanh toán bảo chứng</span>
            </div>
            <span className="hidden sm:inline-block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-foreground font-medium">Hoàn tiền khi huỷ lịch</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="relative overflow-hidden bg-card border-t border-border section-space">
        <AnimatedBlobs
          blobs={[
            { top: "20%", left: "85%", size: 360, color: "oklch(0.72 0.18 290 / 0.1)", duration: 24 },
            { top: "65%", left: "0%",  size: 400, color: "oklch(0.78 0.16 245 / 0.1)", duration: 28, delay: 4 },
          ]}
        />
        <div className="site-container relative" style={{ zIndex: 1 }}>
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Câu hỏi thường gặp</h2>
            <p className="text-muted-foreground text-sm max-w-[48ch] mx-auto">
              Không thấy câu trả lời bạn cần?{" "}
              <a href="mailto:support@liflow.vn" className="text-primary hover:underline font-semibold">
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
          <StaggerGroup className="max-w-2xl mx-auto" amount={0.15}>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map((faq, i) => (
              <RevealItem key={i} className="block">
              <AccordionItem
                value={`faq-${i}`}
                className="border border-border rounded-2xl px-5 overflow-hidden hover:border-primary/25 transition-all duration-300 hover:shadow-md group"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-primary hover:no-underline py-4 transition-colors duration-300 group-hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 transition-colors duration-300">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
              </RevealItem>
            ))}
          </Accordion>
          </StaggerGroup>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════════════════════ */}
      <Section className="relative overflow-hidden bg-mesh-hero noise-overlay text-white text-center">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Aurora
            colorStops={["#0EA5E9", "#F59E0B", "#1D4ED8"]}
            amplitude={0.45}
            blend={0.24}
            speed={0.22}
          />
        </div>
        <LightRays className="opacity-45" />
        <Particles
          color="oklch(0.95 0.04 70 / 0.85)"
          size={1.6}
          maxOpacity={0.7}
          speed={20}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.045,
          }}
        />
        <div className="hero-ambient-light" />

        <StaggerGroup className="relative mx-auto max-w-xl flex flex-col items-center gap-5" amount={0.25}>
          <RevealItem>
            <h2 className="text-3xl font-bold sm:text-4xl text-center" style={{ letterSpacing: "-0.03em" }}>
              <ShinyText
                text="Bắt đầu đặt buổi học đầu tiên"
                color="#ffffff"
                shineColor="#fbbf24"
                speed={4.5}
                spread={105}
              />
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="text-base text-white/65 sm:text-lg leading-relaxed max-w-[44ch] text-center">
              Đặt buổi học ngay hôm nay và theo dõi tiến trình học tập rõ ràng từ dashboard.
            </p>
          </RevealItem>
          <RevealItem className="flex flex-wrap gap-3 justify-center">
            <ClickSpark sparkColor="oklch(0.92 0.05 250)" sparkCount={10}>
              <Magnet strength={0.12} maxOffset={8}>
                <Link
                  href="/tutors"
                  className="btn-ghost-hero inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 transition-all duration-300 hover:bg-white/18 hover:border-white/40"
                >
                  <Users className="h-4 w-4 shrink-0" />
                  Tìm Gia Sư Ngay
                </Link>
              </Magnet>
            </ClickSpark>
            <ClickSpark sparkColor="oklch(0.85 0.18 70)" sparkCount={12}>
              <Magnet>
                <Link
                  href="/apply-tutor"
                  className="btn-primary-cta inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 transition-all duration-300"
                >
                  Đăng ký làm Gia Sư
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </Magnet>
            </ClickSpark>
          </RevealItem>
          <RevealItem className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" style={{ fontSize: "0.8rem", color: "oklch(1 0 0 / 0.45)" }}>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Miễn phí đăng ký</span>
            <span className="inline-block w-px h-3 bg-white/15" />
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Thanh toán bảo đảm</span>
            <span className="inline-block w-px h-3 bg-white/15" />
            <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Hoàn tiền 100%</span>
          </RevealItem>
        </StaggerGroup>
      </Section>
    </main>
  );
}
