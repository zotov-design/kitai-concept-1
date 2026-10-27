// Progressive enhancement: component markup remains visible without JavaScript.
export class NavigationItem extends HTMLElement {}
export class MessengerLink extends HTMLElement {}
export class TravelIcon extends HTMLElement {}
export class TripFact extends HTMLElement {}
export class DestinationRow extends HTMLElement {}
export class TourCard extends HTMLElement {}
for (const [name, component] of [['navigation-item',NavigationItem],['messenger-link',MessengerLink],['travel-icon',TravelIcon],['trip-fact',TripFact],['destination-row',DestinationRow],['tour-card',TourCard]]) {
  if (!customElements.get(name)) customElements.define(name,component);
}
