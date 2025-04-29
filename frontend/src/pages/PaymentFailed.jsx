import { AlertCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-[#ffc929]/10">
      <div className="p-8 space-y-6 text-center bg-white border border-[#ffc929]/10 shadow-2xl rounded-3xl">
        <AlertCircle size={56} className="mx-auto text-red-500" />
        <div>
          <h2 className="mb-2 text-2xl font-semibold text-red-600">Payment Failed</h2>
          <p className="mb-4 text-sm text-gray-500">Something went wrong with your payment. Please try again.</p>
        </div>
        <button
          onClick={() => navigate("/pets")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white font-semibold rounded-full hover:shadow-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
        >
          <ChevronLeft size={20} /> Back to Pets
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;