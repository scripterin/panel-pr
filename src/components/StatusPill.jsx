import React from 'react';

export default function StatusPill({ s }) {
  if (s === 'activ')    return <span className="status-pill sp-a"><span className="sp-d" />Activ</span>;
  if (s === 'concediu') return <span className="status-pill sp-c"><span className="sp-d" />Concediu</span>;
  return <span className="status-pill sp-i"><span className="sp-d" />Inactiv</span>;
}
