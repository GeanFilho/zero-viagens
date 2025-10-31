import { nights, defaultBudget } from './pricing.js';
import { bookingLink, gygLink } from './affiliates.js';

export function buildPlan(input){
  const n = nights(input.start, input.end);
  const people = Number(input.people||2);
  const budget = normalizeBudget(input, n);

  const areas = suggestAreas(input.dest, budget);
  const picks = {
    lodging: [
      { name:"Hotel prático em Copacabana", area:"Copacabana",
        price_per_night: Math.round(budget.lodging/n/people),
        link: bookingLink("Copacabana Rio de Janeiro") }
    ],
    restaurants: [
      { name:"Boteco Tradicional", avg_ticket: 60, link: "#" },
      { name:"Peixes & Mar", avg_ticket: 90, link: "#" }
    ],
    activities: [
      { name:"Pão de Açúcar", price: 180, slot:"morning", link: gygLink("Pão de Açúcar") },
      { name:"Praia de Ipanema", price: 0, slot:"afternoon", link:"#"}
    ],
    events: input.interests?.includes("futebol") ? [
      { name:"Jogo no Maracanã (placeholder)", date: input.start, price: 120, link:"#"}
    ] : []
  };

  const itinerary = Array.from({length:n}).map((_,i)=>({
    day: i+1,
    am: picks.activities[0]?.name || "Praia",
    lunch: picks.restaurants[0].name,
    pm: picks.activities[1]?.name || "Passeio livre",
    dinner: picks.restaurants[1].name,
    notes: areas[0] ? `Base sugerida: ${areas[0]}` : ""
  }));

  const costs = estimateCosts(budget, n, people, picks);

  return { trip:{ ...input, nights:n, areas }, picks, itinerary, costs };
}

function normalizeBudget(input, n){
  const t = Number(input.total||0);
  if (t && (!input.lodging || !input.food || !input.transport)){
    const d = defaultBudget(t);
    return { lodging:Number(input.lodging||d.lodging),
             food:Number(input.food||d.food),
             transport:Number(input.transport||d.transport),
             activities:Number(input.activities||d.activities||Math.round(t*0.05)) };
  }
  return { lodging:Number(input.lodging||0),
           food:Number(input.food||0),
           transport:Number(input.transport||0),
           activities:Number(input.activities||0) };
}

function suggestAreas(dest, budget){
  if((dest||"").toLowerCase().includes("rio")) return ["Copacabana","Ipanema","Botafogo"];
  return ["Centro"];
}

function estimateCosts(b, n, people, picks){
  const lodging_total = Math.max(0, b.lodging);
  const food_total = Math.max(0, b.food || people*n*120); // fallback
  const transport_total = Math.max(0, b.transport || 80*n);
  const activities_total = Math.max(0,
    picks.activities.reduce((s,a)=> s+(a.price||0),0) + (picks.events[0]?.price||0)
  );
  return {
    lodging_total, food_total, transport_total, activities_total,
    grand_total: lodging_total+food_total+transport_total+activities_total
  };
}
