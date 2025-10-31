export function render(plan){
  const el = document.getElementById("result");
  if(!plan){ el.innerHTML = "<p>Erro ao gerar roteiro.</p>"; return; }
  const { trip, picks, itinerary, costs } = plan;
  el.innerHTML = `
    <h2>Roteiro para ${trip.destination} (${trip.nights} noites)</h2>
    <p>Bairros-base: ${trip.areas.join(", ")}</p>

    <h3>Hospedagem sugerida</h3>
    <ul>${picks.lodging.map(h=>`<li><a href="${h.link}" target="_blank">${h.name}</a> • ~R$ ${h.price_per_night}/noite</li>`).join("")}</ul>

    <h3>Comer & beber</h3>
    <ul>${picks.restaurants.map(r=>`<li>${r.name} • ticket médio ~R$ ${r.avg_ticket}</li>`).join("")}</ul>

    <h3>Atividades</h3>
    <ul>${picks.activities.map(a=>`<li><a href="${a.link}" target="_blank">${a.name}</a> • ${a.price?`R$ ${a.price}`:"Grátis"}</li>`).join("")}</ul>

    ${picks.events.length?`<h3>Eventos</h3><ul>${picks.events.map(e=>`<li>${e.name} • ${e.date} • R$ ${e.price}</li>`).join("")}</ul>`:""}

    <h3>Dia a dia</h3>
    ${itinerary.map(d=>`
      <article>
        <strong>Dia ${d.day}</strong>
        <p>Manhã: ${d.am}</p>
        <p>Almoço: ${d.lunch}</p>
        <p>Tarde: ${d.pm}</p>
        <p>Jantar: ${d.dinner}</p>
        ${d.notes?`<p><em>${d.notes}</em></p>`:""}
      </article>
    `).join("")}

    <h3>Custos estimados</h3>
    <ul>
      <li>Hospedagem: R$ ${costs.lodging_total}</li>
      <li>Alimentação: R$ ${costs.food_total}</li>
      <li>Transporte: R$ ${costs.transport_total}</li>
      <li>Atividades/Ingressos: R$ ${costs.activities_total}</li>
      <li><strong>Total estimado: R$ ${costs.grand_total}</strong></li>
    </ul>

    <button id="buy-pdf">Baixar Roteiro Premium (PDF)</button>
  `;
}
