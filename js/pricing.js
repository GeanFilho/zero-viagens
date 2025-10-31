export function nights(start, end){
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / 86400000));
}

export function defaultBudget(total){
  // Distribuição: 50% hospedagem, 30% comida, 15% transporte, 5% atividades
  const t = Number(total||0);
  return t ? {
    lodging: Math.round(t*0.5),
    food: Math.round(t*0.3),
    transport: Math.round(t*0.15),
    activities: Math.round(t*0.05)
  } : null;
}
