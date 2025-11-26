export interface HubSpotContact {
    id?: string;
    properties: {
        firstname?: string;
        lastname?: string;
        email?: string;
        jobtitle?: string;
        company?: string;
        phone?: string;
        address?: string;
        createdate?: string;
        hs_object_id?: string;
        lastmodifieddate?: string;
    };
    createdAt?: string;
    updatedAt?: string;
    archived?: boolean;
}