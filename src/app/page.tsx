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
  "Lịch trống theo thời gian thực",
  "Đặt lịch & thanh toán trong 1 luồng",
  "Theo dõi tiến độ rõ ràng",
];

const STATS = [
  {
    label: "Gia sư xác thực",
    value: "2.400+",
    num: "2400",
    icon: GraduationCap,
    color: "text-primary",
  },
  {
    label: "Buổi học hoàn thành",
    value: "58.000+",
    num: "58000",
    icon: BookOpen,
    color: "text-success",
  },
  {
    label: "Phụ huynh hài lòng",
    value: "96%",
    num: "96",
    icon: Star,
    color: "text-warning",
  },
  {
    label: "Thành phố phủ sóng",
    value: "15+",
    num: "15",
    icon: MapPin,
    color: "text-accent",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tìm gia sư phù hợp",
    desc: "Lọc theo quận, môn học, mức phí và hình thức dạy online/offline.",
    icon: Search,
  },
  {
    step: "02",
    title: "Xem lịch trống",
    desc: "Chọn slot còn trống theo tuần để khớp thời gian của gia đình bạn.",
    icon: Clock,
  },
  {
    step: "03",
    title: "Đặt buổi học nhanh",
    desc: "Đặt buổi học trả phí và bắt đầu ngay với lịch định kỳ linh hoạt.",
    icon: CheckCircle2,
  },
];

const SUBJECTS: {
  id: string;
  label: string;
  count: string;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    id: "math",
    label: "Toán học",
    count: "380+ gia sư",
    icon: Calculator,
    color: "text-primary",
  },
  {
    id: "english",
    label: "Tiếng Anh",
    count: "290+ gia sư",
    icon: Languages,
    color: "text-sky-500",
  },
  {
    id: "physics",
    label: "Vật lý",
    count: "180+ gia sư",
    icon: Zap,
    color: "text-amber-500",
  },
  {
    id: "chem",
    label: "Hóa học",
    count: "150+ gia sư",
    icon: FlaskConical,
    color: "text-purple-500",
  },
  {
    id: "bio",
    label: "Sinh học",
    count: "110+ gia sư",
    icon: Leaf,
    color: "text-green-500",
  },
  {
    id: "lit",
    label: "Ngữ văn",
    count: "120+ gia sư",
    icon: BookMarked,
    color: "text-rose-500",
  },
  {
    id: "hist",
    label: "Lịch sử",
    count: "85+ gia sư",
    icon: Landmark,
    color: "text-orange-500",
  },
  {
    id: "it",
    label: "Lập trình",
    count: "95+ gia sư",
    icon: Code2,
    color: "text-indigo-500",
  },
];

const PLATFORM_FEATURES = [
  {
    title: "Ví bảo đảm thanh toán",
    desc: "Tiền giữ trong ví LIFLOW, chỉ chuyển cho gia sư sau buổi học hoàn thành. Huỷ lịch được hoàn tiền tự động.",
    icon: Shield,
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Lịch trống thời gian thực",
    desc: "Xem chính xác khi nào gia sư rảnh. Chọn slot, xác nhận chi phí và bắt đầu trong vài phút.",
    icon: Clock,
    bg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "Gia sư kiểm duyệt nghiêm ngặt",
    desc: "Mọi gia sư đều qua quy trình xét hồ sơ, xác minh bằng cấp và đánh giá thực tế trước khi được chấp thuận.",
    icon: GraduationCap,
    bg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
];

const FAQ = [
  {
    q: "LIFLOW có bảo đảm chất lượng gia sư không?",
    a: "Có. Mọi gia sư trải qua quy trình duyệt hồ sơ, xác minh bằng cấp và thử nghiệm trực tuyến trước khi được chấp thuận. Hồ sơ hiển thị rating & số buổi thực tế.",
  },
  {
    q: "LIFLOW có buổi học thử miễn phí không?",
    a: "Không. LIFLOW chỉ hỗ trợ các buổi học trả phí để đảm bảo cam kết từ cả hai phía và chất lượng buổi học.",
  },
  {
    q: "Thanh toán được bảo vệ như thế nào?",
    a: "Tiền được giữ trong ví LIFLOW và chỉ chuyển cho gia sư sau khi buổi học hoàn thành. Nếu gia sư huỷ, tiền hoàn tự động về ví của bạn.",
  },
  {
    q: "Làm sao để biết slot nào còn trống?",
    a: "Trang chi tiết gia sư hiển thị lịch trống theo ngày/tuần cập nhật liên tục — chỉ cần chọn slot phù hợp và xác nhận.",
  },
  {
    q: "Tôi có thể đặt lịch định kỳ hàng tuần không?",
    a: "Có. Bạn có thể đặt series định kỳ (vd: Thứ 2 & 4, 19h–20h30) với thanh toán gộp hoặc từng buổi.",
  },
  {
    q: "Gia sư muốn đăng ký thì làm thế nào?",
    a: "Nhấp 'Đăng ký làm gia sư', điền hồ sơ, tải lên bằng cấp và chờ đội kiểm duyệt phê duyệt (thường 1-2 ngày làm việc).",
  },
];

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="bg-[var(--bg-app)]">
      <HomeAnimations />

      <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/70 text-white pt-14 pb-16 sm:pt-18 sm:pb-20 lg:pt-24 lg:pb-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,.95) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-tr from-primary/70 via-transparent to-accent/25 animate-gradient" />

        <div className="site-container relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 items-center">
          <div className="ha-hero lg:col-span-7 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-medium text-white w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              Đã có 58.000+ buổi học được hoàn thành
            </div>
            <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
              Tìm gia sư
              <span className="mx-2 bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
                uy tín
              </span>
              cho con tại khu vực của bạn
            </h1>
            <div className="flex flex-wrap gap-2">
              {HERO_HIGHLIGHTS.map((item) => (
                <Badge
                  key={item}
                  className="bg-white/15 text-white border-white/20 hover:bg-white/20"
                >
                  {item}
                </Badge>
              ))}
            </div>
            <p className="font-sans text-base text-white/85 sm:text-lg leading-relaxed max-w-[58ch]">
              Lọc theo khu vực, xem lịch trống thực tế, đặt buổi học và quản lý
              lịch học định kỳ trong một luồng thống nhất.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="accent"
                className="gap-2 shadow-lg shadow-accent/25"
              >
                <Link href="/tutors">
                  <Search className="h-5 w-5" /> Tìm Gia Sư Ngay
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="gap-2 bg-white/15 border border-white/30 text-white hover:bg-white/20 shadow-none"
              >
                <Link href="/apply-tutor">
                  <GraduationCap className="h-5 w-5" /> Đăng ký làm Gia Sư
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-accent" /> Ví bảo đảm
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" /> Gia sư xác thực
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent" /> Đặt lịch nhanh
              </span>
            </div>
          </div>

          <div className="ha-hero-card lg:col-span-5 opacity-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 aspect-4/3">
              <Image
                src="/landing.jpg"
                alt="Gia sư dạy học cùng học sinh"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-primary/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="site-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 text-center">
            {STATS.map(({ label, value, num, icon: Icon, color }) => (
              <div key={label} className="ha-stat space-y-2 opacity-0">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted mx-auto ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div
                  className="ha-stat-num text-2xl sm:text-3xl font-bold text-foreground"
                  data-value={num}
                >
                  {value}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section id="how-it-works" className="bg-muted/40">
        <div className="text-center mb-10 space-y-3">
          <Badge variant="secondary" className="text-xs px-3">
            Quy trình
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Bắt đầu chỉ với 3 bước
          </h2>
          <p className="text-muted-foreground max-w-[52ch] mx-auto text-base leading-relaxed">
            Từ tìm kiếm đến buổi học đầu tiên chỉ mất vài phút — không cần giấy
            tờ phức tạp.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, index) => (
            <Card key={step} className="ha-step relative h-full opacity-0">
              <CardContent className="p-6 text-center">
                {index < HOW_IT_WORKS.length - 1 && (
                  <span className="absolute right-0 top-10 hidden h-px w-8 translate-x-1/2 border-t-2 border-dashed border-border md:block" />
                )}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs font-bold tracking-wide text-primary/70 uppercase">
                  Bước {step}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link href="/tutors">
              Bắt đầu tìm gia sư <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      <section className="bg-card border-y border-border section-space">
        <div className="site-container">
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs px-3">
                Môn học phổ biến
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Tìm gia sư theo môn học
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-primary hidden sm:flex"
              asChild
            >
              <Link href="/tutors">
                Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.id}
                href={`/tutors?subject=${subject.id}`}
                className="ha-subject group surface-card p-4 text-center space-y-2 hover:border-primary/40 hover:shadow-md transition-all opacity-0"
              >
                <div className="flex justify-center">
                  <subject.icon className={`h-6 w-6 ${subject.color}`} />
                </div>
                <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {subject.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {subject.count}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 text-center sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-primary"
              asChild
            >
              <Link href="/tutors">
                Xem tất cả môn <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Section>
        <div className="space-y-8">
          {/* Section header */}
          <div className="ha-fee-left space-y-4 opacity-0">
            <Badge variant="secondary" className="text-xs px-3">
              Nền tảng đáng tin cậy
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Thanh toán an toàn.{" "}
              <span className="text-primary">Gia sư uy tín.</span>
              <br className="hidden sm:block" />
              Lịch học linh hoạt.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-[60ch]">
              LIFLOW xây dựng hệ thống đặt gia sư với quy trình kiểm duyệt nghiêm
              ngặt và ví bảo đảm — tiền chỉ rời ví khi buổi học hoàn thành.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLATFORM_FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="ha-fee-right opacity-0 border-border/70"
              >
                <CardContent className="p-5 space-y-3">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg}`}
                  >
                    <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bento highlight — replaces broken image gallery */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left: trust metric */}
            <div className="ha-fee-right opacity-0 lg:col-span-7 rounded-2xl border border-primary/20 bg-linear-to-br from-primary/8 to-primary/3 p-8 flex flex-col justify-between gap-6 min-h-50">
              <div className="space-y-2">
                <div className="text-5xl font-extrabold tracking-tight text-primary">
                  96%
                </div>
                <p className="text-base font-semibold text-foreground">
                  Phụ huynh hài lòng sau buổi học đầu tiên
                </p>
                <p className="text-sm text-muted-foreground max-w-[42ch]">
                  Đánh giá từ hàng nghìn phụ huynh sau khi gia sư hoàn thành buổi
                  dạy thực tế.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                asChild
              >
                <Link href="/tutors">
                  Tìm gia sư ngay <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {/* Right: tutor count */}
            <div className="ha-fee-right opacity-0 lg:col-span-5 rounded-2xl border border-amber-400/25 bg-linear-to-br from-amber-400/10 to-amber-400/3 p-8 flex flex-col justify-between gap-4 min-h-50">
              <div className="space-y-2">
                <div className="text-5xl font-extrabold tracking-tight text-amber-500">
                  2.400+
                </div>
                <p className="text-base font-semibold text-foreground">
                  Gia sư xác thực sẵn sàng dạy học
                </p>
                <p className="text-sm text-muted-foreground">
                  Đã qua kiểm duyệt hồ sơ, bằng cấp và đánh giá thực tế.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                asChild
              >
                <Link href="/apply-tutor">
                  Trở thành gia sư <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <section id="faq" className="bg-card border-t border-border section-space">
        <div className="site-container">
          <div className="text-center mb-10 space-y-3">
            <Badge variant="secondary" className="text-xs px-3">
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Câu hỏi thường gặp
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-[50ch] mx-auto">
              Không thấy câu trả lời bạn cần?{" "}
              <a
                href="mailto:support@liflow.vn"
                className="text-primary hover:underline font-medium"
              >
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
          <Accordion
            type="single"
            collapsible
            className="max-w-2xl mx-auto space-y-2"
          >
            {FAQ.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="ha-faq border border-border rounded-2xl px-5 overflow-hidden opacity-0"
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

      <Section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-accent/60 text-white text-center">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,.95) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="ha-cta relative mx-auto max-w-2xl flex flex-col items-center gap-5">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 opacity-0">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl opacity-0">
            Bắt đầu đặt buổi học đầu tiên
          </h2>
          <p className="text-readable text-base text-white/85 sm:text-lg opacity-0">
            Đặt buổi học ngay hôm nay và theo dõi tiến trình học tập rõ ràng từ
            dashboard.
          </p>
          <div className="flex flex-wrap gap-3 justify-center opacity-0">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-white text-primary hover:bg-blue-50 font-semibold shadow-xl px-8"
            >
              <Link href="/tutors">
                <Users className="h-4 w-4" /> Tìm Gia Sư Ngay
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="accent"
              className="gap-2 shadow-lg shadow-accent/30"
            >
              <Link href="/apply-tutor">
                Đăng ký làm Gia Sư <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white/70 text-sm opacity-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Miễn phí đăng ký
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" /> Thanh toán bảo đảm
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4" /> Hoàn tiền 100%
            </span>
          </div>
        </div>
      </Section>
    </main>
  );
}
