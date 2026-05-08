'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Loader2, Users, Clock, MousePointerClick, RefreshCcw, ArrowDownRight } from 'lucide-react'

const COLORS = ['#2C3E50', '#A0856A', '#F8F1E3', '#4A90E2', '#50E3C2', '#F5A623']

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
                <span className="text-sm font-medium">Visitas Únicas</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.unique_visits}</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Clock size={18} />
                <span className="text-sm font-medium">Tiempo Promedio</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.avg_time_seconds}s</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <ArrowDownRight size={18} />
                <span className="text-sm font-medium">Tasa de Rebote</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.bounce_rate}%</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <MousePointerClick size={18} />
                <span className="text-sm font-medium">Clicks CTA</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.cta_clicks}</p>
            </div>
            <div className="bg-white border shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <RefreshCcw size={18} />
                <span className="text-sm font-medium">Recurrentes</span>
              </div>
              <p className="text-3xl font-bold">{data.metrics.returning}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scroll Retention Chart */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Retención por Nivel de Scroll</h3>
                <p className="text-sm text-gray-500 mt-1">Porcentaje de usuarios que llegaron a cada profundidad</p>
              </div>
              <div className="p-6 pt-0 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.scroll_retention}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="scroll" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val: number | string) => `${val}%`} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      formatter={(val) => [`${val}%`, 'Usuarios llegaron aquí']} 
                      labelFormatter={(label: any) => `Nivel de scroll: ${label}`}
                    />
                    <Area type="monotone" dataKey="percentage" stroke="#2C3E50" strokeWidth={3} fill="#A0856A" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Section Heatmap */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Tiempo por Sección (Heatmap)</h3>
                <p className="text-sm text-gray-500 mt-1">Milisegundos promedio que el usuario visualiza cada bloque</p>
              </div>
              <div className="p-6 pt-0 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.section_heatmap} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="section" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12 }} />
                    <RechartsTooltip formatter={(val) => [`${val}s`, 'Tiempo promedio']} />
                    <Bar dataKey="avgTime" fill="#2C3E50" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Fuentes de Tráfico</h3>
              </div>
              <div className="p-6 pt-0 h-[250px] pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.traffic_sources} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name" label>
                      {data.traffic_sources.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Devices */}
            <div className="bg-white border shadow-sm rounded-xl flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Dispositivos de Entrada</h3>
              </div>
              <div className="p-6 pt-0 h-[250px] pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.devices} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name" label>
                      {data.devices.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Events Log */}
          <div className="bg-white border shadow-sm rounded-xl flex flex-col overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Registro de Actividad Reciente</h3>
            </div>
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3">Fecha / Hora</th>
                      <th className="px-4 py-3">Tipo de Evento</th>
                      <th className="px-4 py-3">Sección</th>
                      <th className="px-4 py-3">Detalle (Elemento / Scroll)</th>
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
                            {e.event_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{e.section || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                          {e.element || (e.scroll_pct ? `Scroll llegó al ${e.scroll_pct}%` : '-')}
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
