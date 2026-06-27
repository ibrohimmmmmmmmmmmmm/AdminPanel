import React, { useEffect, useState } from "react";
import { useUsersStore, UserProfile } from "./UsersZustand";
import { Search, Edit, ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import EditUserModal from "./EditUserModal";

export default function Users() {
  const {
    users,
    loading,
    totalRecords,
    totalPages,
    pageNumber,
    searchQuery,
    setPage,
    setSearchQuery,
    fetchUsers,
    fetchRoles,
  } = useUsersStore();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[32px] font-bold text-gray-900">Users</h1>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search User + Enter" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
          />
        </form>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border-t border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[#6B7280] text-sm bg-gray-50/50">
              <th className="py-4 px-6 font-semibold">User</th>
              <th className="py-4 px-6 font-semibold">Email</th>
              <th className="py-4 px-6 font-semibold">Phone Number</th>
              <th className="py-4 px-6 font-semibold">Roles</th>
              <th className="py-4 px-6 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">No users found.</td>
              </tr>
            ) : (
              users.map((user) => {
                // Ensure roles array is a list of strings
                const userRoles = (user.roles || []).map((r: any) => 
                  typeof r === "string" ? r : (r.name || r.roleName)
                );

                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          {user.image ? (
                            <img src={user.image} alt={user.firstName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-600">{user.phoneNumber || "N/A"}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-2">
                        {userRoles.length > 0 ? (
                          userRoles.map((role: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1 rounded-full text-xs font-semibold border"
                              style={
                                role.toLowerCase() === "admin"
                                  ? { background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", color: "#4338ca", borderColor: "#c7d2fe" }
                                  : { background: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#1d4ed8", borderColor: "#bfdbfe" }
                              }
                            >
                              {role.toLowerCase() === "admin" ? "🛡️ " : "👤 "}{role}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm italic">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        className="text-[#2563EB] hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 p-2 rounded-md"
                        onClick={() => setSelectedUser(user)}
                        title="Edit User Roles"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 px-4">
        <div className="flex items-center gap-1">
          <button 
            className="p-2 text-[#6B7280] hover:text-gray-900 disabled:opacity-50"
            disabled={pageNumber === 1}
            onClick={() => setPage(pageNumber - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {pageNumber} of {totalPages}
          </span>
          <button 
            className="p-2 text-[#6B7280] hover:text-gray-900 disabled:opacity-50"
            disabled={pageNumber === totalPages}
            onClick={() => setPage(pageNumber + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="text-sm text-[#6B7280]">
          {totalRecords} Users
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        user={selectedUser} 
      />
    </div>
  );
}
