import { useState } from "react";
import { useUsersStore, UserProfile } from "./UsersZustand";
import { X, Trash2, Plus, ShieldAlert, ShieldCheck, User as UserIcon } from "lucide-react";

export default function EditUserModal({ 
  isOpen, 
  onClose, 
  user 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: UserProfile | null 
}) {
  const { roles, addRoleToUser, removeRoleFromUser } = useUsersStore();
  const [selectedRole, setSelectedRole] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  // Extract user roles as an array of strings
  const userRoles = (user.roles || []).map((r: any) => 
    typeof r === "string" ? r : (r.name || r.roleName)
  );

  // Determine if user is Admin or regular User
  const isAdmin = userRoles.some((r: string) => r.toLowerCase() === "admin");
  const primaryRole = isAdmin ? "Admin" : "User";

  // Filter out roles the user already has
  const availableRoles = roles.filter(role => !userRoles.includes(role.name));

  const handleAddRole = async () => {
    if (!selectedRole) return;
    
    setLoadingAction("add");
    await addRoleToUser(user.id, selectedRole);
    setLoadingAction(null);
    setSelectedRole(""); // Reset selection
  };

  const handleRemoveRole = async (roleName: string) => {
    // We need to send role id or role name? The swagger says RoleId string.
    // If our role object uses name as id or has an id, we find it.
    const roleObj = roles.find(r => r.name === roleName);
    const roleIdToRemove = roleObj ? roleObj.id : roleName;

    setLoadingAction(`remove-${roleName}`);
    await removeRoleFromUser(user.id, roleIdToRemove);
    setLoadingAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
        .modal-animate {
          animation: modalSlideIn 0.3s ease-out;
        }
        .role-badge-pulse {
          animation: badgePulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="modal-animate bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit User Roles</h2>
            <p className="text-sm text-gray-500 mt-1">{user.firstName} {user.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Current Role Status Badge */}
          <div className="flex items-center gap-4 p-4 rounded-xl border-2"
            style={{
              borderColor: isAdmin ? "#818cf8" : "#60a5fa",
              background: isAdmin 
                ? "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)" 
                : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            }}
          >
            <div 
              className="role-badge-pulse w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isAdmin 
                  ? "linear-gradient(135deg, #6366f1, #4f46e5)" 
                  : "linear-gradient(135deg, #3b82f6, #2563eb)",
              }}
            >
              {isAdmin ? (
                <ShieldCheck size={24} className="text-white" />
              ) : (
                <UserIcon size={24} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: isAdmin ? "#6366f1" : "#3b82f6" }}
              >
                Current Role
              </p>
              <p className="text-lg font-bold text-gray-900">{primaryRole}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAdmin 
                  ? "Full admin access to all features" 
                  : "Standard user with limited permissions"}
              </p>
            </div>
          </div>
          
          {/* Current Roles Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-blue-500" />
              Assigned Roles ({userRoles.length})
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              {userRoles.length > 0 ? (
                <ul className="space-y-2">
                  {userRoles.map((roleName: string) => (
                    <li key={roleName} className="flex justify-between items-center bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: roleName.toLowerCase() === "admin"
                              ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                              : "linear-gradient(135deg, #3b82f6, #2563eb)",
                          }}
                        >
                          {roleName.toLowerCase() === "admin" ? (
                            <ShieldCheck size={16} className="text-white" />
                          ) : (
                            <UserIcon size={16} className="text-white" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800">{roleName}</span>
                          <p className="text-xs text-gray-400">
                            {roleName.toLowerCase() === "admin" ? "Administrator" : "Regular user"}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveRole(roleName)}
                        disabled={loadingAction === `remove-${roleName}`}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove role"
                      >
                        {loadingAction === `remove-${roleName}` ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-3">No roles assigned</p>
              )}
            </div>
          </div>

          {/* Add New Role Section */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign New Role</label>
            <div className="flex gap-3">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-800 transition-all"
              >
                <option value="">Select a role...</option>
                {availableRoles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              
              <button 
                onClick={handleAddRole}
                disabled={!selectedRole || loadingAction === "add"}
                className="px-5 py-2.5 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  background: !selectedRole ? "#9ca3af" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                  boxShadow: selectedRole ? "0 4px 12px -2px rgba(99,102,241,0.4)" : "none",
                }}
              >
                {loadingAction === "add" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Plus size={18} />
                )}
                Add
              </button>
            </div>
            {availableRoles.length === 0 && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <ShieldCheck size={12} />
                User already has all available roles.
              </p>
            )}
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
