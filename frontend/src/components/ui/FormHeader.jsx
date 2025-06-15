
const FormHeader = ({ mode }) => (
  <div className="mb-8 space-y-4">
    <h2 className="text-3xl font-bold tracking-tight text-neutral-900 transition-colors duration-300 sm:text-4xl hover:text-[#ffc929] relative">
      {mode === "login" ? "Welcome Back" : mode === "signup" ? "Join Us" : "Reset Password"}
      <span className="absolute w-12 h-1 transition-all duration-300 rounded-full -bottom-2 left-0 bg-[#ffc929] group-hover:w-24"></span>
    </h2>
    <p className="text-neutral-600">
      {mode === "login"
        ? "Sign in to continue your journey with us"
        : mode === "signup"
        ? "Create your account and start helping pets find their forever homes"
        : "Enter your email to reset your password"}
    </p>
  </div>
);

export default FormHeader;
