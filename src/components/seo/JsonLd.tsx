// Render dữ liệu có cấu trúc (schema.org) dưới dạng <script type="application/ld+json">.
// Dùng được ở cả server component lẫn client component.

export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // schema.org JSON-LD: nội dung do app sinh ra, an toàn để nhúng.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
