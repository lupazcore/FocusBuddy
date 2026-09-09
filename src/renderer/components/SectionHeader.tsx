import React from 'react';

export function SectionHeader({
  section,
  title,
  action,
}: {
  section: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
      <div>
        <p className="kicker">FOCUS BUDDY / {section.toUpperCase()}</p>
        <h1 className="headline text-4xl mt-1 text-[color:var(--ink)]">{title}</h1>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
