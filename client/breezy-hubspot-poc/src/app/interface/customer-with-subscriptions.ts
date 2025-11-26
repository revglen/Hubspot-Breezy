import { HubSpotContact } from "./hub-spot-contact";
import { HubSpotDeal } from "./hub-spot-deal";

export interface CustomerWithSubscriptions {
    contact: HubSpotContact;
    activeSubscriptions: HubSpotDeal[];
    totalMonthlyRevenue: number;
}
