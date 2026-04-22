'use client'

import { Users, Mail, Shield, User as UserIcon } from 'lucide-react'

interface UsersTabProps {
  users: any[]
  onRoleChange: (userId: string, role: string) => Promise<void>
}

export default function UsersTab({ users, onRoleChange }: UsersTabProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Gestión de Usuarios</h2>
        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
          {users.length} usuarios registrados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 ${
                user.role === 'admin' ? 'bg-[#1B2B5E] text-white' : 'bg-gray-50 text-[#1B2B5E]'
              }`}>
                {user.role === 'admin' ? <Shield size={20} /> : <UserIcon size={20} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'Sin nombre'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Mail size={12} className="text-gray-400" />
                  <p className="text-[11px] text-gray-500 truncate">{user.email || 'No disponible'}</p>
                </div>
              </div>
            </div>
            
            <div className="shrink-0">
              <select
                value={user.role ?? 'customer'}
                onChange={(e) => onRoleChange(user.id, e.target.value)}
                className="h-9 px-3 rounded-xl border border-gray-100 text-xs font-bold text-gray-700 bg-gray-50/50 outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-[#1B2B5E]/5 transition-all"
              >
                <option value="customer">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
