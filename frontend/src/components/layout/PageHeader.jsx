import { cn } from "../ui/utils";
import { ChevronRight } from "lucide-react";

const PageHeader = ({ title, description, breadcrumb }) => {
  return (
    <div className="mb-8">
      {breadcrumb && (
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          {breadcrumb.map((item, idx) => (
            <span key={item.label} className="flex items-center gap-1">
              {item.link ? (
                <a
                  href={item.link}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {idx < breadcrumb.length - 1 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">{title}</h1>
          {description && <p className="text-slate-400">{description}</p>}
        </div>
      </div>
    </div>
  );
};

PageHeader.displayName = "PageHeader";
export default PageHeader;