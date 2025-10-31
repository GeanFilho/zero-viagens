export const AFF={ booking:{id:"SEU_ID",base:"https://www.booking.com/index.html"},
                   gyg:{id:"SEU_ID",base:"https://www.getyourguide.com/-/l/"} };

export function bookingLink(query){
  return `${AFF.booking.base}?aid=${AFF.booking.id}&ss=${encodeURIComponent(query)}&utm_source=zeroviagens&utm_medium=planner`;
}
export function gygLink(query){
  return `${AFF.gyg.base}?partner_id=${AFF.gyg.id}&q=${encodeURIComponent(query)}&utm_source=zeroviagens`;
}
