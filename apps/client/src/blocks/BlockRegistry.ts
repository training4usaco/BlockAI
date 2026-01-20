import { Tanh } from "../python-library/activations/Tanh";
import { ReLU } from "../python-library/activations/ReLU";

export interface ActivationConfig {
    type: string; 
    classDef: any;
    name: string;
    gain: string;
}

export const KNOWN_ACTIVATIONS: ActivationConfig[] = [
    { type: 'tanh', classDef: Tanh, name: 'Tanh', gain: '5/3' },
    { type: 'relu', classDef: ReLU, name: 'ReLU', gain: '1.414' }
];

export function getActivationConfig(type: string): ActivationConfig | undefined {
    return KNOWN_ACTIVATIONS.find(act => act.type === type);
}