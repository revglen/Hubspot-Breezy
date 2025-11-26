export interface AIInsight {
    type: 'upsell_opportunity' | 'retention_risk' | 'expansion_opportunity' | 'loyalty_identified';
    message: string;
    confidence: number;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
}
