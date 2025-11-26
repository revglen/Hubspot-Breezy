export interface HubSpotDeal {
    id?: string;
    properties: {
        dealname?: string;
        amount?: string;
        dealstage?: string;
        createdate?: string;
        closedate?: string;
        pipeline?: string;
    };
    associations?: {
        contacts?: {
        results: Array<{ id: string }>;
        };
    };
}
