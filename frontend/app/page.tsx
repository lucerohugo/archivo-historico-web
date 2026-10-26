import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  Search,
  Landmark,
  Church,
  ScrollText,
  GraduationCap,
  Users,
  FileSearch,
  Quote,
  ArrowRight,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import FotoZoom from '@/components/FotoZoom';

export const metadata: Metadata = {
  title: 'Archivo Histórico Diocesano',
  description:
    'Reseña, acervo documental y servicios del Archivo Histórico Diocesano Villa de la Concepción del Río Cuarto',
};

const hitos = [
  { anio: '1731', texto: 'Creación del Curato del Río Cuarto, cuya jurisdicción abarcaba todo el sur de la provincia de Córdoba.' },
  { anio: '1934', texto: 'El 20 de abril, por bula de S.S. Pío XI, se crea la Diócesis de Río Cuarto, desprendiéndose de la Arquidiócesis de Córdoba.' },
  { anio: '2010', texto: 'A fines de 2010 Mons. Eduardo E. Martín encomienda al Pbro. Dr. Juan Carlos Giordano un proyecto integral de reorganización del Archivo, nombrándolo director, con el Pbro. Ignacio Costa como asesor.' },
  { anio: '2011', texto: 'Comienzan las tareas: acondicionamiento de la nueva sede en el Seminario Mayor Jesús Buen Pastor e intervención del fondo documental según los principios de la archivística, con fondos propios y el apoyo del Programa para Bibliotecas y Archivos Latinoamericanos de la Universidad de Harvard.' },
  { anio: '2013', texto: 'El 3 de enero se traslada la documentación del Obispado a la nueva sede. El Decreto 1742/13 del 5 de julio dispone la centralización de la documentación más antigua de la Diócesis, y el 6 de julio se traslada la de la Iglesia Catedral.' },
  { anio: '2014', texto: 'El 19 de agosto Mons. Eduardo Eliseo Martín bendice e inaugura la nueva sede del Archivo Histórico Diocesano.' },
  { anio: '2016 - 2018', texto: 'Restauración de Libros Parroquiales con fondos propios y con la XXII Convocatoria de Ayudas a Proyectos Archivísticos de Adai-Iberarchivos.' },
  { anio: '2020 - 2021', texto: 'Proyecto «Desempolvando archivos» (Fundación Williams y Fundación Bunge y Born): sistema informático y puesta en línea de los fondos más antiguos (1775-1932).' },
  { anio: '2022 - hoy', texto: 'Continúan los trabajos de restauración con el Fondo Antiguo - Laboratorio de la Compañía de Jesús en Argentina y profesionales particulares.' },
];

const fondos = [
  {
    nombre: 'Archivo de la Iglesia Catedral',
    periodo: '1775 - 1932',
    imagen: '/archivo/catedral-antigua.jpg',
    desc: 'Inventarios de capillas e iglesias, consentimientos matrimoniales, licencias de militares, informes de matrimonios, cartas varias, comunicaciones con las autoridades civiles, circulares y autorizaciones para celebrar misa.',
  },
  {
    nombre: 'Obispado de Río Cuarto',
    periodo: '1838 - 1910',
    imagen: '/archivo/procesion-antigua.jpg',
    desc: 'Inventarios del curato y sus capillas, dispensas, licencias, pedidos de facultades, autorizaciones para contraer matrimonio, cartas de fieles, sacerdotes y asociaciones, informes de misiones, nombramientos de sacerdotes e informes anuales.',
  },
];

const colecciones = [
  'Fondo Iglesia Catedral',
  'Fondo Obispado',
  'Boletines y revistas eclesiásticas',
  'Biblioteca',
  'Colección P. Ignacio Costa',
  'Archivos de la Nunciatura y Santa Sede',
  'Colección P. Héctor Pereyra',
  'Música sacra y partituras',
];

const servicios = [
  { icon: GraduationCap, titulo: 'Investigadores, docentes y estudiantes', desc: 'Universidad Nacional de Río Cuarto, Seminario Mayor Jesús Buen Pastor, ISMI y otros centros de estudio de la región.' },
  { icon: Users, titulo: 'Genealogía y ciudadanías', desc: 'Búsqueda de raíces familiares y documentación para la solicitud de ciudadanías europeas.' },
  { icon: FileSearch, titulo: 'Trámites legales', desc: 'Juicios sucesorios y otros trámites que requieren información anterior al Registro Civil.' },
];

const memoria = [
  {
    nombre: 'Mons. Juan Bautista Fassi',
    vida: '1872 - 1951',
    texto: 'Párroco de Reducción, se dedicó a escribir y documentar la historia de la Iglesia en el sur cordobés. Investigó archivos parroquiales, municipales y nacionales, y en 1926 visitó el Archivo de Indias en Sevilla. Publicó «El Heraldo de Reducción» (1925-1950). La biblioteca del Seminario Diocesano lleva su nombre.',
  },
  {
    nombre: 'Pbro. Lic. Ignacio Miguel Costa',
    vida: 'Nació en Ucacha en 1932',
    texto: 'Licenciado en Historia por la UNRC, investigó durante 80 días en el Archivo Secreto del Vaticano. Historiador de la Iglesia regional, miembro de la Junta Regional de Historia de Río Cuarto, redactor del Boletín Diocesano y cronista diocesano desde 2010.',
  },
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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Eyebrow>Una mirada al Archivo</Eyebrow>
            <h1 className="mb-6 text-[clamp(32px,4.5vw,48px)] font-light leading-[1.1] tracking-tight text-slate-900">
              Memoria de la Iglesia<br />
              <span className="font-semibold text-sky-800">en el sur de Córdoba</span>
            </h1>
            <p className="mb-4 text-base font-light leading-relaxed text-slate-600">
              El Archivo Histórico Diocesano de la Diócesis Villa de la Concepción del Río Cuarto resguarda un valioso
              fondo documental, producto de la historia de las comunidades eclesiales del antiguo Curato del Río Cuarto,
              desde mediados del siglo XVIII hasta el presente.
            </p>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              Dependencia de la Curia Diocesana, su sede funciona en el edificio del Seminario Mayor Jesús Buen Pastor.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/consulta"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-white no-underline shadow-sm transition-colors hover:bg-sky-700"
              >
                <Search size={14} />
                Consulta de Documentos
              </Link>
              <a
                href="#acervo"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-slate-700 no-underline transition-colors hover:border-sky-200 hover:text-sky-800"
              >
                Ver el acervo
              </a>
            </div>
          </div>
          <div className="relative">
            <FotoZoom
              src="/archivo/sede-exterior.jpg"
              alt="Sede del Archivo Histórico Diocesano en el Seminario Mayor Jesús Buen Pastor"
              width={928}
              height={1126}
              className="h-[420px] w-full rounded-xl border border-slate-100 shadow-sm"
              priority
            />
            <div className="absolute -bottom-6 -left-6 hidden w-48 overflow-hidden rounded-lg border-4 border-white shadow-md sm:block">
              <FotoZoom src="/archivo/cartel-archivo.jpg" alt="Cartel del Archivo Histórico Diocesano" width={1600} height={789} className="w-full" />
            </div>
          </div>
        </section>

        {/* Cifras */}
        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
            {[
              { valor: '1731', label: 'Creación del Curato del Río Cuarto' },
              { valor: '1747', label: 'Libros sacramentales más antiguos' },
              { valor: '1775', label: 'Inicio del Fondo Iglesia Catedral' },
              { valor: '2014', label: 'Inauguración de la nueva sede' },
            ].map(({ valor, label }) => (
              <div key={valor} className="text-center">
                <div className="text-3xl font-light tracking-tight text-sky-800">{valor}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Reseña */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
            <div>
              <Eyebrow>Reseña</Eyebrow>
              <h2 className="mb-5 text-3xl font-light tracking-tight text-slate-900">
                Historia del <span className="font-semibold text-sky-800">Archivo</span>
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                Según el Código de Derecho Canónico, el Obispo debe cuidar que en su diócesis haya un Archivo Histórico donde
                se resguarden los documentos que tengan valor histórico. El Archivo cuenta con su propio reglamento, que
                normaliza los requisitos y condiciones de consulta de la documentación.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FotoZoom src="/archivo/placa-inauguracion.jpg" alt="Placa de inauguración de la sede, 19 de agosto de 2014" width={1600} height={1290} className="h-40 w-full rounded-lg border border-slate-100" />
                <FotoZoom src="/archivo/decreto-1742-13.jpg" alt="Decreto 1742/13 del Obispado" width={484} height={861} className="h-40 w-full rounded-lg border border-slate-100" imgClassName="object-top" />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Placa de inauguración (2014) · Decreto 1742/13</p>
            </div>

            <ol className="relative border-l border-sky-100 pl-8">
              {hitos.map(({ anio, texto }) => (
                <li key={anio} className="relative mb-7 last:mb-0">
                  <span className="absolute -left-[37px] top-1 h-3 w-3 rounded-full border-2 border-white bg-sky-700 ring-2 ring-sky-100" />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-700">{anio}</div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Acervo */}
        <section id="acervo" className="scroll-mt-16 border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Eyebrow center>Su acervo documental</Eyebrow>
              <h2 className="mb-5 text-3xl font-light tracking-tight text-slate-900">
                Testimonio de la <span className="font-semibold text-sky-800">comunidad eclesial</span>
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                La documentación da testimonio de la presencia de la Iglesia en parajes, estaciones, villas y pueblos, y de la
                tarea de misioneros jesuitas, dominicos, mercedarios, franciscanos y del clero diocesano. Ofrece un gran caudal de
                información sobre la historia de la sociedad y la cultura del sur cordobés durante los siglos XVIII-XX.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {fondos.map(({ nombre, periodo, imagen, desc }) => (
                <article key={nombre} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                  <FotoZoom src={imagen} alt={nombre} width={1100} height={1200} className="h-56 w-full" />
                  <div className="p-6">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-700">Fondo · {periodo}</div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-800">{nombre}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-slate-500">
              Ambos fondos surgen de la relación institucional entre el Obispado de Córdoba y el Curato del Río Cuarto.
            </p>

            {/* Productores */}
            <div className="mt-16 grid gap-6 md:grid-cols-2">
              <div className="flex gap-5 rounded-xl border border-slate-100 bg-white p-5">
                <FotoZoom src="/archivo/curia-diocesana.jpg" alt="Edificio de la Curia Diocesana" width={960} height={1280} className="h-36 w-28 shrink-0 rounded-lg" />
                <div>
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <Landmark size={16} />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Curia Diocesana</h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Circulares y pastorales del Obispo, informes de parroquias, licencias y facultades, comunicaciones con la Santa
                    Sede, la Nunciatura y la Conferencia Episcopal, y actas de consejos e instituciones diocesanas (1934-1960).
                  </p>
                </div>
              </div>
              <div className="flex gap-5 rounded-xl border border-slate-100 bg-white p-5">
                <FotoZoom src="/archivo/parroquia-templo.jpg" alt="Templo parroquial" width={1146} height={1600} className="h-36 w-28 shrink-0 rounded-lg" />
                <div>
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <Church size={16} />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Parroquias</h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Libros de bautismos, confirmaciones, matrimonios y defunciones —los más antiguos desde 1747—, libros de fábrica,
                    inventarios, visitas pastorales, expedientes matrimoniales, fotografías y libros de «Acontecimientos notables».
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentos destacados */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Documentos destacados</Eyebrow>
          <h2 className="mb-10 text-3xl font-light tracking-tight text-slate-900">
            Fuentes <span className="font-semibold text-sky-800">primarias</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { src: '/archivo/doc-rodeo-viejo-1850.jpg', w: 972, h: 687, titulo: 'Solicitud de permiso para construir Oratorio en Rodeo Viejo', fecha: '18 de octubre de 1850' },
              { src: '/archivo/doc-bautismos-sampacho.jpg', w: 1600, h: 1330, titulo: 'Libro 1° de Bautismos de Sampacho', fecha: '1880 - 1886' },
            ].map(({ src, w, h, titulo, fecha }) => (
              <figure key={src} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <FotoZoom src={src} alt={titulo} width={w} height={h} className="h-72 w-full" />
                <figcaption className="flex items-start gap-3 p-5">
                  <ScrollText size={16} className="mt-0.5 shrink-0 text-sky-700" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{titulo}</div>
                    <div className="text-xs text-slate-500">{fecha}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Colecciones */}
        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
            <FotoZoom src="/archivo/colecciones.jpg" alt="Estanterías del depósito del Archivo" width={1600} height={900} className="w-full rounded-xl border border-slate-100 shadow-sm" />
            <div>
              <Eyebrow>Fondos y colecciones</Eyebrow>
              <h2 className="mb-5 text-3xl font-light tracking-tight text-slate-900">
                También forman parte <span className="font-semibold text-sky-800">del archivo</span>
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                Publicaciones como El Heraldo de Reducción, el Boletín Eclesiástico Diocesano, La Semana Católica, Aurora y la
                Revista Pro Familia, junto a los apuntes de investigación del P. Ignacio Costa y los documentos del Pbro. Héctor
                Isidro Pereyra.
              </p>
              <div className="flex flex-wrap gap-2">
                {colecciones.map((c) => (
                  <span key={c} className="rounded-full border border-sky-100 bg-white px-3 py-1.5 text-xs font-medium text-sky-800">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow center>Servicios</Eyebrow>
            <h2 className="mb-5 text-3xl font-light tracking-tight text-slate-900">
              Un archivo para <span className="font-semibold text-sky-800">ser consultado</span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              El Registro Civil se crea en Argentina en 1884 y en Río Cuarto en 1890. Los datos personales anteriores a esa
              fecha se encuentran solamente en los libros de bautismos, matrimonios y defunciones de la Iglesia: en muchos casos,
              la única o principal fuente sobre las primeras poblaciones y sus habitantes.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {servicios.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Icon size={16} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-slate-800">{titulo}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Memoria */}
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Eyebrow>Memoria</Eyebrow>
            <h2 className="mb-10 text-3xl font-light tracking-tight text-slate-900">
              Quienes hicieron <span className="font-semibold text-sky-800">historia</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {memoria.map(({ nombre, vida, texto }) => (
                <article key={nombre} className="rounded-xl border border-slate-100 bg-white p-6">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-700">{vida}</div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-800">{nombre}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Reflexión + galería */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <blockquote className="mx-auto mb-12 max-w-3xl text-center">
            <Quote size={22} className="mx-auto mb-4 text-sky-300" />
            <p className="text-xl font-light leading-relaxed text-slate-700">
              Los archivos son patrimonio de la humanidad. No son meros depósitos, sino verdaderos repositorios ordenados y
              clasificados, donde se conserva la memoria de las comunidades cristianas.
            </p>
          </blockquote>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {['deposito-1', 'deposito-2', 'deposito-3', 'deposito-4'].map((n) => (
              <FotoZoom key={n} src={`/archivo/${n}.jpg`} alt="Depósito del Archivo Histórico Diocesano" width={1088} height={612} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-100">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center">
            <h2 className="mb-3 text-2xl font-light tracking-tight text-slate-900">
              Explore la <span className="font-semibold text-sky-800">documentación conservada</span>
            </h2>
            <p className="mb-8 max-w-md text-sm text-slate-500">
              Consulte en línea la descripción de los fondos más antiguos del Archivo.
            </p>
            <Link
              href="/consulta"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-white no-underline shadow-sm transition-colors hover:bg-sky-700"
            >
              Consulta de Documentos
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-10 pt-1 pb-5 text-center">
        <p className="text-[11px] tracking-wide text-slate-400">
          Archivo Histórico Diocesano · Obispado Villa de la Concepción del Río Cuarto
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
