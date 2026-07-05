"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Building,
  ShieldAlert,
  DollarSign,
  Calendar,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Menu,
  X,
  ArrowUpRight,
  Scale,
  Gift,
  UserCheck,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

interface TOCItem {
  id: string;
  title: string;
}

const tocItems: TOCItem[] = [
  { id: "sec-1", title: "1. Phạm vi áp dụng" },
  { id: "sec-2", title: "2. Thông tin nền tảng" },
  { id: "sec-3", title: "3. Vai trò của Liflow" },
  { id: "sec-4", title: "4. Định nghĩa" },
  { id: "sec-5", title: "5. Nguyên tắc thu phí dịch vụ 10%" },
  { id: "sec-6", title: "6. Quy trình đặt lịch và thanh toán" },
  { id: "sec-7", title: "7. Thời điểm thanh toán cho gia sư" },
  { id: "sec-8", title: "8. Xử lý đơn học bị hủy hoặc bỏ dở" },
  { id: "sec-9", title: "9. Chính sách học thử và đổi gia sư" },
  { id: "sec-10", title: "10. Chính sách hoàn tiền" },
  { id: "sec-11", title: "11. Hoàn tiền đối với gói học nhiều buổi" },
  { id: "sec-12", title: "12. Quy trình yêu cầu hoàn tiền" },
  { id: "sec-13", title: "13. Khiếu nại và giải quyết tranh chấp" },
  { id: "sec-14", title: "14. Tạm giữ hoặc từ chối thanh toán" },
  { id: "sec-15", title: "15. Quy định chống giao dịch ngoài Liflow" },
  { id: "sec-16", title: "16. Trách nhiệm của gia sư" },
  { id: "sec-17", title: "17. Trách nhiệm của phụ huynh/học viên" },
  { id: "sec-18", title: "18. Chất lượng dịch vụ & giới hạn trách nhiệm" },
  { id: "sec-19", title: "19. Bảo vệ học viên chưa thành niên" },
  { id: "sec-20", title: "20. Thuế và nghĩa vụ tài chính" },
  { id: "sec-21", title: "21. Bảo mật thông tin & dữ liệu giao dịch" },
  { id: "sec-22", title: "22. Các hành vi bị cấm" },
  { id: "sec-23", title: "23. Chế tài xử lý vi phạm" },
  { id: "sec-24", title: "24. Thay đổi chính sách" },
  { id: "sec-25", title: "25. Thông tin liên hệ" },
];

export default function PolicyPage() {
  const [activeId, setActiveId] = useState<string>("sec-1");
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll Progress Bar calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setReadingProgress(currentProgress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll tracking
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        setActiveId(visibleEntry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-20">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-75 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-radial from-primary/10 via-background to-background border-b border-border py-12 md:py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.9_0.01_250/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.9_0.01_250/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <Container size="default" className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <Scale className="h-3.5 w-3.5" />
              Quy Chế Hoạt Động
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-[1.15]">
              Chính Sách Phí Dịch Vụ, Thanh Toán, Hủy Đơn, Hoàn Tiền và Giải Quyết Khiếu Nại
            </h1>
            <p className="text-muted-foreground text-sm md:text-base flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>Áp dụng cho nền tảng: <strong className="text-foreground">Liflow</strong></span>
              <span className="hidden md:inline text-border">|</span>
              <span>Cập nhật lần cuối: <strong className="text-foreground">05/07/2026</strong></span>
            </p>
          </div>
        </Container>
      </div>

      <Container size="default" className="mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          
          {/* Mobile TOC Toggle */}
          <div className="lg:hidden sticky top-[68px] z-40 bg-background/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-md flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Mục lục chính sách
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
              aria-label="Toggle Table of Contents"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile TOC Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-4 top-[125px] max-h-[70vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl p-4 z-40 focus:outline-none animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="space-y-1.5">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                      activeId === item.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{item.title}</span>
                    {activeId === item.id && <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Sidebar TOC */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-[100px] max-h-[calc(100vh-140px)] overflow-y-auto pr-4 scrollbar-thin border-r border-border/60">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Nội dung chính sách
              </h2>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left pl-3 py-2 border-l-2 text-[13px] leading-relaxed transition-all block ${
                      activeId === item.id
                        ? "border-primary text-primary font-semibold bg-primary/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-14 text-base leading-relaxed text-foreground max-w-none">
            
            {/* Section 1 */}
            <section id="sec-1" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">1.</span> Phạm vi áp dụng
              </h2>
              <p>
                Chính sách này quy định về phí dịch vụ, thanh toán, hoa hồng thành công, hủy đơn, bỏ dở buổi học, hoàn tiền, đổi gia sư và giải quyết khiếu nại đối với các giao dịch kết nối giữa phụ huynh/học viên và gia sư thông qua nền tảng <strong className="text-foreground">Liflow</strong>.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mt-4">
                <p className="text-sm text-foreground/95 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Khi đăng ký tài khoản, đặt lịch học, nhận lớp, thanh toán hoặc sử dụng bất kỳ dịch vụ nào trên Liflow, phụ huynh/học viên và gia sư được xem là đã đọc, hiểu và đồng ý tuân thủ chính sách này.
                  </span>
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="sec-2" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">2.</span> Thông tin nền tảng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <Building className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Tên nền tảng & Đơn vị vận hành</div>
                    <div className="text-sm font-semibold mt-0.5 text-foreground">Liflow</div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Địa chỉ liên hệ</div>
                    <div className="text-sm font-semibold mt-0.5 text-foreground">74 Lê Văn Việt, Thủ Đức, Thành phố Hồ Chí Minh</div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Email hỗ trợ</div>
                    <a href="mailto:khiemlgse184337@fpt.edu.vn" className="text-sm font-semibold mt-0.5 text-primary hover:underline flex items-center gap-0.5">
                      khiemlgse184337@fpt.edu.vn
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Số điện thoại hỗ trợ</div>
                    <a href="tel:0822332952" className="text-sm font-semibold mt-0.5 text-foreground hover:text-primary">
                      0822332952
                    </a>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 md:col-span-2">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Thời gian hỗ trợ</div>
                    <div className="text-sm font-semibold mt-0.5 text-foreground">
                      08:00–17:30, từ Thứ Hai đến Thứ Sáu, trừ ngày lễ, Tết theo quy định pháp luật.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="sec-3" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">3.</span> Vai trò của Liflow
              </h2>
              <p>
                <strong className="text-foreground">Liflow</strong> là nền tảng trung gian kết nối giữa phụ huynh/học viên có nhu cầu học tập và gia sư có nhu cầu cung cấp dịch vụ dạy học.
              </p>
              <p>
                Liflow không trực tiếp là bên giảng dạy, không phải người sử dụng lao động của gia sư và không bảo đảm tuyệt đối kết quả học tập của học viên. Tuy nhiên, Liflow có trách nhiệm hỗ trợ kết nối, ghi nhận thông tin giao dịch, hỗ trợ thanh toán, tiếp nhận khiếu nại và đưa ra phương án xử lý phù hợp theo chính sách này.
              </p>
              <p>
                Gia sư là bên trực tiếp cung cấp dịch vụ dạy học cho học viên. Gia sư có trách nhiệm đảm bảo thông tin cá nhân, trình độ, kinh nghiệm, lịch dạy, nội dung giảng dạy và cam kết với phụ huynh/học viên là trung thực, hợp pháp và phù hợp với quy định hiện hành.
              </p>
            </section>

            {/* Section 4 */}
            <section id="sec-4" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">4.</span> Định nghĩa
              </h2>
              <div className="space-y-4 mt-4">
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Phụ huynh/học viên</strong> là người đăng ký tài khoản, tìm kiếm gia sư, đặt lịch học, thanh toán học phí hoặc sử dụng dịch vụ học tập thông qua Liflow.</p>
                </div>
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Gia sư</strong> là cá nhân đăng ký tài khoản để cung cấp dịch vụ dạy học, nhận lớp, xác nhận lịch học và nhận thanh toán thông qua Liflow.</p>
                </div>
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Buổi học</strong> là một phiên học đã được phụ huynh/học viên và gia sư thống nhất về thời gian, hình thức học, môn học, học phí và các điều kiện liên quan.</p>
                </div>
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Đơn học</strong> là giao dịch đặt lịch học giữa phụ huynh/học viên và gia sư thông qua Liflow.</p>
                </div>
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Học phí niêm yết</strong> là số tiền phụ huynh/học viên phải thanh toán cho một buổi học hoặc gói học, được hiển thị trên Liflow trước khi xác nhận đặt lịch.</p>
                </div>
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Phí dịch vụ/hoa hồng thành công</strong> là khoản phí <strong className="text-primary font-bold">10%</strong> Liflow thu từ số tiền gia sư được nhận cho mỗi buổi học hoặc gói học thành công.</p>
                </div>
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Giao dịch thành công</strong> là giao dịch mà buổi học đã hoàn tất hoặc gói học đã được thực hiện theo đúng thỏa thuận, và không có khiếu nại hợp lệ trong thời hạn quy định tại chính sách này.</p>
                </div>
                <div className="border-l-4 border-primary/45 pl-4">
                  <p><strong className="text-foreground">Số tiền gia sư nhận thực tế</strong> là học phí hoặc phần học phí được thanh toán cho gia sư sau khi trừ phí dịch vụ 10% và các khoản khấu trừ hợp lệ khác nếu có.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="sec-5" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">5.</span> Nguyên tắc thu phí dịch vụ 10%
              </h2>
              <p>
                Liflow thu phí dịch vụ theo hình thức <strong className="text-foreground">trừ trực tiếp 10% vào số tiền gia sư được nhận</strong> sau khi giao dịch được xác nhận là thành công.
              </p>
              <p>
                Phụ huynh/học viên thanh toán theo mức học phí được hiển thị trên Liflow tại thời điểm đặt lịch. Khoản phí dịch vụ 10% không được thu thêm từ phụ huynh/học viên, trừ khi Liflow có thông báo riêng và hiển thị rõ trước khi thanh toán.
              </p>
              <p className="mt-4">
                Trường hợp phụ huynh/học viên hủy đơn và gia sư chỉ được nhận một phần học phí theo chính sách hủy đơn, Liflow chỉ thu <strong className="text-foreground">10% trên số tiền thực tế được thanh toán cho gia sư</strong>.
              </p>
            </section>

            {/* Section 6 */}
            <section id="sec-6" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">6.</span> Quy trình đặt lịch và thanh toán
              </h2>
              <div className="relative border-l-2 border-primary/20 pl-6 ml-4 space-y-8 mt-6">
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    1
                  </div>
                  <h4 className="font-semibold text-foreground">Lựa chọn & Xác nhận</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Phụ huynh/học viên lựa chọn gia sư, môn học, thời lượng, lịch học, hình thức học và xác nhận mức học phí hiển thị trên Liflow.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    2
                  </div>
                  <h4 className="font-semibold text-foreground">Thanh toán học phí</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sau khi phụ huynh/học viên xác nhận đặt lịch, hệ thống sẽ yêu cầu thanh toán học phí thông qua phương thức thanh toán được Liflow hỗ trợ (chuyển khoản ngân hàng, ví điện tử, cổng thanh toán trực tuyến...). Khoản tiền được tạm giữ trên hệ thống nhằm bảo vệ quyền lợi đôi bên.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    3
                  </div>
                  <h4 className="font-semibold text-foreground">Xác nhận hoàn tất</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sau khi buổi học hoàn tất và hết thời hạn khiếu nại theo quy định, Liflow sẽ xác nhận giao dịch thành công và thực hiện thanh toán cho gia sư sau khi trừ phí dịch vụ 10%.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="sec-7" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">7.</span> Thời điểm thanh toán cho gia sư
              </h2>
              <p>Gia sư được thanh toán khi đáp ứng đầy đủ các điều kiện sau:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {[
                  "Buổi học đã diễn ra đúng lịch hoặc đã được các bên xác nhận hoàn tất.",
                  "Phụ huynh/học viên không gửi khiếu nại hợp lệ trong thời hạn quy định.",
                  "Gia sư không vi phạm chính sách của Liflow.",
                  "Thông tin tài khoản nhận tiền của gia sư chính xác và hợp lệ.",
                  "Giao dịch không có dấu hiệu gian lận, lạm dụng, thanh toán bất thường hoặc tranh chấp chưa được xử lý.",
                ].map((item, idx) => (
                  <li key={idx} className="bg-card border border-border rounded-xl p-3.5 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mt-4">
                <p className="text-sm text-foreground/95 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Thời gian thanh toán dự kiến cho gia sư là trong vòng <strong>03–07 ngày làm việc</strong> kể từ khi giao dịch được xác nhận thành công, tùy thuộc vào lịch đối soát và phương thức thanh toán.
                  </span>
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="sec-8" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">8.</span> Xử lý đơn học bị hủy hoặc bỏ dở
              </h2>
              
              <div className="space-y-6 mt-4">
                {/* 8.1 */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
                    8.1. Trường hợp gia sư hủy đơn, vắng mặt hoặc bỏ dở buổi học
                  </h3>
                  <p className="text-sm mb-4">
                    Nếu gia sư hủy đơn, vắng mặt, đến trễ quá thời gian hợp lý, tự ý bỏ dở buổi học hoặc không thực hiện buổi học đúng như lịch đã xác nhận, phụ huynh/học viên được xử lý như sau:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 flex flex-col justify-between">
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Hoàn trả học phí</div>
                      <div className="text-base font-bold text-destructive mt-1">Hoàn 100% học phí</div>
                      <p className="text-xs text-muted-foreground mt-2">Dành cho phần buổi học chưa thực hiện.</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex flex-col justify-between">
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Mã giảm giá</div>
                      <div className="text-base font-bold text-primary mt-1">Voucher giảm 5%</div>
                      <p className="text-xs text-muted-foreground mt-2">Áp dụng cho lần đặt lịch học tiếp theo.</p>
                    </div>
                    <div className="bg-success/5 border border-success/10 rounded-xl p-4 flex flex-col justify-between">
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Đổi gia sư</div>
                      <div className="text-base font-bold text-success mt-1">Hỗ trợ đổi Gia sư</div>
                      <p className="text-xs text-muted-foreground mt-2">Nếu phụ huynh/học viên có nhu cầu tiếp tục.</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Trong trường hợp này, gia sư không được nhận thanh toán cho buổi học bị hủy, vắng mặt hoặc bỏ dở do lỗi của gia sư.
                  </p>
                  
                  <div className="border-t border-border pt-4">
                    <span className="text-xs font-semibold text-destructive uppercase tracking-wider block mb-2">Các chế tài áp dụng cho gia sư vi phạm:</span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground list-disc pl-4">
                      <li>Nhắc nhở hoặc cảnh báo tài khoản gia sư.</li>
                      <li>Giảm mức độ hiển thị hồ sơ trên Liflow.</li>
                      <li>Tạm khóa quyền nhận lớp mới.</li>
                      <li>Tạm giữ hoặc từ chối thanh toán các giao dịch tranh chấp.</li>
                      <li>Chấm dứt tài khoản nếu vi phạm nhiều lần hoặc gây ảnh hưởng nghiêm trọng.</li>
                    </ul>
                  </div>
                </div>

                {/* 8.2 */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                    8.2. Trường hợp phụ huynh/học viên hủy đơn
                  </h3>
                  <p className="text-sm mb-4">
                    Nếu phụ huynh/học viên chủ động hủy buổi học sau khi đã đặt lịch thành công, Liflow áp dụng chính sách hoàn tiền theo các mốc thời gian như sau:
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
                      <span className="text-xs text-muted-foreground font-medium block">HỦY TRƯỚC HỌC ≥ 3 NGÀY</span>
                      <span className="text-2xl font-extrabold text-success mt-1.5 block">100%</span>
                      <span className="text-xs text-muted-foreground mt-1 block">Hoàn trả học viên</span>
                    </div>
                    <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
                      <span className="text-xs text-muted-foreground font-medium block">HỦY TRƯỚC HỌC ≥ 1 NGÀY</span>
                      <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1.5 block">80%</span>
                      <span className="text-xs text-muted-foreground mt-1 block">Hoàn trả học viên</span>
                    </div>
                    <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
                      <span className="text-xs text-muted-foreground font-medium block">HỦY TRONG CÙNG NGÀY</span>
                      <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-500 mt-1.5 block">70%</span>
                      <span className="text-xs text-muted-foreground mt-1 block">Hoàn trả học viên</span>
                    </div>
                    <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
                      <span className="text-xs text-muted-foreground font-medium block">QUÁ GIỜ / VẮNG MẶT</span>
                      <span className="text-2xl font-extrabold text-destructive mt-1.5 block">50%</span>
                      <span className="text-xs text-muted-foreground mt-1 block">Hoàn trả học viên</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Phần học phí không được hoàn lại, nếu có, được xem là khoản bù đắp thời gian giữ lịch, chuẩn bị bài học và cơ hội nhận lớp của gia sư. Trường hợp khoản này được thanh toán cho gia sư, Liflow sẽ trừ <strong>10% phí dịch vụ</strong> trên số tiền gia sư được nhận.
                  </p>
                </div>

                {/* 8.3 */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-success" />
                    8.3. Trường hợp hai bên thống nhất đổi lịch
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Nếu phụ huynh/học viên và gia sư cùng thống nhất đổi lịch trước thời điểm học, đơn học sẽ không bị xem là hủy nếu lịch học mới được cập nhật hoặc xác nhận qua Liflow.
                    <br />
                    <strong className="text-foreground">Lưu ý:</strong> Việc đổi lịch cần được thực hiện thông qua hệ thống hoặc kênh hỗ trợ chính thức của Liflow để đảm bảo có căn cứ xử lý nếu phát sinh tranh chấp.
                  </p>
                </div>

                {/* 8.4 */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    8.4. Giá trị của cơ chế xử lý
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cơ chế xử lý đơn học bị hủy hoặc bỏ dở giúp bảo vệ quyền lợi của cả phụ huynh/học viên và gia sư, tạo sự an tâm khi đặt lịch học, đồng thời ràng buộc trách nhiệm của các bên trong việc tôn trọng lịch học đã xác nhận.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section id="sec-9" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">9.</span> Chính sách học thử và đổi gia sư
              </h2>
              <p>
                Tùy từng chương trình, Liflow có thể áp dụng chính sách học thử, buổi đầu tiên hoặc cam kết phù hợp giữa phụ huynh/học viên và gia sư.
              </p>
              <p>
                Nếu sau buổi học đầu tiên phụ huynh/học viên cho rằng gia sư không phù hợp, phụ huynh/học viên có thể gửi yêu cầu đổi gia sư trong vòng <strong>72 giờ</strong> kể từ khi kết thúc buổi học.
              </p>
              <p>Liflow sẽ xem xét yêu cầu dựa trên: gia sư có tham gia đúng giờ, có dạy đúng môn/cấp học và nội dung cam kết, phụ huynh cung cấp lý do rõ ràng hợp lý, có bằng chứng buổi học không đạt thỏa thuận và lịch sử sử dụng dịch vụ.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[
                  { title: "Đổi gia sư", desc: "Đổi sang một gia sư khác phù hợp hơn với nhu cầu học tập." },
                  { title: "Bảo lưu học phí", desc: "Bảo lưu số tiền đã đóng cho buổi học tiếp theo." },
                  { title: "Hoàn học phí", desc: "Hoàn lại một phần hoặc toàn bộ học phí tùy từng trường hợp." },
                  { title: "Từ chối hoàn tiền", desc: "Từ chối nếu buổi học diễn ra đúng thỏa thuận và không có lỗi từ gia sư/Liflow." },
                ].map((item, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 10 */}
            <section id="sec-10" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">10.</span> Chính sách hoàn tiền
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-success/5 border border-success/20 rounded-2xl p-5">
                  <h3 className="font-bold text-success flex items-center gap-2 mb-3 text-base">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    Trường hợp ĐƯỢC hoàn tiền
                  </h3>
                  <ul className="space-y-2 text-sm text-foreground/90 pl-4 list-disc">
                    <li>Gia sư hủy buổi học và phụ huynh/học viên không muốn đổi lịch.</li>
                    <li>Gia sư vắng mặt hoặc không thực hiện buổi học.</li>
                    <li>Gia sư tự ý bỏ dở buổi học.</li>
                    <li>Buổi học không thể diễn ra do lỗi kỹ thuật nghiêm trọng từ Liflow.</li>
                    <li>Phụ huynh/học viên hủy lịch đúng điều kiện hoàn tiền (theo mốc thời gian).</li>
                    <li>Gói học còn buổi chưa sử dụng và phụ huynh/học viên yêu cầu dừng học đúng điều kiện.</li>
                    <li>Liflow xác định khiếu nại của phụ huynh/học viên là hợp lệ.</li>
                  </ul>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
                  <h3 className="font-bold text-destructive flex items-center gap-2 mb-3 text-base">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    Trường hợp KHÔNG ĐƯỢC hoàn tiền toàn bộ
                  </h3>
                  <ul className="space-y-2 text-sm text-foreground/90 pl-4 list-disc">
                    <li>Phụ huynh/học viên hủy sát giờ theo các mốc quy định tại Mục 8.2.</li>
                    <li>Phụ huynh/học viên quá giờ học, không liên hệ, không phản hồi hoặc không tham gia buổi học.</li>
                    <li>Buổi học đã hoàn tất và không có khiếu nại trong thời hạn quy định.</li>
                    <li>Phụ huynh/học viên tự ý giao dịch ngoài Liflow và phát sinh tranh chấp.</li>
                    <li>Phụ huynh/học viên cung cấp thông tin sai, không đầy đủ hoặc không hợp tác khi xử lý.</li>
                    <li>Yêu cầu hoàn tiền dựa trên lý do chủ quan nhưng buổi học đã đúng thỏa thuận.</li>
                    <li>Tài khoản có dấu hiệu lạm dụng chính sách hoàn tiền, gian lận, gây thiệt hại.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section id="sec-11" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">11.</span> Hoàn tiền đối với gói học nhiều buổi
              </h2>
              <p>Nếu phụ huynh/học viên thanh toán gói học nhiều buổi và muốn dừng học, Liflow sẽ xử lý như sau:</p>
              <ul className="space-y-2 text-sm text-foreground list-decimal pl-5">
                <li>Các buổi học đã hoàn tất sẽ không được hoàn lại, trừ trường hợp có khiếu nại hợp lệ.</li>
                <li>Các buổi học chưa diễn ra có thể được hoàn lại hoặc bảo lưu theo yêu cầu của phụ huynh/học viên.</li>
                <li>Nếu gói học có ưu đãi giảm giá, số tiền hoàn lại sẽ được tính lại dựa trên giá trị thực tế của các buổi đã học và chính sách ưu đãi tại thời điểm mua gói.</li>
                <li>Các khoản phí ngân hàng, phí cổng thanh toán hoặc chi phí xử lý giao dịch nếu có có thể được khấu trừ khỏi số tiền hoàn lại.</li>
                <li>Nếu phụ huynh/học viên dừng học do lỗi của gia sư hoặc Liflow, Liflow sẽ ưu tiên hoàn lại phần học phí của các buổi chưa học.</li>
              </ul>
              
              <div className="bg-muted/50 rounded-2xl p-5 border border-border mt-4">
                <h4 className="font-semibold text-sm text-foreground mb-2">Ví dụ cách tính hoàn tiền gói học:</h4>
                <div className="text-sm space-y-1.5 text-muted-foreground">
                  <p>• Phụ huynh/học viên mua gói 10 buổi trị giá <strong className="text-foreground">2.000.000 đồng</strong>.</p>
                  <p>• Đã học 4 buổi, còn 6 buổi chưa học.</p>
                  <p>• Nếu yêu cầu dừng học hợp lệ, số tiền hoàn dự kiến được tính trên giá trị 6 buổi chưa học, sau khi trừ các khoản phí hợp lệ nếu có.</p>
                </div>
              </div>
            </section>

            {/* Section 12 */}
            <section id="sec-12" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">12.</span> Quy trình yêu cầu hoàn tiền
              </h2>
              <p>
                Để yêu cầu hoàn tiền, phụ huynh/học viên cần gửi yêu cầu qua email <a href="mailto:khiemlgse184337@fpt.edu.vn" className="text-primary font-semibold hover:underline">khiemlgse184337@fpt.edu.vn</a> hoặc số điện thoại hỗ trợ <strong className="text-foreground">0822332952</strong> trong vòng <strong className="text-primary font-bold">72 giờ</strong> kể từ thời điểm phát sinh sự việc.
              </p>
              
              <div className="bg-card border border-border rounded-2xl p-6 mt-4">
                <h3 className="font-semibold text-foreground mb-4">Yêu cầu hoàn tiền cần bao gồm:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Họ tên và thông tin tài khoản.",
                    "Mã giao dịch hoặc thông tin buổi học.",
                    "Tên gia sư.",
                    "Lý do yêu cầu hoàn tiền.",
                    "Bằng chứng liên quan nếu có (ảnh chụp màn hình, tin nhắn, lịch học, biên lai, ghi chú...).",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-foreground/90">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Liflow sẽ tiếp nhận và phản hồi yêu cầu trong vòng <strong>01–03 ngày làm việc</strong>. Thời gian xử lý hoàn tiền, nếu được chấp thuận, dự kiến từ <strong>03–10 ngày làm việc</strong>, tùy thuộc vào phương thức thanh toán và đơn vị cung cấp dịch vụ thanh toán.
              </p>
            </section>

            {/* Section 13 */}
            <section id="sec-13" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">13.</span> Khiếu nại và giải quyết tranh chấp
              </h2>
              <p>Phụ huynh/học viên và gia sư có quyền gửi khiếu nại khi phát sinh vấn đề liên quan đến lịch học, chất lượng buổi học, thanh toán, hoàn tiền, hành vi ứng xử hoặc các vấn đề khác trong quá trình sử dụng Liflow.</p>
              <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5 flex items-start gap-3 my-4">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/95">
                  Thời hạn gửi khiếu nại là trong vòng <strong>72 giờ</strong> kể từ khi kết thúc buổi học hoặc kể từ thời điểm phát sinh sự việc.
                </span>
              </div>
              <p>Sau khi nhận khiếu nại, Liflow có thể thực hiện các bước sau:</p>
              <ul className="space-y-2 text-sm text-foreground pl-5 list-decimal">
                <li>Ghi nhận nội dung khiếu nại.</li>
                <li>Yêu cầu các bên cung cấp thông tin, tài liệu và bằng chứng.</li>
                <li>Tạm giữ khoản thanh toán liên quan cho đến khi có kết quả xử lý.</li>
                <li>Đối chiếu dữ liệu trên hệ thống (lịch học, tin nhắn, xác nhận tham gia, lịch sử thanh toán...).</li>
                <li>Đưa ra phương án xử lý phù hợp (hoàn tiền, thanh toán cho gia sư, đổi gia sư, cấp voucher, cảnh báo/tạm khóa tài khoản...).</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2 italic">
                * Quyết định xử lý của Liflow sẽ dựa trên thông tin, bằng chứng và mức độ hợp tác của các bên. Liflow khuyến khích các bên trao đổi thiện chí, trung thực và tôn trọng lẫn nhau trong quá trình giải quyết tranh chấp.
              </p>
            </section>

            {/* Section 14 */}
            <section id="sec-14" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">14.</span> Trường hợp Liflow được quyền tạm giữ hoặc từ chối thanh toán
              </h2>
              <p>Liflow có quyền tạm giữ hoặc từ chối thanh toán cho gia sư trong các trường hợp sau:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {[
                  "Buổi học đang có khiếu nại chưa được xử lý.",
                  "Gia sư vắng mặt, hủy lịch không hợp lệ hoặc không đúng thỏa thuận.",
                  "Gia sư tự ý bỏ dở buổi học.",
                  "Gia sư cung cấp thông tin sai sự thật về trình độ, kinh nghiệm, bằng cấp hoặc danh tính.",
                  "Gia sư có hành vi lôi kéo phụ huynh/học viên giao dịch ngoài Liflow.",
                  "Gia sư vi phạm quy định ứng xử, gây ảnh hưởng học viên/phụ huynh hoặc uy tín hệ thống.",
                  "Giao dịch có dấu hiệu gian lận, bất thường hoặc vi phạm pháp luật.",
                  "Cơ quan có thẩm quyền yêu cầu tạm dừng, kiểm tra hoặc xử lý giao dịch.",
                ].map((item, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-start">
                    <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
                    <span className="text-xs text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2 italic">
                * Trong trường hợp khoản thanh toán bị tạm giữ, Liflow sẽ thông báo lý do cho gia sư và tiến hành xem xét trong thời hạn hợp lý.
              </p>
            </section>

            {/* Section 15 */}
            <section id="sec-15" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">15.</span> Quy định chống giao dịch ngoài Liflow
              </h2>
              <p>
                Phụ huynh/học viên và gia sư không được lợi dụng Liflow để kết nối ban đầu rồi tự ý thanh toán, thỏa thuận hoặc giao dịch ngoài nền tảng nhằm né tránh phí dịch vụ.
              </p>
              
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 mt-4">
                <h3 className="font-bold text-destructive flex items-center gap-2 mb-3 text-base">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  Các hành vi bị cấm bao gồm nhưng không giới hạn ở:
                </h3>
                <ul className="space-y-2 text-sm text-foreground/90 pl-4 list-disc">
                  <li>Gia sư gửi số điện thoại, tài khoản mạng xã hội, tài khoản ngân hàng hoặc phương thức liên hệ bên ngoài để yêu cầu phụ huynh/học viên thanh toán trực tiếp.</li>
                  <li>Phụ huynh/học viên yêu cầu gia sư giảm giá bằng cách thanh toán ngoài Liflow.</li>
                  <li>Hai bên thỏa thuận hủy giao dịch trên Liflow nhưng vẫn học và thanh toán riêng bên ngoài.</li>
                  <li>Lợi dụng thông tin có được từ Liflow để tiếp tục giao dịch riêng mà không thông qua hệ thống.</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 mt-4">
                <h4 className="font-semibold text-foreground mb-2">Nếu phát hiện vi phạm, Liflow có quyền:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground pl-4 list-decimal">
                  <li>Từ chối hỗ trợ hoàn tiền hoặc giải quyết tranh chấp đối với giao dịch ngoài Liflow.</li>
                  <li>Tạm khóa hoặc chấm dứt tài khoản vi phạm.</li>
                  <li>Giữ lại hoặc truy thu khoản phí dịch vụ đáng lẽ phát sinh.</li>
                  <li>Từ chối thanh toán các giao dịch có dấu hiệu gian lận.</li>
                  <li>Áp dụng các biện pháp cần thiết khác để bảo vệ quyền lợi hợp pháp của Liflow và người dùng.</li>
                </ul>
              </div>
            </section>

            {/* Section 16 */}
            <section id="sec-16" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">16.</span> Trách nhiệm của gia sư
              </h2>
              <ul className="space-y-2.5 text-sm text-foreground pl-5 list-decimal font-medium text-foreground/90">
                <li>Cung cấp thông tin cá nhân, kinh nghiệm, trình độ, môn dạy và mức học phí trung thực.</li>
                <li>Dạy đúng môn học, thời lượng, hình thức và nội dung đã cam kết.</li>
                <li>Có mặt đúng giờ, chuẩn bị bài học phù hợp và ứng xử văn minh.</li>
                <li>Không đưa ra cam kết sai lệch về kết quả học tập.</li>
                <li>Không thu thêm tiền từ phụ huynh/học viên ngoài khoản học phí đã hiển thị trên Liflow, trừ khi được Liflow cho phép hoặc có thỏa thuận rõ ràng được ghi nhận trên hệ thống.</li>
                <li>Không lôi kéo phụ huynh/học viên giao dịch ngoài Liflow.</li>
                <li>Tuân thủ quy định pháp luật liên quan đến hoạt động dạy thêm, học thêm, bảo vệ trẻ em, bảo vệ dữ liệu cá nhân và các quy định liên quan khác.</li>
                <li>Hợp tác với Liflow khi có khiếu nại, tranh chấp hoặc yêu cầu xác minh thông tin.</li>
              </ul>
            </section>

            {/* Section 17 */}
            <section id="sec-17" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">17.</span> Trách nhiệm của phụ huynh/học viên
              </h2>
              <ul className="space-y-2.5 text-sm text-foreground pl-5 list-decimal font-medium text-foreground/90">
                <li>Cung cấp thông tin học viên, nhu cầu học tập, cấp học, môn học và lịch học chính xác.</li>
                <li>Thanh toán học phí đúng hạn thông qua phương thức được Liflow hỗ trợ.</li>
                <li>Tham gia buổi học đúng giờ hoặc thông báo sớm khi cần thay đổi lịch.</li>
                <li>Tôn trọng gia sư, không có hành vi xúc phạm, quấy rối, đe dọa hoặc gây áp lực không phù hợp.</li>
                <li>Không yêu cầu gia sư giao dịch ngoài Liflow để né phí dịch vụ.</li>
                <li>Gửi khiếu nại trong thời hạn quy định nếu phát sinh vấn đề.</li>
                <li>Hợp tác cung cấp thông tin, bằng chứng khi Liflow xử lý khiếu nại hoặc hoàn tiền.</li>
              </ul>
            </section>

            {/* Section 18 */}
            <section id="sec-18" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">18.</span> Chất lượng dịch vụ và giới hạn trách nhiệm
              </h2>
              <p>
                Liflow nỗ lực kiểm tra, xác minh và hiển thị thông tin gia sư một cách hợp lý. Tuy nhiên, Liflow không bảo đảm rằng mọi thông tin do gia sư cung cấp luôn tuyệt đối chính xác, đầy đủ hoặc phù hợp với mọi nhu cầu học tập của học viên.
              </p>
              <p>
                Kết quả học tập phụ thuộc vào nhiều yếu tố, bao gồm năng lực học viên, mức độ tham gia, thời lượng học, phương pháp giảng dạy, sự phối hợp của phụ huynh/học viên và các điều kiện khách quan khác. Do đó, Liflow không cam kết học viên sẽ đạt một kết quả cụ thể sau khi học với gia sư.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mt-4">
                <p className="text-sm text-foreground/95 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Trong phạm vi pháp luật cho phép, trách nhiệm của Liflow đối với một giao dịch tranh chấp sẽ không vượt quá số tiền phụ huynh/học viên đã thanh toán cho giao dịch đó.
                  </span>
                </p>
              </div>
            </section>

            {/* Section 19 */}
            <section id="sec-19" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">19.</span> Bảo vệ học viên chưa thành niên
              </h2>
              <p>
                Đối với học viên dưới 18 tuổi, phụ huynh hoặc người giám hộ hợp pháp có trách nhiệm giám sát quá trình sử dụng dịch vụ, lựa chọn gia sư, đặt lịch, thanh toán và theo dõi buổi học.
              </p>
              <p>
                Gia sư không được có hành vi, lời nói hoặc nội dung giảng dạy không phù hợp với độ tuổi, xâm phạm quyền riêng tư, gây tổn hại tinh thần, quấy rối, phân biệt đối xử hoặc vi phạm quy định về bảo vệ trẻ em.
              </p>
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 mt-4">
                <p className="text-sm text-foreground/95 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <span>
                    Liflow có quyền tạm khóa hoặc chấm dứt tài khoản gia sư ngay lập tức nếu phát hiện hành vi có nguy cơ ảnh hưởng đến sự an toàn, quyền lợi hoặc nhân phẩm của học viên.
                  </span>
                </p>
              </div>
            </section>

            {/* Section 20 */}
            <section id="sec-20" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">20.</span> Thuế và nghĩa vụ tài chính
              </h2>
              <p>
                Gia sư chịu trách nhiệm tự kê khai, nộp thuế và thực hiện các nghĩa vụ tài chính cá nhân phát sinh từ khoản thu nhập nhận được thông qua Liflow, trừ khi pháp luật hoặc thỏa thuận riêng có quy định khác.
              </p>
              <p>
                Liflow có thể khấu trừ, kê khai hoặc cung cấp thông tin giao dịch theo yêu cầu của cơ quan có thẩm quyền nếu pháp luật yêu cầu.
              </p>
              <p>
                Phí dịch vụ 10% là khoản phí Liflow thu từ gia sư để cung cấp dịch vụ kết nối, vận hành hệ thống, hỗ trợ thanh toán, chăm sóc khách hàng và xử lý tranh chấp.
              </p>
            </section>

            {/* Section 21 */}
            <section id="sec-21" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">21.</span> Bảo mật thông tin và dữ liệu giao dịch
              </h2>
              <p>
                Liflow thu thập và xử lý thông tin người dùng nhằm mục đích vận hành dịch vụ, xác minh tài khoản, xử lý thanh toán, hỗ trợ khách hàng, giải quyết khiếu nại và tuân thủ quy định pháp luật.
              </p>
              <p>
                Phụ huynh/học viên và gia sư không được tự ý tiết lộ, mua bán, khai thác hoặc sử dụng thông tin cá nhân của bên còn lại cho mục đích ngoài phạm vi học tập đã thỏa thuận.
              </p>
              <p>
                Liflow sẽ áp dụng các biện pháp hợp lý để bảo vệ thông tin người dùng, nhưng người dùng cũng có trách nhiệm tự bảo mật tài khoản, mật khẩu, thiết bị và thông tin đăng nhập của mình.
              </p>
            </section>

            {/* Section 22 */}
            <section id="sec-22" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">22.</span> Các hành vi bị cấm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {[
                  "Cung cấp thông tin giả mạo hoặc sai sự thật.",
                  "Gian lận thanh toán, lạm dụng hoàn tiền hoặc tạo giao dịch giả.",
                  "Xâm phạm tài khoản, dữ liệu hoặc hệ thống của Liflow.",
                  "Quấy rối, xúc phạm, đe dọa, phân biệt đối xử hoặc hành vi không phù hợp.",
                  "Đăng tải nội dung vi phạm pháp luật, trái đạo đức, không hợp môi trường giáo dục.",
                  "Lôi kéo giao dịch ngoài Liflow.",
                  "Sử dụng cho mục đích rửa tiền, lừa đảo hoặc hoạt động bất hợp pháp.",
                  "Vi phạm quyền sở hữu trí tuệ, quyền riêng tư bên thứ ba.",
                ].map((item, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-3 flex items-start gap-2.5">
                    <X className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 23 */}
            <section id="sec-23" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">23.</span> Chế tài xử lý vi phạm
              </h2>
              <p>Tùy theo mức độ vi phạm, Liflow có quyền áp dụng một hoặc nhiều biện pháp sau:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {[
                  { title: "Cảnh cáo", desc: "Nhắc nhở hoặc cảnh báo tài khoản người dùng." },
                  { title: "Ẩn hồ sơ", desc: "Tạm ẩn hồ sơ gia sư trên danh sách hiển thị." },
                  { title: "Khóa quyền", desc: "Tạm khóa quyền đặt lịch học hoặc nhận lớp học." },
                  { title: "Giữ thanh toán", desc: "Tạm giữ hoặc từ chối thanh toán giao dịch tranh chấp." },
                  { title: "Hủy đơn & hoàn tiền", desc: "Hủy giao dịch và hoàn trả tiền cho phụ huynh/học viên." },
                  { title: "Cấp voucher", desc: "Cấp voucher hỗ trợ cho phụ huynh/học viên trong trường hợp phù hợp." },
                  { title: "Chấm dứt tài khoản", desc: "Khóa vĩnh viễn tài khoản và từ chối cung cấp dịch vụ." },
                  { title: "Từ chối dịch vụ", desc: "Từ chối cung cấp dịch vụ trong tương lai." },
                  { title: "Báo cáo pháp luật", desc: "Cung cấp thông tin cho cơ quan thẩm quyền nếu có dấu hiệu vi phạm pháp luật." },
                ].map((item, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 24 */}
            <section id="sec-24" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">24.</span> Thay đổi chính sách
              </h2>
              <p>
                Liflow có quyền sửa đổi, bổ sung hoặc cập nhật chính sách này theo từng thời điểm để phù hợp với hoạt động kinh doanh, nhu cầu vận hành và quy định pháp luật.
              </p>
              <p>
                Phiên bản cập nhật sẽ được công bố trên website hoặc ứng dụng của Liflow. Việc người dùng tiếp tục sử dụng dịch vụ sau khi chính sách được cập nhật được xem là đã đồng ý với nội dung chính sách mới.
              </p>
              <p>
                Đối với các giao dịch đã phát sinh trước thời điểm chính sách mới có hiệu lực, Liflow sẽ áp dụng chính sách có hiệu lực tại thời điểm giao dịch được xác nhận, trừ khi chính sách mới có lợi hơn cho người dùng hoặc pháp luật có quy định khác.
              </p>
            </section>

            {/* Section 25 */}
            <section id="sec-25" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 pb-2 border-b border-border">
                <span className="text-primary">25.</span> Thông tin liên hệ
              </h2>
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Mọi câu hỏi, yêu cầu hỗ trợ, khiếu nại hoặc yêu cầu hoàn tiền vui lòng liên hệ:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Đơn vị</div>
                      <div className="text-sm font-semibold mt-0.5 text-foreground">Nền tảng Liflow</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Địa chỉ</div>
                      <div className="text-sm font-semibold mt-0.5 text-foreground">74 Lê Văn Việt, Thủ Đức, Thành phố Hồ Chí Minh</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Email hỗ trợ</div>
                      <a href="mailto:khiemlgse184337@fpt.edu.vn" className="text-sm font-semibold mt-0.5 text-primary hover:underline flex items-center gap-0.5">
                        khiemlgse184337@fpt.edu.vn
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Số điện thoại</div>
                      <a href="tel:0822332952" className="text-sm font-semibold mt-0.5 text-foreground hover:text-primary">
                        0822332952
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Thời gian hỗ trợ</div>
                      <div className="text-sm font-semibold mt-0.5 text-foreground">
                        08:00–17:30, từ Thứ Hai đến Thứ Sáu, trừ ngày lễ, Tết theo quy định pháp luật.
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border">
                  Liflow khuyến khích phụ huynh/học viên và gia sư liên hệ qua kênh hỗ trợ chính thức để mọi yêu cầu được ghi nhận và xử lý minh bạch.
                </p>
              </div>
            </section>

          </main>
        </div>
      </Container>
    </div>
  );
}
