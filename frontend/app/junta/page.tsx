import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  BookOpen,
  Handshake,
  Megaphone,
  MessagesSquare,
  Landmark,
  Search,
  ArrowRight,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import FotoZoom from '@/components/FotoZoom';

export const metadata: Metadata = {
  title: 'Junta Diocesana de Historia Eclesiástica',
  description:
    'Identidad, finalidad y ejecución de la Junta Diocesana de Historia Eclesiástica de la Diócesis Villa de la Concepción del Río Cuarto',
};

const finalidades = [
  {
    icon: Search,
    titulo: 'Promover la investigación histórica',
    desc: 'Promover la investigación histórica referida al Pueblo de Dios en la Diócesis Villa de la Concepción del Río Cuarto. Para ello, se utilizarán y optimizarán los fondos históricos disponibles.',
  },
  {
    icon: BookOpen,
    titulo: 'Aunar el propósito científico y pastoral',
    desc: 'En el estudio y la difusión de la historia diocesana: lo primero, para contribuir a la amplitud y profundidad del conocimiento en la comunidad académica sobre la historia de la Iglesia en este territorio; lo segundo, para favorecer la comprensión y las dinámicas de comunidades parroquiales y movimientos mediante la recuperación y la celebración de lo construido históricamente en la diócesis (aniversarios parroquiales y diocesanos, aportes de la vida religiosa, historias de sacerdotes, religiosos y laicos, y su participación en el desarrollo de sus comunidades).',
  },
  {
    icon: Megaphone,
    titulo: 'Difundir investigaciones',
    desc: 'Mediante publicaciones periódicas, conferencias, presentaciones y otras propuestas.',
  },
  {
    icon: MessagesSquare,
    titulo: 'Asesorar a los interesados',
    desc: 'Asesorar a los interesados en la investigación histórica en lo referente a la historia eclesiástica diocesana en cuanto sea motivo de consulta.',
  },
  {
    icon: Landmark,
    titulo: 'Conservar y valorar el patrimonio',
    desc: 'Promover la conservación y la valoración del patrimonio cultural mueble e inmueble, así como del patrimonio intangible de la Iglesia Católica que peregrina en la Diócesis Villa de la Concepción del Río Cuarto, en conjunto con la Comisión Diocesana de Bienes Culturales.',
  },
  {
    icon: Handshake,
    titulo: 'Generar vínculos con otras instituciones',
    desc: 'Con instituciones que tengan interés académico, especialmente en lo que atañe a la investigación histórica, y favorecer convenios con las mismas, en orden a crear redes que permitan el intercambio y el enriquecimiento mutuos.',
  },
];

const acciones = [
  'Establecer contacto y generar reuniones de trabajo y diálogo con las instituciones mencionadas en el artículo 6.',
  'Proponer e incentivar investigaciones sobre temáticas específicas de la historia del Pueblo de Dios en la diócesis.',
  'Organizar tareas de difusión de investigaciones históricas realizadas con ocasión de aniversarios en relación a la Diócesis.',
  'Establecer concursos y promover estudios y otras actividades que activen el empleo de los fondos históricos disponibles.',
  'Concretar propuestas que pongan de relieve la función pastoral de los archivos eclesiásticos y la importancia del patrimonio histórico.',
];

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`mb-3 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <div className="h-px w-8 bg-sky-300" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">{children}</span>
      {center && <div className="h-px w-8 bg-sky-300" />}
    </div>
  );
}

export default function JuntaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Eyebrow>Diócesis Villa de la Concepción del Río Cuarto</Eyebrow>
            <h1 className="mb-6 text-[clamp(32px,4.5vw,48px)] font-light leading-[1.1] tracking-tight text-slate-900">
              Junta Diocesana<br />
              <span className="font-semibold text-sky-800">de Historia Eclesiástica</span>
            </h1>
            <p className="mb-4 text-base font-light leading-relaxed text-slate-600">
              Un espacio dedicado a la investigación, la difusión y la valoración de la historia del Pueblo de Dios en el sur
              de Córdoba, a partir de los fondos documentales que conservan los archivos de la diócesis.
            </p>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              Une el propósito científico y el pastoral en el estudio de la historia diocesana.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#finalidad"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-white no-underline shadow-sm transition-colors hover:bg-sky-700"
              >
                Finalidad
              </a>
              <a
                href="#ejecucion"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-slate-700 no-underline transition-colors hover:border-sky-200 hover:text-sky-800"
              >
                Ejecución
              </a>
            </div>
          </div>
          <div className="relative">
            <FotoZoom
              src="/junta/libros-antiguos.jpg"
              alt="Libros y documentos antiguos"
              width={600}
              height={400}
              className="h-[420px] w-full rounded-xl border border-slate-100 shadow-sm"
              priority
            />
            <div className="absolute -bottom-6 -left-6 hidden w-52 overflow-hidden rounded-lg border-4 border-white shadow-md sm:block">
              <FotoZoom src="/junta/protocolo-1816.jpg" alt="Protocolo N° 2, año 1816-1817" width={700} height={466} className="w-full" />
            </div>
          </div>
        </section>

        {/* Identidad e historia */}
        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>Identidad e historia</Eyebrow>
              <h2 className="mb-6 text-3xl font-light tracking-tight text-slate-900">
                Una inquietud frente a los <span className="font-semibold text-sky-800">fondos por trabajar</span>
              </h2>
              <div className="rounded-xl border border-slate-100 bg-white p-6">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-700">Artículo 2</div>
                <p className="text-sm leading-relaxed text-slate-600">
                  La Junta surge como inquietud frente a la cantidad de fondos que aún no han sido trabajados, tanto en el
                  archivo histórico de la Biblioteca-Archivo «Juan Bautista Fassi» del Seminario Mayor «Jesús Buen Pastor»
                  como en el Archivo Histórico Diocesano, y con ocasión de cumplirse los diez años de la inauguración de este
                  último.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[1.6fr_1fr] gap-3">
              <FotoZoom src="/junta/iglesia-plaza.jpg" alt="Antigua iglesia de Río Cuarto frente a la plaza" width={885} height={500} className="h-64 w-full rounded-lg border border-slate-100" />
              <FotoZoom src="/junta/iglesia-parroquial.jpg" alt="Río Cuarto, Iglesia parroquial (postal antigua)" width={178} height={282} className="h-64 w-full rounded-lg border border-slate-100" imgClassName="object-top" />
              <p className="col-span-2 text-[11px] text-slate-400">Río Cuarto antiguo · Iglesia parroquial</p>
            </div>
          </div>
        </section>

        {/* Finalidad */}
        <section id="finalidad" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow center>Finalidad</Eyebrow>
            <h2 className="mb-5 text-3xl font-light tracking-tight text-slate-900">
              Investigar, difundir y <span className="font-semibold text-sky-800">valorar la historia</span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Los objetivos que orientan el trabajo de la Junta en la diócesis.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {finalidades.map(({ icon: Icon, titulo, desc }, i) => (
              <div key={titulo} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <Icon size={16} />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-700">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-slate-800">{titulo}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ejecución */}
        <section id="ejecucion" className="scroll-mt-16 border-t border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1fr_1.4fr]">
            <div>
              <Eyebrow>Ejecución</Eyebrow>
              <h2 className="mb-5 text-3xl font-light tracking-tight text-slate-900">
                Para cumplir con <span className="font-semibold text-sky-800">dichas finalidades</span>
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Las líneas de acción con las que la Junta lleva adelante su tarea, junto a las instituciones y comunidades de
                la diócesis.
              </p>
            </div>
            <ol className="relative border-l border-sky-100 pl-8">
              {acciones.map((texto, i) => (
                <li key={i} className="relative mb-7 last:mb-0">
                  <span className="absolute -left-[37px] top-1 h-3 w-3 rounded-full border-2 border-white bg-sky-700 ring-2 ring-sky-100" />
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-1 shrink-0 text-sky-700" />
                    <p className="text-sm leading-relaxed text-slate-600">{texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Reflexión */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <blockquote className="mx-auto max-w-3xl text-center">
            <Quote size={22} className="mx-auto mb-4 text-sky-300" />
            <p className="text-xl font-light leading-relaxed text-slate-700">
              Recuperar y celebrar lo construido históricamente en la diócesis: aniversarios, la vida religiosa y las
              historias de sacerdotes, religiosos y laicos en sus comunidades.
            </p>
          </blockquote>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-100">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center">
            <h2 className="mb-3 text-2xl font-light tracking-tight text-slate-900">
              Conozca el <span className="font-semibold text-sky-800">Archivo Histórico Diocesano</span>
            </h2>
            <p className="mb-8 max-w-md text-sm text-slate-500">
              Los fondos históricos disponibles son la base del trabajo de investigación de la Junta.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/consulta"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-white no-underline shadow-sm transition-colors hover:bg-sky-700"
              >
                Consulta de Documentos
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-slate-700 no-underline transition-colors hover:border-sky-200 hover:text-sky-800"
              >
                Ver el Archivo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-10 pt-1 pb-5 text-center">
        <p className="text-[11px] tracking-wide text-slate-400">
          Junta Diocesana de Historia Eclesiástica · Diócesis Villa de la Concepción del Río Cuarto
        </p>
      </footer>
      <footer className="border-t border-slate-100 px-10 py-5">
        <div className="flex justify-end items-center gap-1">
          <Image src="/isologo.png" alt="Logo Brix" width={18} height={20} />
          <small className="text-[9px] text-slate-500 font-medium">BrixSoftware</small>
        </div>
      </footer>
    </div>
  );
}
