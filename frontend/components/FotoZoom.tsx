'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, X } from 'lucide-react';

interface FotoZoomProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Clases del contenedor (tamaño, bordes, redondeo) */
  className?: string;
  /** Clases extra de la imagen (ej. object-top) */
  imgClassName?: string;
  priority?: boolean;
}

/**
 * Imagen con zoom al pasar el mouse; al hacer clic la abre en grande
 * con la opción de verla original en otra pestaña
 */
export default function FotoZoom({ src, alt, width, height, className = '', imgClassName = '', priority }: FotoZoomProps) {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    if (!abierta) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAbierta(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierta]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label={`Ampliar imagen: ${alt}`}
        className={`group relative block cursor-zoom-in overflow-hidden ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${imgClassName}`}
        />
      </button>

      {abierta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setAbierta(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-950/90 p-4 backdrop-blur-sm"
        >
          <div className="absolute right-4 top-4 flex gap-2">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white no-underline transition-colors hover:bg-white/20"
            >
              <ExternalLink size={14} />
              Abrir original
            </a>
            <button
              type="button"
              onClick={() => setAbierta(false)}
              aria-label="Cerrar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
          <p className="max-w-2xl text-center text-sm text-slate-300">{alt}</p>
        </div>
      )}
    </>
  );
}
