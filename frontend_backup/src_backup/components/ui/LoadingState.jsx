import { Loader2 } from "lucide-react";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-8 h-8 border-4 border-navy-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-400">{message}</p>
    </div>
  );
};

LoadingState.displayName = "LoadingState";
export default LoadingState;