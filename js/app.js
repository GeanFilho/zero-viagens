import { buildPlan } from './itinerary.js';
import { render } from './render.js';

document.getElementById("planner").addEventListener("submit", (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const input = {
    destination: fd.get("dest"),
    start: fd.get("start"),
    end: fd.get("end"),
    people: fd.get("people"),
    interests: fd.getAll("interests"),
    lodging: fd.get("lodging"),
    food: fd.get("food"),
    transport: fd.get("transport"),
    total: fd.get("total")
  };
  const plan = buildPlan(input);
  render(plan);
});
