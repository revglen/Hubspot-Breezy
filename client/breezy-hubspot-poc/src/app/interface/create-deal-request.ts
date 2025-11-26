export interface CreateDealRequest {
    dealProperties: {
        dealname: string;
        amount: string;
        dealstage: string;
        pipeline?: string;
    };
    contactId: string;
}
