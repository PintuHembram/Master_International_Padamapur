/**
 * Consent-aware service registry.
 *
 * Every optional third-party integration (analytics, advertising, functional
 * extras) MUST be registered here instead of being added directly to
 * index.html or components. The registry only initialises a service after
 * the visitor has granted consent for its category, and never loads the
 * same service twice.
 *
 * There are currently NO registered optional services — a codebase review
 * confirmed the site runs no analytics, advertising or tracking scripts.
 * Administrators must not add a provider here without reviewing its purpose,
 * data handling and consent requirements first.
 */

import type { ConsentCategories, OptionalConsentCategory } from "./config";

export interface ConsentService {
  id: string;
  category: OptionalConsentCategory;
  /** Inject scripts / start the service. Called at most once per page load. */
  load: () => void;
  /** Best-effort teardown when consent is withdrawn (stops future tracking). */
  unload?: () => void;
}

const services: ConsentService[] = [];
const loaded = new Set<string>();

export function registerConsentService(service: ConsentService) {
  if (services.some((s) => s.id === service.id)) return;
  services.push(service);
}

/** Load every service whose category is currently consented to. */
export function syncConsentServices(categories: ConsentCategories) {
  for (const service of services) {
    const granted = categories[service.category] === true;
    if (granted && !loaded.has(service.id)) {
      loaded.add(service.id);
      try {
        service.load();
      } catch (error) {
        console.error(`Consent service "${service.id}" failed to load.`, error);
      }
    } else if (!granted && loaded.has(service.id)) {
      // Consent withdrawn after load: stop future tracking where possible.
      // Scripts already executed cannot be un-run, but no new requests fire.
      try {
        service.unload?.();
      } catch (error) {
        console.error(`Consent service "${service.id}" failed to unload.`, error);
      }
    }
  }
}
