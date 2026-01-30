export const KaimingNormalization = (linearClass: string, modelName: string, activationChecks: string) => {
    return `for i, layer in enumerate(${modelName}.layers[:-1]):
    if isinstance(layer, ${linearClass}):
        gain = 1.0
        for next_layer in ${modelName}.layers[i+1:]:
            if isinstance(next_layer, ${linearClass}):
                break
${activationChecks}            
        layer.weight *= gain\n`;
}; 