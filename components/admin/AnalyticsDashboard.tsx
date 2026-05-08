'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Loader2, Users, Clock, MousePointerClick, RefreshCcw, ArrowDownRight } from 'lucide-react'

const COLORS = ['#2C3E50', '#A0856A', '#F8F1E3', '#4A90E2', '#50E3C2', '#F5A623']

const EVENT_NAMES: Record<string, string> = {
  page_view: "Entró a la página",
  scroll: "Bajó por la página",
  click: "Tocó algo",
  section_view: "Miró una sección",
  exit_intent: "Intentó salir",
  visibilitychange: "Cambió de pestaña",
  form_interaction: "Tocó el formulario",
  inactivity: "Se quedó quieto",
  js_error: "Error técnico",
  checkout_open: "Abrió el carrito",
  checkout_success: "¡Compró!",
  checkout_error: "Error en compra"
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [slugs, setSlugs] = useState<string[]>([])
  
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Primer render: cargar lista de landing pages disponibles
  useEffect(() => {
    fetch('/api/analytics/stats')
      .then(res => res.json())
      .then(d => {
        if (d.slugs && d.slugs.length > 0) {
          setSlugs(d.slugs)
          setSelectedSlug(d.slugs[0])
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  // Refetch cuando cambian los filtros
  useEffect(() => {
    if (!selectedSlug) return
    
    setLoading(true)
    let url = `/api/analytics/stats?slug=${selectedSlug}`
    if (dateFrom) url += `&from=${dateFrom}`
    if (dateTo) url += `&to=${dateTo}`

    fetch(url)
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [selectedSlug, dateFrom, dateTo])

  if (!selectedSlug && !loading) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Aún no hay datos de analíticas</h2>
        <p>Los datos comenzarán a aparecer en cuanto los usuarios visiten tus Landing Pages.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rendimiento de Landing</h1>
          <p className="text-sm text-gray-500">Métricas de comportamiento y conversión en tiempo real</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedSlug} 
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-[220px] bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1B2B5E]/50"
          >
            <option value="" disabled>Seleccionar landing...</option>
            {slugs.map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
            <input 
              type="date" 
              className="bg-transparent border-none text-sm outline-none px-2 py-1"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              className="bg-transparent border-none text-sm outline-none px-2 py-1"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : data && data.metrics ? (
        <>
          {/* Metrics KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Users size={18} />
                <span className="text-sm font-medium">Personas que entraron</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.unique_visits}</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Clock size={18} />
                <span className="text-sm font-medium">Tiempo que se quedan</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.avg_time_seconds}s</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <ArrowDownRight size={18} />
                <span className="text-sm font-medium">Se fueron sin comprar</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.bounce_rate}%</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <MousePointerClick size={18} />
                <span className="text-sm font-medium">Tocaron el botón de compra</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.cta_clicks}</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <RefreshCcw size={18} />
                <span className="text-sm font-medium">Volvieron a visitar</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.returning}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scroll Retention Chart */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">¿Hasta dónde leyeron la página?</h3>
                <p className="text-sm text-gray-500 mt-1">Cuántas personas llegaron hasta cada parte</p>
              </div>
              <div className="p-6 pt-0" style={{ height: '300px', minHeight: 0 }}>
                {data.scroll_retention?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.scroll_retention}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="scroll" axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val: number | string) => `${val}%`} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        formatter={(val) => [`${val}%`, 'de visitantes llegaron aquí']} 
                        labelFormatter={(label: any) => `Posición en la página: ${label}`}
                      />
                      <Area type="monotone" dataKey="percentage" stroke="#2C3E50" strokeWidth={3} fill="#A0856A" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Sin datos aún</div>
                )}
              </div>
            </div>

            {/* Section Heatmap */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">¿En qué parte se detuvieron más?</h3>
                <p className="text-sm text-gray-500 mt-1">Segundos promedio que miraron cada sección</p>
              </div>
              <div className="p-6 pt-0" style={{ height: '300px', minHeight: 0 }}>
                {data.section_heatmap?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.section_heatmap} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis dataKey="section" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12 }} />
                      <RechartsTooltip formatter={(val) => [`${val}s`, 'segundos mirando']} />
                      <Bar dataKey="avgTime" fill="#2C3E50" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Sin datos aún</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">¿De dónde llegaron?</h3>
              </div>
              <div className="p-6 pt-0" style={{ height: '250px', minHeight: 0 }}>
                {data.traffic_sources?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data.traffic_sources} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name" label>
                        {data.traffic_sources.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Sin datos aún</div>
                )}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">¿Con qué dispositivo entraron?</h3>
              </div>
              <div className="p-6 pt-0" style={{ height: '250px', minHeight: 0 }}>
                {data.devices?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data.devices} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name" label>
                        {data.devices.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Sin datos aún</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col md:col-span-2">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Embudo de Conversión</h3>
                <p className="text-sm text-gray-500 mt-1">Cómo avanzan los visitantes hacia la compra</p>
              </div>
              <div className="p-6 pt-0" style={{ height: '300px', minHeight: 0 }}>
                {data.conversion_funnel?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.conversion_funnel} layout="vertical" margin={{ left: 40, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis dataKey="step" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 13 }} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(val) => [val, 'Usuarios']} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                        {
                          data.conversion_funnel?.map((entry: any, index: number) => {
                            const colors = ['#3b82f6', '#0ea5e9', '#10b981', '#059669'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Sin datos aún</div>
                )}
              </div>
            </div>

            {/* Click Map */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Dónde tocaron los visitantes</h3>
                <p className="text-sm text-gray-500 mt-1">Últimos 500 clicks (proporción móvil)</p>
              </div>
              <div className="p-6 pt-0 flex justify-center">
                <div className="relative border-4 border-gray-800 rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-inner" style={{ width: '375px', height: '667px' }}>
                  {data.click_map?.map((click: any, i: number) => {
                    const sections = ['hero', 'problema', 'specs', 'testimonios', 'pricing', 'faq'];
                    const colorIndex = click.section ? sections.indexOf(click.section) : -1;
                    const color = colorIndex >= 0 ? COLORS[colorIndex % COLORS.length] : '#9ca3af';
                    return (
                      <div 
                        key={i} 
                        className="absolute w-4 h-4 rounded-full opacity-60 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-multiply"
                        style={{ left: `${click.x}%`, top: `${click.y}%`, backgroundColor: color }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Distractions & Performance */}
            <div className="flex flex-col gap-6">
              <div className="bg-white border shadow-sm rounded-xl flex flex-col p-6">
                <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Distracciones y salidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Intentos de salida</p>
                    <p className="text-2xl font-bold text-gray-900">{data.exit_intent?.total || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Cambios de pestaña</p>
                    <p className="text-2xl font-bold text-gray-900">{data.distractions?.tab_changes || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Inactividad prom.</p>
                    <p className="text-2xl font-bold text-gray-900">{data.distractions?.avg_inactive_ms ? Math.round(data.distractions.avg_inactive_ms / 1000) : 0}s</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border shadow-sm rounded-xl flex flex-col p-6">
                <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Rendimiento de carga</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Tiempo prom. carga</p>
                    <p className="text-2xl font-bold text-gray-900">{data.performance?.avg_load_time_ms ? (data.performance.avg_load_time_ms / 1000).toFixed(1) : 0}s</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Cargas lentas (+3s)</p>
                    <p className="text-2xl font-bold text-gray-900">{data.performance?.slow_loads || 0}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                  <span className="text-gray-500">Móvil: {data.performance?.by_device?.mobile ? (data.performance.by_device.mobile / 1000).toFixed(1) : '-'}s</span>
                  <span className="text-gray-500">Desktop: {data.performance?.by_device?.desktop ? (data.performance.by_device.desktop / 1000).toFixed(1) : '-'}s</span>
                </div>
              </div>
            </div>

            {/* Form Stats */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col md:col-span-2 overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Interacción con Formularios</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3">Campo</th>
                      <th className="px-4 py-3 text-center">Veces que lo tocaron (Focus)</th>
                      <th className="px-4 py-3 text-center">Veces que lo cambiaron</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.form_stats && data.form_stats.length > 0 ? data.form_stats.map((f: any) => (
                      <tr key={f.field} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">{f.field}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{f.focuses}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{f.changes}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="text-center py-4 text-gray-500">No hay interacciones de formulario</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Sessions */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col md:col-span-2 overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Sesiones Individuales</h3>
                <p className="text-sm text-gray-500 mt-1">Últimas 20 visitas</p>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {data.individual_sessions && data.individual_sessions.length > 0 ? data.individual_sessions.map((session: any) => (
                  <details key={session.id} className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 list-none outline-none">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-900">{new Date(session.created_at).toLocaleString('es-CO')}</span>
                          <span className="text-xs text-gray-500 capitalize">{session.device} • {session.is_returning ? 'Volvió' : 'Nuevo'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500 hidden sm:inline">Scroll: {session.max_scroll}%</span>
                        <span className="text-gray-500 hidden sm:inline">{session.total_events} eventos</span>
                        {session.converted ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">¡Compró!</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">No compró</span>
                        )}
                      </div>
                    </summary>
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="space-y-3">
                        {session.events.map((e: any) => (
                          <div key={e.id} className="flex gap-4 text-sm">
                            <span className="text-gray-400 w-16 shrink-0">{new Date(e.created_at).toLocaleTimeString('es-CO')}</span>
                            <span className="font-medium text-gray-700 w-32 shrink-0">{EVENT_NAMES[e.event_type] || e.event_type}</span>
                            <span className="text-gray-600 truncate">{e.section ? `[${e.section}] ` : ''}{e.element || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                )) : (
                  <div className="p-4 text-center text-gray-500">No hay sesiones registradas</div>
                )}
              </div>
            </div>

            {/* JS Errors */}
            {data.js_errors && data.js_errors.length > 0 && (
              <div className="bg-red-50 border border-red-100 shadow-sm rounded-xl flex flex-col md:col-span-2 overflow-hidden">
                <div className="p-6 border-b border-red-100">
                  <h3 className="text-lg font-semibold leading-none tracking-tight text-red-800">Errores Técnicos (JS)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-red-700 uppercase bg-red-100/50 border-b border-red-100">
                      <tr>
                        <th className="px-4 py-3">Mensaje de Error</th>
                        <th className="px-4 py-3 w-32 text-center">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.js_errors.map((err: any, i: number) => (
                        <tr key={i} className="border-b border-red-100/50 hover:bg-red-100/20">
                          <td className="px-4 py-3 font-mono text-xs text-red-900">{err.message}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-700">{err.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Recent Events Log */}
          <div className="bg-white border shadow-sm rounded-xl flex flex-col overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Lo que hicieron los últimos visitantes</h3>
            </div>
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3">Fecha / Hora</th>
                      <th className="px-4 py-3">Qué hicieron</th>
                      <th className="px-4 py-3">Sección</th>
                      <th className="px-4 py-3">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_events.length > 0 ? data.recent_events.map((e: any) => (
                      <tr key={e.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(e.created_at).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            e.event_type.includes('click') ? 'bg-purple-100 text-purple-700' :
                            e.event_type.includes('scroll') ? 'bg-blue-100 text-blue-700' :
                            e.event_type.includes('checkout') ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {EVENT_NAMES[e.event_type] || e.event_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{e.section || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                          {e.element || (e.scroll_pct ? `Bajaron hasta el ${e.scroll_pct}%` : '-')}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-center py-4 text-gray-500">No hay eventos recientes</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
