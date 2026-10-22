import React from 'react';
import { ActaData } from '../types/acta';
import { Printer, Download, ArrowLeft, PenTool, Share2 } from 'lucide-react';
import { triggerBrowserPrint } from '../utils/pdfGenerator';
import { CenedisLogo } from './CenedisLogo';

interface ActaPrintViewProps {
  acta: ActaData;
  onBackToEditor: () => void;
  onOpenSignatureModal: (type: 'facilitador' | 'secretario') => void;
  onExportPdf: () => void;
  onCopyShareText: () => void;
  isGeneratingPdf?: boolean;
}

export const ActaPrintView: React.FC<ActaPrintViewProps> = ({
  acta,
  onBackToEditor,
  onOpenSignatureModal,
  onExportPdf,
  onCopyShareText,
  isGeneratingPdf = false,
}) => {
  return (
    <div className="w-full">
      {/* Top action toolbar (hidden on print) */}
      <div className="no-print mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-emerald-900/10 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al Formulario
          </button>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs font-medium text-slate-600">
            Vista Previa de Impresión Oficial y Reporte PDF
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onCopyShareText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            title="Copiar resumen en texto para WhatsApp o correo de la Facultad"
          >
            <Share2 className="h-3.5 w-3.5 text-slate-500" />
            Copiar Resumen
          </button>

          <button
            type="button"
            onClick={triggerBrowserPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-950 border border-emerald-300 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-700" />
            Imprimir Acta
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            {isGeneratingPdf ? 'Generando PDF...' : 'Descargar Reporte PDF'}
          </button>
        </div>
      </div>

      {/* The Printable Document Container */}
      <div
        id="acta-printable-document"
        className="bg-white text-black p-6 sm:p-10 mx-auto max-w-4xl border border-slate-300 print:border-none shadow-sm print:shadow-none print:p-0 print:m-0"
        style={{ minHeight: '297mm' }}
      >
        {/* Document Header with CENEDIS LunaSol identity */}
        <div className="border-b-2 border-emerald-800 print:border-black pb-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CenedisLogo size={52} />
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 print:text-black uppercase">
                  {acta.institucion || 'CENEDIS LunaSol'}
                </h2>
                <p className="text-[11px] font-semibold text-emerald-800 print:text-neutral-700 tracking-wide uppercase">
                  {acta.subtitulo || 'Educación para el ser, salud para el futuro'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-emerald-50 print:bg-transparent border border-emerald-300 print:border-black rounded text-emerald-950 print:text-black">
                Acta N° {acta.actaNumero || '_____'}
              </span>
            </div>
          </div>

          <div className="text-center mt-3 pt-2 border-t border-slate-100 print:border-neutral-300">
            <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase text-black">
              📋 ACTA DE REUNIÓN DE REPRESENTANTES / MAESTROS
            </h1>
          </div>
        </div>

        {/* 1. DATOS GENERALES Y ROLES */}
        <section className="mb-5 page-break-inside-avoid">
          <div className="bg-emerald-800/10 print:bg-neutral-100 border border-emerald-800/30 print:border-neutral-400 px-2 py-1 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 print:text-black">
              1. DATOS GENERALES Y ROLES
            </h2>
          </div>

          <div className="border border-neutral-300 divide-y divide-neutral-300 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-300 p-2 bg-neutral-50/50">
              <div>
                <span className="font-bold text-neutral-700">Fecha:</span>{' '}
                <span className="font-mono tabular-nums">{acta.fecha || '____/____/________'}</span>
              </div>
              <div className="pl-2">
                <span className="font-bold text-neutral-700">Hora inicio:</span>{' '}
                <span className="font-mono tabular-nums">{acta.horaInicio || '__:__'}</span>
              </div>
              <div className="pl-2">
                <span className="font-bold text-neutral-700">Hora fin:</span>{' '}
                <span className="font-mono tabular-nums">{acta.horaFin || '__:__'}</span>
              </div>
              <div className="pl-2">
                <span className="font-bold text-neutral-700">Acta N°:</span>{' '}
                <span className="font-mono font-bold text-black">{acta.actaNumero || '_____'}</span>
              </div>
            </div>

            {/* Ubicación / Lugar */}
            {acta.lugar && (
              <div className="p-2 bg-white">
                <span className="font-bold text-neutral-700">Lugar / Ubicación:</span>{' '}
                <span className="text-neutral-900">{acta.lugar}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-300 p-2">
              <div>
                <span className="font-bold text-neutral-700">Facilitador/a:</span>{' '}
                <span className="font-medium text-black">{acta.facilitador || '_______________________________'}</span>
              </div>
              <div className="sm:pl-2 pt-1 sm:pt-0">
                <span className="font-bold text-neutral-700">Secretario/a:</span>{' '}
                <span className="font-medium text-black">{acta.secretario || '_______________________________'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-300 p-2">
              <div>
                <span className="font-bold text-neutral-700">Ausentes:</span>{' '}
                <span className="italic text-neutral-500">(Solo anotar quién faltó)</span>
                <div className="mt-1 font-medium text-neutral-900">
                  {acta.ausentes.length > 0 ? (
                    acta.ausentes.join(', ')
                  ) : (
                    <span className="text-neutral-500 italic">Ninguno (Facultad de Maestros completa)</span>
                  )}
                  {acta.ausentesNotas && (
                    <p className="text-[11px] text-neutral-600 mt-0.5 font-normal">
                      Nota de justificación: {acta.ausentesNotas}
                    </p>
                  )}
                </div>
              </div>
              <div className="sm:pl-2 pt-1 sm:pt-0">
                <span className="font-bold text-neutral-700">Invitados:</span>
                <div className="mt-1 text-neutral-900">
                  {acta.invitados || <span className="text-neutral-500 italic">Sin invitados especiales</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. APERTURA (10 - 15 min) */}
        <section className="mb-5 page-break-inside-avoid">
          <div className="bg-emerald-800/10 print:bg-neutral-100 border border-emerald-800/30 print:border-neutral-400 px-2 py-1 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 print:text-black">
              2. APERTURA (10 - 15 min)
            </h2>
          </div>

          <div className="border border-neutral-300 divide-y divide-neutral-300 text-xs">
            <div className="p-2.5">
              <span className="font-bold text-neutral-800">Check-in:</span>{' '}
              <span className="text-neutral-500 italic">(Ronda rápida de llegada)</span>
              <p className="mt-1 text-neutral-800 whitespace-pre-line leading-relaxed">
                {acta.apertura.checkIn || 'Ronda de llegada realizada sin novedades extraordinarias.'}
              </p>
            </div>

            <div className="p-2.5">
              <span className="font-bold text-neutral-800">Informes y avisos breves:</span>{' '}
              <span className="text-neutral-500 italic">(Avisos rápidos que no requieren debate)</span>
              <p className="mt-1 text-neutral-800 whitespace-pre-line leading-relaxed">
                {acta.apertura.informesAvisosBreves || 'Sin avisos breves registrados.'}
              </p>
            </div>

            <div className="p-2.5">
              <span className="font-bold text-neutral-800">Revisión de compromisos anteriores:</span>{' '}
              <span className="text-neutral-500 italic">(¿Quedó alguna tarea pendiente de la reunión pasada?)</span>
              <p className="mt-1 text-neutral-800 whitespace-pre-line leading-relaxed">
                {acta.apertura.compromisosAnteriores || 'Compromisos de la sesión previa revisados y verificados conforme a lo programado.'}
              </p>
            </div>
          </div>
        </section>

        {/* 3. TRATAMIENTO DE TEMAS DE LA AGENDA */}
        <section className="mb-5">
          <div className="bg-emerald-800/10 print:bg-neutral-100 border border-emerald-800/30 print:border-neutral-400 px-2 py-1 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 print:text-black">
              3. TRATAMIENTO DE TEMAS DE LA AGENDA
            </h2>
          </div>
          <div className="text-[10px] text-neutral-600 mb-2 px-1">
            <strong>Tipos de tema:</strong> • <strong>Informe:</strong> Comunicación unidireccional (no requiere debate). · • <strong>Exploración:</strong> Lluvia de ideas, recolección de perspectivas o diagnóstico. · • <strong>Decisión:</strong> Propuesta concreta que requiere acuerdo/consentimiento.
          </div>

          {/* Agenda Table */}
          <table className="w-full border-collapse border border-neutral-400 text-xs">
            <thead>
              <tr className="bg-neutral-200 text-black text-left text-[11px] font-bold">
                <th className="border border-neutral-400 p-1.5 w-7 text-center">#</th>
                <th className="border border-neutral-400 p-1.5 w-1/5">Tema / Asunto</th>
                <th className="border border-neutral-400 p-1.5 w-28">Traído por</th>
                <th className="border border-neutral-400 p-1.5 w-32 text-center">Tipo</th>
                <th className="border border-neutral-400 p-1.5 w-2/5">Registro y Desarrollo (Lo conversado)</th>
                <th className="border border-neutral-400 p-1.5 w-1/4">Resolución / Decisión / Acuerdo</th>
              </tr>
            </thead>
            <tbody>
              {acta.temas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-neutral-300 p-3 text-center text-neutral-400 italic">
                    No se han registrado temas en la agenda.
                  </td>
                </tr>
              ) : (
                acta.temas.map((tema, index) => (
                  <tr key={tema.id || index} className="align-top hover:bg-neutral-50/50 page-break-inside-avoid">
                    <td className="border border-neutral-300 p-1.5 text-center font-mono font-bold text-neutral-700">
                      {index + 1}
                    </td>
                    <td className="border border-neutral-300 p-1.5 font-semibold text-neutral-900 leading-snug">
                      {tema.tema || 'Tema sin título'}
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-neutral-700">
                      {tema.traidoPor || '—'}
                    </td>
                    <td className="border border-neutral-300 p-1.5 font-mono text-[11px] leading-tight whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className={tema.tipo === 'informe' ? 'font-bold text-sky-900 print:text-black' : 'text-neutral-500'}>
                          [{tema.tipo === 'informe' ? 'X' : ' '}] Inf.
                        </span>
                        <span className={tema.tipo === 'exploracion' ? 'font-bold text-amber-900 print:text-black' : 'text-neutral-500'}>
                          [{tema.tipo === 'exploracion' ? 'X' : ' '}] Expl.
                        </span>
                        <span className={tema.tipo === 'decision' ? 'font-bold text-emerald-950 print:text-black' : 'text-neutral-500'}>
                          [{tema.tipo === 'decision' ? 'X' : ' '}] Dec.
                        </span>
                      </div>
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-neutral-800 whitespace-pre-line leading-relaxed">
                      {tema.desarrollo || '—'}
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-neutral-900 font-medium whitespace-pre-line leading-relaxed bg-neutral-50/40">
                      {tema.resolucion || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* 4. PLAN DE ACCIÓN Y TAREAS ASIGNADAS (REMOVED "(Nuevo)" AS REQUESTED) */}
        <section className="mb-5 page-break-inside-avoid">
          <div className="bg-emerald-800/10 print:bg-neutral-100 border border-emerald-800/30 print:border-neutral-400 px-2 py-1 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 print:text-black">
              4. PLAN DE ACCIÓN Y TAREAS ASIGNADAS
            </h2>
          </div>
          <p className="text-[10px] text-neutral-600 mb-2 px-1 italic">
            (Todo acuerdo que implique trabajo posterior debe listarse aquí para dar seguimiento en la próxima sesión)
          </p>

          <table className="w-full border-collapse border border-neutral-400 text-xs">
            <thead>
              <tr className="bg-neutral-200 text-black text-left text-[11px] font-bold">
                <th className="border border-neutral-400 p-1.5 w-7 text-center">#</th>
                <th className="border border-neutral-400 p-1.5">Tarea / Acción Concreta</th>
                <th className="border border-neutral-400 p-1.5 w-1/4">Responsable</th>
                <th className="border border-neutral-400 p-1.5 w-32 text-center">Fecha Límite de Entrega</th>
                <th className="border border-neutral-400 p-1.5 w-28 text-center">Verificación / Estado</th>
              </tr>
            </thead>
            <tbody>
              {acta.tareas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-neutral-300 p-3 text-center text-neutral-400 italic">
                    No hay tareas pendientes asignadas en esta reunión.
                  </td>
                </tr>
              ) : (
                acta.tareas.map((tarea, index) => (
                  <tr key={tarea.id || index} className="align-middle hover:bg-neutral-50/50">
                    <td className="border border-neutral-300 p-1.5 text-center font-mono font-bold text-neutral-700">
                      {index + 1}.
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-neutral-900 font-medium">
                      {tarea.accion || '—'}
                      {tarea.temaRelacionadoTitulo && (
                        <div className="text-[10px] text-neutral-500 font-normal">
                          Acuerdo derivado de: {tarea.temaRelacionadoTitulo}
                        </div>
                      )}
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-neutral-800">
                      {tarea.responsable || '—'}
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-center font-mono tabular-nums text-neutral-800">
                      {tarea.fechaLimite || '____/____/________'}
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-center">
                      <span className={`text-[11px] font-medium ${
                        tarea.estado === 'cumplida'
                          ? 'text-emerald-800 font-bold'
                          : tarea.estado === 'en_progreso'
                          ? 'text-amber-800 font-semibold'
                          : 'text-neutral-700'
                      }`}>
                        {tarea.estado === 'cumplida'
                          ? 'Cumplida'
                          : tarea.estado === 'en_progreso'
                          ? 'En Proceso'
                          : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* 5. CIERRE Y PRÓXIMA REUNIÓN */}
        <section className="mb-6 page-break-inside-avoid">
          <div className="bg-emerald-800/10 print:bg-neutral-100 border border-emerald-800/30 print:border-neutral-400 px-2 py-1 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 print:text-black">
              5. CIERRE Y PRÓXIMA REUNIÓN
            </h2>
          </div>

          <div className="border border-neutral-300 divide-y divide-neutral-300 text-xs">
            <div className="p-2.5 bg-neutral-50/40">
              <span className="font-bold text-neutral-800">Próxima reunión:</span>{' '}
              <span className="font-mono tabular-nums">
                Fecha: {acta.cierre.proximaReunionFecha || '____/____/________'}
              </span>{' '}
              |{' '}
              <span className="font-mono tabular-nums">
                Hora: {acta.cierre.proximaReunionHora || '____:____'}
              </span>
              {acta.cierre.proximaReunionLugar && (
                <span className="text-neutral-700"> | Lugar: {acta.cierre.proximaReunionLugar}</span>
              )}
            </div>

            <div className="p-2.5">
              <span className="font-bold text-neutral-800">Check-out:</span>{' '}
              <span className="text-neutral-500 italic">(Ronda de cierre breve)</span>
              <p className="mt-1 text-neutral-800 whitespace-pre-line leading-relaxed">
                {acta.cierre.checkOut || 'Ronda de cierre completada. Se da por concluida la reunión en fecha y hora indicadas.'}
              </p>
            </div>
          </div>
        </section>

        {/* Signatures Section */}
        <section className="pt-6 mt-8 border-t border-neutral-300 page-break-inside-avoid">
          <div className="grid grid-cols-2 gap-10 text-center">
            {/* Facilitator signature */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-48 flex items-center justify-center mb-1">
                {acta.firmas.facilitadorFirmaUrl ? (
                  <img
                    src={acta.firmas.facilitadorFirmaUrl}
                    alt="Firma Facilitador"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-[10px] text-neutral-400 italic no-print">
                    (Espacio para firma física)
                  </div>
                )}
              </div>
              <div className="w-60 border-t border-black pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Firma Facilitador/a
                </p>
                <p className="text-xs text-neutral-800 font-medium">{acta.firmas.facilitadorNombre || acta.facilitador}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenSignatureModal('facilitador')}
                className="no-print mt-1.5 flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer font-medium"
              >
                <PenTool className="h-3 w-3" />
                {acta.firmas.facilitadorFirmaUrl ? 'Cambiar firma digital' : 'Añadir firma digital'}
              </button>
            </div>

            {/* Secretary signature */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-48 flex items-center justify-center mb-1">
                {acta.firmas.secretarioFirmaUrl ? (
                  <img
                    src={acta.firmas.secretarioFirmaUrl}
                    alt="Firma Secretario"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-[10px] text-neutral-400 italic no-print">
                    (Espacio para firma física)
                  </div>
                )}
              </div>
              <div className="w-60 border-t border-black pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Firma Secretario/a
                </p>
                <p className="text-xs text-neutral-800 font-medium">{acta.firmas.secretarioNombre || acta.secretario}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenSignatureModal('secretario')}
                className="no-print mt-1.5 flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer font-medium"
              >
                <PenTool className="h-3 w-3" />
                {acta.firmas.secretarioFirmaUrl ? 'Cambiar firma digital' : 'Añadir firma digital'}
              </button>
            </div>
          </div>
        </section>

        {/* Footer print note */}
        <div className="mt-8 pt-3 border-t border-neutral-200 text-center text-[10px] text-neutral-500 font-mono">
          CENEDIS LunaSol · Educación para el ser, salud para el futuro · Documento oficial registrado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
