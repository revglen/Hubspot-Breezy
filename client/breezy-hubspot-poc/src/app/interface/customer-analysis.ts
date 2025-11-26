import { AIInsight } from './aiinsight';

export interface CustomerAnalysis {
    contact: any;
    deals: any[];
    insights: AIInsight[];
    summary: string;
}
