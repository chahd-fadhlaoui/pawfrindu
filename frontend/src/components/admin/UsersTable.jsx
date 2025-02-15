const UsersTable = ({ users }) => (
  <div className="bg-white rounded-xl shadow-sm border-2 border-amber-100">
    <table className="w-full">
      <thead className="bg-amber-50">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-amber-700">Nom Complet</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-amber-700">Email</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-amber-700">Rôle</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-amber-100">
        {users.map((user, index) => (
          <tr key={index} className="hover:bg-amber-50/30 transition-colors">
            <td className="px-6 py-4">{user.fullName}</td>
            <td className="px-6 py-4">{user.email}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                user.role === 'Admin'
                  ? 'bg-teal-100 text-teal-600'
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {user.role}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

  export default UsersTable