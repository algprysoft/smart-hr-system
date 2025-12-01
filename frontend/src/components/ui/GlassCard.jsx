const GlassCard = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800 
        border border-slate-100 dark:border-slate-700
        shadow-lg rounded-2xl p-6 
        transition-all duration-300 ease-in-out
        ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
