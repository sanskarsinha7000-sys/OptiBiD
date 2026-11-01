import { PackageSearch, Clock, ArrowRight } from "lucide-react";

const EmptyState = ({ icon = <PackageSearch />, title, description, action, actionLabel }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center text-cyan-400 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-8">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-medium px-4 py-2 rounded-lg shadow-glow transition-all active:scale-95"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
