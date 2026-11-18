/**
 * Renders structured data (JSON-LD) safely.
 *
 * React escapes text children inside <script> tags (quotes become &quot;),
 * which produces invalid JSON and makes Google Search Console report
 * "Unparsable structured data". We therefore inject the serialized JSON
 * with dangerouslySetInnerHTML and escape "<" so the payload can never
 * terminate the script element early.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
