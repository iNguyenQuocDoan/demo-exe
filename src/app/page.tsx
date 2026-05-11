import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  Code2,
  FlaskConical,
  GraduationCap,
  Languages,
  Landmark,
  Leaf,
  MapPin,
  Quote,
  Search,
  Shield,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HomeAnimations } from "@/components/home/HomeAnimations";

/* ─── Static data ──────────────────────────────────────────────────────────── */
const HERO_HIGHLIGHTS = [
  "Gia sư đã xác thực",
  "Lịch trống thời gian thực",
  "Đặt lịch & thanh toán 1 luồng",
  "Theo dõi tiến độ rõ ràng",
];

/* Hero decorative floating dots — animated by GSAP via .ha-floating-shape selector */
const FLOATING_SHAPES: { top: string; left: string; size: number; color: string }[] = [
  { top: "20%", left: "8%",  size: 6, color: "oklch(0.85 0.18 70 / 0.45)" },
  { top: "70%", left: "12%", size: 4, color: "oklch(0.92 0.05 250 / 0.5)" },
  { top: "35%", left: "55%", size: 5, color: "oklch(0.85 0.18 70 / 0.4)" },
  { top: "80%", left: "48%", size: 3, color: "oklch(0.92 0.05 250 / 0.55)" },
  { top: "15%", left: "75%", size: 4, color: "oklch(0.85 0.18 70 / 0.45)" },
];

const STATS = [
  { label: "Gia sư xác thực", value: "2.400+", num: "2400", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  { label: "Buổi học hoàn thành", value: "58.000+", num: "58000", icon: BookOpen, color: "text-success", bg: "bg-success/10" },
  { label: "Phụ huynh hài lòng", value: "96%", num: "96", icon: Star, color: "text-warning", bg: "bg-warning/10" },
  { label: "Thành phố phủ sóng", value: "15+", num: "15", icon: MapPin, color: "text-accent", bg: "bg-accent/10" },
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

const SUBJECTS: { id: string; label: string; count: string; icon: LucideIcon; color: string; bg: string; image: string }[] = [
  { id: "math", label: "Toán học", count: "380+", icon: Calculator, color: "text-primary", bg: "bg-primary/8",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80&auto=format&fit=crop" },
  { id: "english", label: "Tiếng Anh", count: "290+", icon: Languages, color: "text-sky-500", bg: "bg-sky-500/8",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80&auto=format&fit=crop" },
  { id: "physics", label: "Vật lý", count: "180+", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/8",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&q=80&auto=format&fit=crop" },
  { id: "chem", label: "Hóa học", count: "150+", icon: FlaskConical, color: "text-purple-500", bg: "bg-purple-500/8",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80&auto=format&fit=crop" },
  { id: "bio", label: "Sinh học", count: "110+", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/8",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80&auto=format&fit=crop" },
  { id: "lit", label: "Ngữ văn", count: "120+", icon: BookMarked, color: "text-rose-500", bg: "bg-rose-500/8",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80&auto=format&fit=crop" },
  { id: "hist", label: "Lịch sử", count: "85+", icon: Landmark, color: "text-orange-500", bg: "bg-orange-500/8",
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=600&q=80&auto=format&fit=crop" },
  { id: "it", label: "Lập trình", count: "95+", icon: Code2, color: "text-indigo-500", bg: "bg-indigo-500/8",
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
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80&auto=format&fit=crop",
  },
];

const TESTIMONIALS = [
  {
    name: "Chị Nguyễn Mai Anh",
    role: "Phụ huynh tại Q.1, TP.HCM",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 5,
    quote: "Con tôi học Toán cùng cô Mai trên LIFLOW được 3 tháng — điểm số tăng từ 6 lên 8.5. Lịch học linh hoạt, đặt buổi qua app rất tiện.",
  },
  {
    name: "Anh Trần Văn Hùng",
    role: "Phụ huynh tại Hà Nội",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 5,
    quote: "Ban đầu hơi e ngại vì online, nhưng quy trình kiểm duyệt gia sư của LIFLOW rất kỹ. Ví bảo đảm giúp tôi yên tâm khi thanh toán.",
  },
  {
    name: "Chị Lê Thu Hà",
    role: "Phụ huynh tại Đà Nẵng",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 5,
    quote: "Đặt được gia sư Tiếng Anh xịn cho con chỉ trong 1 ngày. Có thể xem hồ sơ, đánh giá thực tế — không phải đoán mò như trước.",
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
      <div id="scroll-progress" />
      <HomeAnimations />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — compact, content-first, image hugs right
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-mesh-hero noise-overlay text-white py-10 sm:py-12 lg:py-14">

        <div className="hero-ambient-light" />

        {/* Faint dot grid */}
        <div
          className="ha-hero-parallax absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.055,
          }}
        />

        {/* Diagonal gradient sweep */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, transparent 40%, oklch(0.6 0.14 240 / 0.12) 70%, transparent 100%)",
          }}
        />

        {/* Floating decorative shapes — JSX so React owns lifecycle (no DOM injection) */}
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

        <div className="site-container relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-center">

          {/* ── Left: Content (col-span-7) ── */}
          <div className="ha-hero lg:col-span-7 flex flex-col gap-4">

            {/* Social proof pill */}
            <div className="inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white/85 border border-white/15 bg-white/8 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
              </span>
              <TrendingUp className="h-3 w-3 opacity-70" />
              Đã có 58.000+ buổi học hoàn thành
            </div>

            {/* Headline — 2 dòng tự nhiên, không break ép */}
            <h1
              className="font-bold text-white"
              style={{
                fontSize: "clamp(1.9rem, 2.4vw + 0.9rem, 3rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
              }}
            >
              Tìm gia sư{" "}
              <span className="text-gradient-hero-keyword">uy tín</span>{" "}
              cho con tại khu vực của bạn
            </h1>

            {/* Descriptive */}
            <p
              className="text-white/70 leading-relaxed"
              style={{
                fontSize: "clamp(0.9rem, 0.3vw + 0.85rem, 1rem)",
                maxWidth: "52ch",
              }}
            >
              Lọc theo khu vực, xem lịch trống thực tế, đặt buổi học và quản lý
              lịch định kỳ — trong một luồng thống nhất.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-1.5">
              {HERO_HIGHLIGHTS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/7 px-2.5 py-1 text-[11px] font-medium text-white/80"
                >
                  <CheckCircle2 className="h-3 w-3 text-amber-400/80 shrink-0" />
                  {item}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5 sm:flex-row pt-1">
              <Link
                href="/tutors"
                className="btn-primary-cta inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <Search className="h-4 w-4 shrink-0" />
                Tìm Gia Sư Ngay
              </Link>
              <Link
                href="/apply-tutor"
                className="btn-ghost-hero inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white/90 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                Đăng ký làm Gia Sư
              </Link>
            </div>

            {/* Trust signals */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5"
              style={{ fontSize: "0.78rem", color: "oklch(1 0 0 / 0.5)" }}
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-400/70" />
                Ví bảo đảm
              </span>
              <span className="inline-block w-px h-3 bg-white/15" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400/70" />
                Gia sư xác thực
              </span>
              <span className="inline-block w-px h-3 bg-white/15" />
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400/70" />
                Đặt lịch nhanh
              </span>
            </div>
          </div>

          {/* ── Right: Hero image (col-span-5, ngang 4/3) ── */}
          <div className="ha-hero-card lg:col-span-5 opacity-0">
            <div className="hero-image-frame aspect-4/3">
              {/* Image */}
              <Image
                src="/landing.jpg"
                alt="Gia sư dạy học cùng học sinh"
                fill
                className="object-cover"
                priority
              />
              {/* Blend gradient — bottom dark for card legibility */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, oklch(0.22 0.1 255 / 0.72) 0%, transparent 55%)",
                }}
              />
              {/* Subtle top vignette to blend with hero bg */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, oklch(0.32 0.12 255 / 0.3) 0%, transparent 30%)",
                }}
              />

              {/* Floating stats card — bottom left */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="hero-stats-card px-4 py-3 flex items-center gap-3">
                  {/* Avatar stack */}
                  <div className="flex -space-x-2 shrink-0">
                    {["3B", "7F", "AD"].map((seed, i) => (
                      <div
                        key={seed}
                        className="h-7 w-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white/70"
                        style={{
                          borderColor: "oklch(1 0 0 / 0.15)",
                          background: `oklch(${0.38 + i * 0.05} 0.12 ${250 + i * 15})`,
                        }}
                      >
                        {seed}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/90 leading-tight">
                      +120 gia sư mới tháng này
                    </div>
                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                      đã qua kiểm duyệt
                    </div>
                  </div>
                  {/* Verified badge */}
                  <div className="ml-auto shrink-0">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(0.65 0.2 150 / 0.2)", border: "1px solid oklch(0.65 0.2 150 / 0.3)" }}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-card">
        <div className="site-container py-10 lg:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
            {STATS.map(({ label, value, num, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="ha-stat opacity-0 group text-center space-y-2.5 p-4 rounded-2xl border border-transparent hover:border-border hover:bg-muted/40 transition-all duration-300 cursor-default"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <div className={`ha-stat-num text-2xl sm:text-3xl font-bold tracking-tight ${color}`} data-value={num}>
                  {value}
                </div>
                <div className="text-xs text-muted-foreground font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════════════════ */}
      <Section id="how-it-works" className="bg-muted/25">
        <div className="text-center mb-12 space-y-3">
          <Badge variant="secondary" className="text-[11px] px-3 font-semibold tracking-widest uppercase">
            Quy trình
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Bắt đầu chỉ với{" "}
            <span className="text-gradient-primary">3 bước</span>
          </h2>
          <p className="text-muted-foreground max-w-[50ch] mx-auto text-sm sm:text-base leading-relaxed">
            Từ tìm kiếm đến buổi học đầu tiên chỉ mất vài phút.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color, bg, border, image }) => (
            <div key={step} className="ha-step opacity-0">
              <Card className={`h-full card-lift border ${border} overflow-hidden p-0`}>
                {/* Banner image — chiếm toàn bộ top, có gradient overlay xuống đáy */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay từ dưới lên — làm step badge dễ đọc */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, oklch(0.18 0.02 250 / 0.65) 0%, transparent 50%)",
                    }}
                  />
                  {/* Step badge floating bên trái dưới */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} border ${border} backdrop-blur-md bg-white/90`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <span className="rounded-md bg-black/40 backdrop-blur-md px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-white/90">
                      Bước {step}
                    </span>
                  </div>
                </div>
                {/* Body */}
                <CardContent className="p-5 pt-4">
                  <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="default" variant="outline" className="gap-2 btn-shimmer" asChild>
            <Link href="/tutors">
              Bắt đầu tìm gia sư <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          SUBJECTS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-card border-y border-border section-space">
        <div className="site-container">
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-[11px] px-3 font-semibold tracking-widest uppercase">
                Môn học phổ biến
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Tìm gia sư theo{" "}
                <span className="text-gradient-primary">môn học</span>
              </h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary hidden sm:flex text-sm" asChild>
              <Link href="/tutors">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.id}
                href={`/tutors?subject=${subject.id}`}
                className="ha-subject group opacity-0 relative rounded-2xl border border-border bg-card overflow-hidden card-lift hover:border-primary/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-24 w-full overflow-hidden">
                  <Image
                    src={subject.image}
                    alt={subject.label}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Color tint overlay matching subject color */}
                  <div
                    className="absolute inset-0 mix-blend-multiply opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, oklch(0.5 0.15 250) 0%, transparent 100%)" }}
                  />
                  {/* Bottom fade for icon legibility */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.4) 0%, transparent 50%)" }}
                  />
                  {/* Floating icon bottom-right */}
                  <div className={`absolute bottom-2 right-2 h-7 w-7 rounded-lg ${subject.bg} border border-white/40 backdrop-blur-sm bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <subject.icon className={`${subject.color}`} style={{ width: "0.95rem", height: "0.95rem" }} />
                  </div>
                </div>
                {/* Body */}
                <div className="p-3 text-center space-y-0.5">
                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                    {subject.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {subject.count} gia sư
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 text-center sm:hidden">
            <Button variant="ghost" size="sm" className="gap-1 text-primary text-sm" asChild>
              <Link href="/tutors">Xem tất cả môn <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PLATFORM FEATURES
          ══════════════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="space-y-10">
          <div className="ha-fee-left opacity-0 max-w-xl space-y-3">
            <Badge variant="secondary" className="text-[11px] px-3 font-semibold tracking-widest uppercase">
              Nền tảng đáng tin cậy
            </Badge>
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
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLATFORM_FEATURES.map((feature) => (
              <Card key={feature.title} className={`ha-fee-right opacity-0 border ${feature.border} card-lift group overflow-hidden p-0`}>
                {/* Image banner */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Tint overlay using feature accent color */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, oklch(0.18 0.02 250 / 0.25) 0%, oklch(0.18 0.02 250 / 0.55) 100%)" }}
                  />
                  {/* Floating icon top-left */}
                  <div className={`absolute top-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} backdrop-blur-md bg-white/95 border ${feature.border} shadow-sm`}>
                    <feature.icon className={`${feature.iconColor}`} style={{ width: "1.125rem", height: "1.125rem" }} />
                  </div>
                </div>
                <CardContent className="p-5 space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bento metrics — with decorative imagery */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

            {/* ── 96% card ── */}
            <div className="ha-fee-right opacity-0 lg:col-span-7 relative rounded-2xl border border-primary/15 bg-linear-to-br from-primary/8 via-primary/3 to-transparent p-8 min-h-56 card-lift overflow-hidden group">
              {/* Decorative image — right side, masked + tinted */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block pointer-events-none overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop"
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    maskImage: "linear-gradient(to right, transparent 0%, black 40%, black 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 40%, black 100%)",
                  }}
                />
                {/* Color tint */}
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{
                    background: "linear-gradient(to right, oklch(0.92 0.04 250 / 0.95) 0%, oklch(0.5 0.15 250 / 0.18) 100%)",
                  }}
                />
                {/* Subtle outer fade — blends right edge of card */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to right, transparent 0%, transparent 70%, oklch(0.95 0.02 250 / 0.4) 100%)",
                  }}
                />
              </div>

              {/* Floating decorative shapes */}
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary/40 animate-pulse hidden md:block" />
              <div className="absolute bottom-12 right-1/3 h-1.5 w-1.5 rounded-full bg-amber-400/50 animate-pulse hidden md:block" style={{ animationDelay: "0.8s" }} />

              {/* Content */}
              <div className="relative space-y-3 max-w-[24rem]">
                <div
                  className="ha-bento-num font-heading text-6xl lg:text-7xl font-bold tracking-tight text-gradient-primary leading-none"
                  style={{ letterSpacing: "-0.05em" }}
                  data-value="96"
                  data-suffix="%"
                >
                  96%
                </div>
                <p className="text-base lg:text-lg font-semibold text-foreground">
                  Phụ huynh hài lòng sau buổi học đầu tiên
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[34ch]">
                  Đánh giá từ hàng nghìn phụ huynh sau khi gia sư hoàn thành buổi dạy thực tế.
                </p>
                {/* Mini rating row */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">4.9 / 5 từ 4.500+ đánh giá</span>
                </div>
                <Button variant="outline" size="sm" className="w-fit gap-1.5 btn-shimmer mt-3" asChild>
                  <Link href="/tutors">Tìm gia sư ngay <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>

            {/* ── 2.400+ card ── */}
            <div className="ha-fee-right opacity-0 lg:col-span-5 relative rounded-2xl border border-amber-400/25 bg-linear-to-br from-amber-400/10 via-amber-400/4 to-transparent p-8 min-h-56 card-lift overflow-hidden group">
              {/* Decorative image — top right, masked */}
              <div className="absolute -top-6 -right-6 w-44 h-44 hidden md:block pointer-events-none overflow-hidden rounded-full">
                <Image
                  src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&q=80&auto=format&fit=crop&crop=faces"
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(circle, transparent 35%, oklch(0.95 0.04 70 / 0.85) 75%)",
                  }}
                />
              </div>

              {/* Bottom decoration — abstract circles */}
              <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-amber-400/8 blur-2xl pointer-events-none" />
              <div className="absolute top-1/3 left-1/2 h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-pulse" style={{ animationDelay: "0.4s" }} />

              {/* Content */}
              <div className="relative space-y-3">
                <div
                  className="ha-bento-num font-heading text-6xl lg:text-7xl font-bold tracking-tight text-gradient-accent leading-none"
                  style={{ letterSpacing: "-0.05em" }}
                  data-value="2400"
                  data-suffix="+"
                  data-format="dot"
                >
                  2.400+
                </div>
                <p className="text-base lg:text-lg font-semibold text-foreground">
                  Gia sư xác thực sẵn sàng dạy học
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[32ch]">
                  Đã qua kiểm duyệt hồ sơ, bằng cấp và đánh giá thực tế.
                </p>
                {/* Mini avatar stack */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&q=80&auto=format&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&auto=format&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop&crop=faces",
                    ].map((src, i) => (
                      <div key={i} className="relative h-6 w-6 rounded-full overflow-hidden border-2 border-card ring-1 ring-amber-400/20">
                        <Image src={src} alt="" fill sizes="24px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">+120 mới mỗi tháng</span>
                </div>
                <Button variant="outline" size="sm" className="w-fit gap-1.5 btn-shimmer mt-3" asChild>
                  <Link href="/apply-tutor">Trở thành gia sư <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/25 border-t border-border section-space">
        <div className="site-container">
          <div className="text-center mb-10 space-y-3">
            <Badge variant="secondary" className="text-[11px] px-3 font-semibold tracking-widest uppercase">
              Đánh giá thực tế
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Phụ huynh nói gì về{" "}
              <span className="text-gradient-primary">LIFLOW</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-[52ch] mx-auto leading-relaxed">
              Hơn 4.500 phụ huynh đã đánh giá 5 sao sau khi đặt buổi học cùng gia sư trên LIFLOW.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="ha-testimonial opacity-0 relative rounded-2xl border border-border bg-card p-6 card-lift group"
              >
                {/* Decorative quote */}
                <Quote
                  className="absolute top-4 right-4 h-8 w-8 text-primary/15 group-hover:text-primary/25 transition-colors"
                  strokeWidth={2.5}
                />

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-sm text-foreground leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/15 shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span><strong className="text-foreground">4.9/5</strong> trên 4.500+ đánh giá</span>
            </div>
            <span className="hidden sm:inline-block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span><strong className="text-foreground">100%</strong> gia sư xác thực</span>
            </div>
            <span className="hidden sm:inline-block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span><strong className="text-foreground">58.000+</strong> buổi học hoàn thành</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="bg-card border-t border-border section-space">
        <div className="site-container">
          <div className="text-center mb-10 space-y-3">
            <Badge variant="secondary" className="text-[11px] px-3 font-semibold tracking-widest uppercase">FAQ</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Câu hỏi thường gặp</h2>
            <p className="text-muted-foreground text-sm max-w-[48ch] mx-auto">
              Không thấy câu trả lời bạn cần?{" "}
              <a href="mailto:support@liflow.vn" className="text-primary hover:underline font-semibold">
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
          <Accordion type="single" collapsible className="max-w-2xl mx-auto space-y-2">
            {FAQ.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="ha-faq opacity-0 border border-border rounded-2xl px-5 overflow-hidden hover:border-primary/25 transition-colors duration-200"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════════════════════ */}
      <Section className="relative overflow-hidden bg-mesh-hero noise-overlay text-white text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.045,
          }}
        />
        <div className="hero-ambient-light" />

        <div className="ha-cta relative mx-auto max-w-xl flex flex-col items-center gap-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl opacity-0"
            style={{ background: "oklch(1 0 0 / 0.1)", border: "1px solid oklch(1 0 0 / 0.15)" }}>
            <Shield className="h-7 w-7 text-amber-400/80" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl opacity-0" style={{ letterSpacing: "-0.03em" }}>
            Bắt đầu đặt buổi học đầu tiên
          </h2>
          <p className="text-base text-white/65 sm:text-lg leading-relaxed max-w-[44ch] opacity-0">
            Đặt buổi học ngay hôm nay và theo dõi tiến trình học tập rõ ràng từ dashboard.
          </p>
          <div className="flex flex-wrap gap-3 justify-center opacity-0">
            <Link
              href="/tutors"
              className="btn-ghost-hero inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            >
              <Users className="h-4 w-4 shrink-0" />
              Tìm Gia Sư Ngay
            </Link>
            <Link
              href="/apply-tutor"
              className="btn-primary-cta inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Đăng ký làm Gia Sư
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 opacity-0" style={{ fontSize: "0.8rem", color: "oklch(1 0 0 / 0.45)" }}>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Miễn phí đăng ký</span>
            <span className="inline-block w-px h-3 bg-white/15" />
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Thanh toán bảo đảm</span>
            <span className="inline-block w-px h-3 bg-white/15" />
            <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Hoàn tiền 100%</span>
          </div>
        </div>
      </Section>
    </main>
  );
}
