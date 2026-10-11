// Muestra un texto y convierte en enlace (clicable) lo que empiece por
// http://, https:// o www.   Nunca usa HTML crudo: React escapa todo lo demás.

const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/i;

// signos que suelen venir pegados al final del enlace ("mira https://a.com.")
const TRAILING = /[.,;:!?)\]}'"]+$/;

interface LinkifiedTextProps {
  text: string;
}

export function LinkifiedText({ text }: LinkifiedTextProps) {
  // al partir con un grupo de captura, los enlaces quedan en los índices impares
  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;

        const trailing = part.match(TRAILING)?.[0] ?? "";
        const url = trailing ? part.slice(0, -trailing.length) : part;
        const href = url.toLowerCase().startsWith("www.") ? `https://${url}` : url;

        return (
          <span key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="chat-link"
            >
              {url}
            </a>
            {trailing}
          </span>
        );
      })}
    </>
  );
}
