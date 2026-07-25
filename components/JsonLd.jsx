/**
 * Safe JSON-LD injector for confirmed structural data only.
 * @param {{ data: object | object[] }} props
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload)
      }}
    />
  );
}
