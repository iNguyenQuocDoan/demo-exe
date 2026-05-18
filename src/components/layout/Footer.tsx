import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Youtube, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer
      id="policy"
      className="border-t border-border bg-foreground text-white"
    >
      <div className="site-container py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 text-2xl font-bold">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/20">
                <Image
                  src="/logo.png"
                  alt="LIFLOW"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              LI<span className="text-accent">FLOW</span>
            </div>
            <p className="text-base leading-relaxed text-white/70">
              Nền tảng kết nối gia sư uy tín và phụ huynh/học sinh trên toàn
              quốc.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                aria-label="LIFLOW tren Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="LIFLOW tren YouTube"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="LIFLOW tren Zalo"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-5 text-base font-semibold">Tìm Gia Sư</h4>
            <ul className="space-y-3 text-base text-white/70">
              <li>
                <Link
                  href="/tutors?subject=math"
                  className="hover:text-white transition-colors"
                >
                  Dạy Toán
                </Link>
              </li>
              <li>
                <Link
                  href="/tutors?subject=english"
                  className="hover:text-white transition-colors"
                >
                  Tiếng Anh
                </Link>
              </li>
              <li>
                <Link
                  href="/tutors?subject=physics"
                  className="hover:text-white transition-colors"
                >
                  Vật Lý
                </Link>
              </li>
              <li>
                <Link
                  href="/tutors?subject=chem"
                  className="hover:text-white transition-colors"
                >
                  Hóa Học
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-base font-semibold">Dành cho</h4>
            <ul className="space-y-3 text-base text-white/70">
              <li>
                <Link
                  href="/auth/register"
                  className="hover:text-white transition-colors"
                >
                  Phụ Huynh
                </Link>
              </li>
              <li>
                <Link
                  href="/apply-tutor"
                  className="hover:text-white transition-colors"
                >
                  Gia Sư
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  Cách hoạt động
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-base font-semibold">Hỗ Trợ</h4>
            <ul className="space-y-3 text-base text-white/70">
              <li>
                <Link
                  href="/#faq"
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@liflow.vn"
                  className="hover:text-white transition-colors"
                >
                  Liên hệ
                </a>
              </li>
              <li>
                <Link
                  href="/#policy"
                  className="hover:text-white transition-colors"
                >
                  Điều khoản
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-7 text-center text-sm text-white/50">
          © 2026 LIFLOW. Mọi quyền được bảo lưu. (MVP Demo)
        </div>
      </div>
    </footer>
  );
}
