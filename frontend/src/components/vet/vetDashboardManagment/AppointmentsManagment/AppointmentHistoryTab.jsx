import { useState, useEffect } from "react";

export default function AppointmentHistoryTab({ appointment: appt }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHistory([
        { id: "hist1", date: "2024-10-15", time: "10:00 AM", reason: "Vaccination", status: "completed", provider: appt.provider },
        { id: "hist2", date: "2024-09-01", time: "2:00 PM", reason: "Checkup", status: "completed", provider: appt.provider },
      ]);
      setLoading(false);
    }, 1000);
  }, [appt.id]);

  if (loading) {
    return <div className="text-gray-600 text-sm">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-gray-500 text-sm text-center">
        No appointment history available for {appt.petName}.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((hist) => (
        <div key={hist.id} className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm font-medium text-gray-800">{hist.reason}</p>
              <p className="text-xs text-gray-500">
                {hist.date} at {hist.time}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600`}>
              Completed
            </span>
          </div>
          <p className="text-xs text-gray-600">Provider: {hist.provider}</p>
        </div>
      ))}
    </div>
  );
}