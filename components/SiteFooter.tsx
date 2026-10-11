import Image from "next/image";

/** 简洁页脚，呼应品牌而不喧宾夺主 */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Image
            src="/logo-mark.jpg"
            alt="简阅"
            width={28}
            height={28}
            className="site-brand__mark"
          />
          <span>简阅</span>
        </div>
        <p className="site-footer__copy">
          输入网址，一键生成简洁中文概要
        </p>
        <p className="site-footer__meta">© 2026 简阅</p>
      </div>
    </footer>
  );
}
